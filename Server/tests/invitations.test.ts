import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const findInvitation = vi.fn();
const updateMany = vi.fn();
const findDispute = vi.fn();
const historyCreate = vi.fn();
const markReady = vi.fn();
const notifyResponse = vi.fn();

vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    mediationInvitation: { findUnique: (a: unknown) => findInvitation(a), create: vi.fn() },
    dispute: { updateMany: (a: unknown) => updateMany(a), findUniqueOrThrow: (a: unknown) => findDispute(a) },
    disputeStatusHistory: { create: (a: unknown) => historyCreate(a) },
  },
}));
vi.mock("../src/modules/disputes/disputes.service", () => ({
  markMediatorAssignedIfReady: (...a: unknown[]) => markReady(...a),
}));
vi.mock("../src/infrastructure/notifications/notification.service", () => ({
  courthouseIdForDispute: vi.fn().mockResolvedValue(null),
  notifyMediationInvite: vi.fn(),
  notifyInvitationResponse: (a: unknown) => notifyResponse(a),
  splitContact: (c: string) => (c.includes("@") ? { email: c } : { phone: c }),
}));

let svc: typeof import("../src/modules/invitations/invitations.service");
beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.resetModules();
  svc = await import("../src/modules/invitations/invitations.service");
});

const invitation = (over: Record<string, unknown> = {}, dispute: Record<string, unknown> = {}) => ({
  expiresAt: new Date(Date.now() + 86_400_000),
  dispute: {
    id: "d1",
    title: "Deposit dispute",
    description: "PRIVATE one-sided account",
    status: "AWAITING_OTHER_PARTY",
    otherPartyResponse: "PENDING",
    ownerId: "owner",
    owner: { id: "owner", name: "Ada", phone: null, email: null },
    assignment: null,
    ...dispute,
  },
  ...over,
});

beforeEach(() => {
  [findInvitation, updateMany, findDispute, historyCreate, markReady, notifyResponse].forEach((m) => m.mockReset());
  updateMany.mockResolvedValue({ count: 1 });
});

describe("invitation links", () => {
  it("rejects unknown and expired links with the same message", async () => {
    findInvitation.mockResolvedValueOnce(null);
    await expect(svc.getInvitationSummary("nope")).rejects.toThrow(/invalid or has expired/);
    findInvitation.mockResolvedValueOnce(invitation({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(svc.getInvitationSummary("old")).rejects.toThrow(/invalid or has expired/);
  });
  it("shows the other party only the title and who is asking, never the description", async () => {
    findInvitation.mockResolvedValue(invitation());
    const summary = await svc.getInvitationSummary("tok");
    expect(summary).toEqual({ disputeTitle: "Deposit dispute", requesterName: "Ada", response: "PENDING", open: true });
    expect(JSON.stringify(summary)).not.toContain("PRIVATE");
  });
});

describe("responding", () => {
  it("accepting records the answer, notes the history, and lets the case move on if a mediator is assigned", async () => {
    findInvitation.mockResolvedValue(
      invitation({}, { assignment: { lawyer: { id: "l1", phone: null, email: null, courthouseId: "ch1" } } })
    );
    const r = await svc.respondToInvitation("tok", true);
    expect(r).toEqual({ response: "ACCEPTED", alreadyAnswered: false });
    expect(updateMany.mock.calls[0]![0].data.otherPartyResponse).toBe("ACCEPTED");
    expect(historyCreate).toHaveBeenCalled();
    expect(markReady).toHaveBeenCalledWith("d1", "AWAITING_OTHER_PARTY", "owner", "ACCEPTED");
    expect(notifyResponse).toHaveBeenCalledTimes(2); // owner + assigned lawyer
  });
  it("accepting with no mediator yet does not try to move the case", async () => {
    findInvitation.mockResolvedValue(invitation());
    await svc.respondToInvitation("tok", true);
    expect(markReady).not.toHaveBeenCalled();
    expect(notifyResponse).toHaveBeenCalledTimes(1); // owner only
  });
  it("declining never advances the case", async () => {
    findInvitation.mockResolvedValue(invitation({}, { assignment: { lawyer: { id: "l1", phone: null, email: null, courthouseId: "ch1" } } }));
    expect(await svc.respondToInvitation("tok", false)).toEqual({ response: "DECLINED", alreadyAnswered: false });
    expect(markReady).not.toHaveBeenCalled();
  });
  it("an answer is final: a second visit shows it and changes nothing", async () => {
    findInvitation.mockResolvedValue(invitation({}, { otherPartyResponse: "DECLINED" }));
    expect(await svc.respondToInvitation("tok", true)).toEqual({ response: "DECLINED", alreadyAnswered: true });
    expect(updateMany).not.toHaveBeenCalled();
  });
  it("a double click that loses the race changes nothing and notifies no one twice", async () => {
    findInvitation.mockResolvedValue(invitation());
    updateMany.mockResolvedValue({ count: 0 });
    findDispute.mockResolvedValue({ otherPartyResponse: "ACCEPTED" });
    expect(await svc.respondToInvitation("tok", true)).toEqual({ response: "ACCEPTED", alreadyAnswered: true });
    expect(notifyResponse).not.toHaveBeenCalled();
  });
  it("refuses once the case is no longer waiting on them", async () => {
    findInvitation.mockResolvedValue(invitation({}, { status: "IN_MEDIATION", otherPartyResponse: null }));
    await expect(svc.respondToInvitation("tok", true)).rejects.toThrow(/no longer waiting/);
  });
});
