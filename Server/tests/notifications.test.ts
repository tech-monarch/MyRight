import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const logCreate = vi.fn().mockResolvedValue({});
const inAppCreate = vi.fn().mockResolvedValue({});
vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    notificationLog: { create: (a: unknown) => logCreate(a) },
    notification: { create: (a: unknown) => inAppCreate(a) },
    caseAssignment: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));
const waSend = vi.fn();
vi.mock("../src/infrastructure/notifications/whatsapp.provider", () => ({
  whatsAppManager: { sendFor: (c: unknown, to: string, m: string) => waSend(c, to, m) },
}));

let svc: typeof import("../src/infrastructure/notifications/notification.service");
let emailMod: typeof import("../src/infrastructure/notifications/email.provider");

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", "MyRight <noreply@example.com>");
  vi.stubEnv("APP_URL", "https://app.example.com");
  vi.resetModules();
  emailMod = await import("../src/infrastructure/notifications/email.provider");
  svc = await import("../src/infrastructure/notifications/notification.service");
});
beforeEach(() => {
  logCreate.mockClear();
  inAppCreate.mockClear();
  waSend.mockReset().mockResolvedValue({ sent: true });
});
afterEach(() => vi.unstubAllGlobals());

const logged = () => logCreate.mock.calls.map((c) => c[0].data);
const okFetch = () => vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));

describe("contact helpers", () => {
  it("routes @ to email and anything else to phone", () => {
    expect(svc.splitContact("a@b.com")).toEqual({ email: "a@b.com" });
    expect(svc.splitContact("0803 000 1111")).toEqual({ phone: "0803 000 1111" });
    expect(svc.splitContact("  ")).toEqual({});
    expect(svc.splitContact(null)).toEqual({});
  });
  it("normalizes Nigerian local numbers for WhatsApp", () => {
    expect(svc.normalizePhone("07012345678")).toBe("2347012345678");
    expect(svc.normalizePhone("0803-000-1111")).toBe("2348030001111");
    expect(svc.normalizePhone("+234 803 000 1111")).toBe("2348030001111");
    expect(svc.normalizePhone("2348030001111")).toBe("2348030001111");
  });
});

describe("email provider", () => {
  it("sends through Resend's HTTPS API with a bearer key, HTML-escaped", async () => {
    const f = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", f);
    const r = await emailMod.emailProvider.sendEmail({ to: "x@y.com", subject: "S", text: "hi <b>" });
    expect(r.sent).toBe(true);
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body).html).toContain("&lt;b&gt;");
  });
  it("returns (not throws) on rejection or network failure, and never retries", async () => {
    const f = vi.fn().mockResolvedValue(new Response('{"message":"domain not verified"}', { status: 403 }));
    vi.stubGlobal("fetch", f);
    const r = await emailMod.emailProvider.sendEmail({ to: "x@y.com", subject: "S", text: "t" });
    expect(r).toMatchObject({ sent: false });
    expect(f).toHaveBeenCalledTimes(1);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect((await emailMod.emailProvider.sendEmail({ to: "x@y.com", subject: "S", text: "t" })).sent).toBe(false);
  });
});

describe("notification fan-out", () => {
  it("creates an in-app notification and sends on both channels, logging each", async () => {
    okFetch();
    await svc.notifyLawyerAssigned({ lawyerId: "l1", phone: "07012345678", email: "l@x.com", courthouseId: "ch1", disputeId: "d1", disputeTitle: "T" });
    expect(inAppCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: "l1", type: "lawyer_assigned", link: "/lawyer/cases/d1" }) });
    // WhatsApp is sent for the right courthouse, to a normalized number, with a full link appended.
    expect(waSend).toHaveBeenCalledWith("ch1", "2347012345678", expect.stringContaining("https://app.example.com/lawyer/cases/d1"));
    expect(logged().map((l) => `${l.channel}:${l.status}`).sort()).toEqual(["EMAIL:SENT", "WHATSAPP:SENT"]);
  });
  it("a person without an account gets no in-app item but still gets their message", async () => {
    okFetch();
    await svc.notifyMediationInvite({ ...svc.splitContact("o@x.com"), requesterName: "Ada", disputeTitle: "T", respondUrl: "https://app.example.com/respond/abc" });
    expect(inAppCreate).not.toHaveBeenCalled();
    expect(waSend).not.toHaveBeenCalled();
    expect(logged()).toEqual([expect.objectContaining({ channel: "EMAIL", status: "SENT", recipient: "o@x.com" })]);
  });
  it("the invitation message carries the accept/decline link", async () => {
    await svc.notifyMediationInvite({ phone: "07012345678", requesterName: "Ada", disputeTitle: "T", respondUrl: "https://app.example.com/respond/abc" });
    expect(waSend.mock.calls[0]![2]).toContain("https://app.example.com/respond/abc");
  });
  it("account-created notices never include a password", async () => {
    await svc.notifyAccountCreated({ userId: "u1", phone: "07012345678", name: "Ngozi", username: "ngozi.a", roleLabel: "lawyer" });
    const msg = waSend.mock.calls[0]![2] as string;
    expect(msg).toContain("ngozi.a");
    expect(msg.toLowerCase()).not.toMatch(/password: |temp(orary)? password is/);
  });
  it("logs SKIPPED with no contact, FAILED when WhatsApp fails", async () => {
    await svc.notifyLawyerAssigned({ lawyerId: "l1", disputeId: "d1", disputeTitle: "T" });
    expect(logged()[0]).toMatchObject({ status: "SKIPPED" });
    logCreate.mockClear();
    waSend.mockResolvedValue({ sent: false, error: "No WhatsApp number is connected." });
    await svc.notifyLawyerAssigned({ lawyerId: "l1", phone: "07012345678", disputeId: "d1", disputeTitle: "T" });
    expect(logged()[0]).toMatchObject({ channel: "WHATSAPP", status: "FAILED" });
  });
  it("never throws, even if the provider or the database throws", async () => {
    waSend.mockRejectedValue(new Error("socket exploded"));
    inAppCreate.mockRejectedValueOnce(new Error("db down"));
    await expect(svc.notifyLawyerAssigned({ lawyerId: "l1", phone: "07012345678", disputeId: "d1", disputeTitle: "T" })).resolves.toBeUndefined();
  });
  it("tells the other party they will wait in a lobby", async () => {
    await svc.notifySessionScheduled({ phone: "07012345678", disputeTitle: "T", scheduledStart: new Date(), meetingUrl: "https://x.daily.co/r", isOtherParty: true });
    expect(waSend.mock.calls[0]![2]).toContain("lobby");
  });
});
