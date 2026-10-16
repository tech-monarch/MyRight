import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const logCreate = vi.fn().mockResolvedValue({});
vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: { notificationLog: { create: (a: unknown) => logCreate(a) } },
}));
const waSend = vi.fn();
vi.mock("../src/infrastructure/notifications/whatsapp.provider", () => ({
  whatsAppProvider: { sendMessage: (to: string, m: string) => waSend(to, m), isReady: () => true },
}));

let svc: typeof import("../src/infrastructure/notifications/notification.service");
let emailMod: typeof import("../src/infrastructure/notifications/email.provider");

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", "MyRight <noreply@example.com>");
  vi.resetModules();
  emailMod = await import("../src/infrastructure/notifications/email.provider");
  svc = await import("../src/infrastructure/notifications/notification.service");
});
beforeEach(() => {
  logCreate.mockClear();
  waSend.mockReset().mockResolvedValue({ sent: true });
});
afterEach(() => vi.unstubAllGlobals());

const logged = () => logCreate.mock.calls.map((c) => c[0].data);

describe("contact helpers", () => {
  it("routes @ to email and anything else to phone", () => {
    expect(svc.splitContact("a@b.com")).toEqual({ email: "a@b.com" });
    expect(svc.splitContact("0803 000 1111")).toEqual({ phone: "0803 000 1111" });
    expect(svc.splitContact("  ")).toEqual({});
    expect(svc.splitContact(null)).toEqual({});
  });
  it("normalizes Nigerian local numbers for WhatsApp", () => {
    expect(svc.normalizePhone("08030001111")).toBe("2348030001111");
    expect(svc.normalizePhone("0803-000-1111")).toBe("2348030001111");
    expect(svc.normalizePhone("+234 803 000 1111")).toBe("2348030001111");
    expect(svc.normalizePhone("2348030001111")).toBe("2348030001111");
  });
});

describe("email provider", () => {
  it("sends through Resend's HTTPS API with a bearer key and a timeout", async () => {
    const f = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", f);
    const r = await emailMod.emailProvider.sendEmail({ to: "x@y.com", subject: "S", text: "hi <b>" });
    expect(r.sent).toBe(true);
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["x@y.com"]);
    expect(body.html).toContain("&lt;b&gt;"); // HTML-escaped, no injection
  });
  it("returns (not throws) on a provider rejection or network failure, and never retries", async () => {
    const f = vi.fn().mockResolvedValue(new Response('{"message":"domain not verified"}', { status: 403 }));
    vi.stubGlobal("fetch", f);
    const r = await emailMod.emailProvider.sendEmail({ to: "x@y.com", subject: "S", text: "t" });
    expect(r.sent).toBe(false);
    expect(r.error).toContain("403");
    expect(f).toHaveBeenCalledTimes(1);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect((await emailMod.emailProvider.sendEmail({ to: "x@y.com", subject: "S", text: "t" })).sent).toBe(false);
  });
});

describe("notification fan-out", () => {
  it("sends on both channels when a user has phone and email, logging each", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await svc.notifyLawyerAssigned({ lawyerId: "l1", phone: "08030001111", email: "l@x.com", disputeTitle: "T" });
    expect(waSend).toHaveBeenCalledWith("2348030001111", expect.stringContaining("assigned"));
    expect(logged().map((l) => `${l.channel}:${l.status}`).sort()).toEqual(["EMAIL:SENT", "WHATSAPP:SENT"]);
  });
  it("email-only contact never touches WhatsApp", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await svc.notifyMediationInvite({ ...svc.splitContact("o@x.com"), requesterName: "Ada", disputeTitle: "T" });
    expect(waSend).not.toHaveBeenCalled();
    expect(logged()).toEqual([expect.objectContaining({ channel: "EMAIL", status: "SENT", recipient: "o@x.com" })]);
  });
  it("logs SKIPPED when there is no contact at all, and FAILED when WhatsApp fails", async () => {
    await svc.notifyLawyerAssigned({ lawyerId: "l1", disputeTitle: "T" });
    expect(logged()[0]).toMatchObject({ status: "SKIPPED" });
    logCreate.mockClear();
    waSend.mockResolvedValue({ sent: false, error: "WhatsApp is not connected." });
    await svc.notifyLawyerAssigned({ lawyerId: "l1", phone: "08030001111", disputeTitle: "T" });
    expect(logged()[0]).toMatchObject({ channel: "WHATSAPP", status: "FAILED" });
  });
  it("never throws even if the WhatsApp provider throws", async () => {
    waSend.mockRejectedValue(new Error("socket exploded"));
    await expect(svc.notifyLawyerAssigned({ lawyerId: "l1", phone: "08030001111", disputeTitle: "T" })).resolves.toBeUndefined();
  });
  it("tells the other party they will wait in a lobby", async () => {
    await svc.notifySessionScheduled({ phone: "08030001111", disputeTitle: "T", scheduledStart: new Date(), meetingUrl: "https://x.daily.co/r", isOtherParty: true });
    expect(waSend.mock.calls[0]![1]).toContain("lobby");
  });
});
