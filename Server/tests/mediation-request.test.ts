import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const transition = vi.fn();
const markReady = vi.fn();
const sendInvitation = vi.fn();
const notify = vi.fn();
const disputeUpdate = vi.fn();
const disputeReload = vi.fn();
const findLawyer = vi.fn();

vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    dispute: { update: (a: unknown) => disputeUpdate(a), findUniqueOrThrow: (a: unknown) => disputeReload(a) },
    user: { findUnique: (a: unknown) => findLawyer(a) },
  },
}));
vi.mock("../src/modules/disputes/disputes.service", () => ({
  transitionStatus: (...a: unknown[]) => transition(...a),
  markMediatorAssignedIfReady: (...a: unknown[]) => markReady(...a),
  getDisputeOr404: vi.fn(),
}));
vi.mock("../src/modules/invitations/invitations.service", () => ({ sendInvitation: (a: unknown) => sendInvitation(a) }));
vi.mock("../src/infrastructure/notifications/notification.service", () => ({ notifyUser: (a: unknown) => notify(a) }));

let svc: typeof import("../src/modules/disputes/mediation-request.service");
let AppError: typeof import("../src/utils/AppError").AppError;

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.resetModules();
  svc = await import("../src/modules/disputes/mediation-request.service");
  ({ AppError } = await import("../src/utils/AppError"));
});

const dispute = (over: Record<string, unknown> = {}) =>
  ({ id: "d1", title: "Deposit", ownerId: "owner", status: "UNDER_REVIEW", otherPartyContact: null, otherPartyResponse: null, assignment: null, ...over }) as never;
const req = (d: unknown, extra: Record<string, unknown> = {}) =>
  svc.requestMediation({ dispute: d as never, requesterId: "owner", requesterName: "Ada", contactMethod: "email", ...extra });

beforeEach(() => {
  [transition, markReady, sendInvitation, notify, disputeUpdate, disputeReload, findLawyer].forEach((m) => m.mockReset());
  // transitionStatus returns the case in its new state.
  transition.mockImplementation(async (_id: string, _from: string, to: string) => ({ id: "d1", status: to, otherPartyContact: "o@x.com", otherPartyResponse: null }));
  // Faithful to the real database: filling in a contact changes nothing else; recording the
  // pending invitation is what marks the case as waiting.
  disputeUpdate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
    "otherPartyContact" in data
      ? { id: "d1", status: "MEDIATION_REQUESTED", otherPartyResponse: null, ...data }
      : { id: "d1", status: "AWAITING_OTHER_PARTY", otherPartyContact: "o@x.com", ...data }
  );
  markReady.mockImplementation(async (_i: string, status: string) => status);
  sendInvitation.mockResolvedValue({ respondUrl: "https://app/respond/tok" });
  findLawyer.mockResolvedValue({ phone: null, email: null, courthouseId: "ch1" });
});

const moves = () => transition.mock.calls.map((c) => `${c[1]}->${c[2]}`);

describe("first request", () => {
  it("with an other-party contact: requests, invites once, and waits for their answer", async () => {
    const r = await req(dispute(), { contact: "o@x.com" });
    expect(moves()).toEqual(["UNDER_REVIEW->MEDIATION_REQUESTED", "MEDIATION_REQUESTED->AWAITING_OTHER_PARTY"]);
    expect(sendInvitation).toHaveBeenCalledTimes(1);
    expect(r).toMatchObject({ inviteUrl: "https://app/respond/tok", alreadyRequested: false });
  });
  it("with no contact at all: just requests, nobody to invite", async () => {
    transition.mockImplementation(async (_i: string, _f: string, to: string) => ({ id: "d1", status: to, otherPartyContact: null, otherPartyResponse: null }));
    const r = await req(dispute());
    expect(moves()).toEqual(["UNDER_REVIEW->MEDIATION_REQUESTED"]);
    expect(sendInvitation).not.toHaveBeenCalled();
    expect(r.alreadyRequested).toBe(false);
  });
  it("uses the intake contact when none is given now, and never overwrites it", async () => {
    await req(dispute({ otherPartyContact: "intake@x.com" }), { contact: "new@x.com" });
    expect(sendInvitation.mock.calls[0]![0].contact).toBe("new@x.com"); // the one given now is who is invited
    expect(disputeUpdate.mock.calls.some((c) => c[0].data.otherPartyContact)).toBe(false); // intake data untouched
  });
  it("alerts an already-assigned mediator exactly once", async () => {
    await req(dispute({ assignment: { lawyerId: "l1" } }), { contact: "o@x.com" });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0]![0]).toMatchObject({ userId: "l1", template: "mediation_requested" });
  });
});

describe("a case already stuck in MEDIATION_REQUESTED (the reported bug)", () => {
  it("does NOT try to move into the state it is already in, and sends the missing invitation", async () => {
    const r = await req(dispute({ status: "MEDIATION_REQUESTED" }), { contact: "o@x.com" });
    expect(moves()).toEqual(["MEDIATION_REQUESTED->AWAITING_OTHER_PARTY"]);
    expect(sendInvitation).toHaveBeenCalledTimes(1);
    expect(r.alreadyRequested).toBe(false);
  });
  it("uses the intake contact for the stuck case when the request carries none", async () => {
    await req(dispute({ status: "MEDIATION_REQUESTED", otherPartyContact: "intake@x.com" }));
    expect(sendInvitation.mock.calls[0]![0].contact).toBe("intake@x.com");
  });
  it("does not re-alert the mediator when resuming (they were not told 'requested' twice)", async () => {
    await req(dispute({ status: "MEDIATION_REQUESTED", assignment: { lawyerId: "l1" } }), { contact: "o@x.com" });
    expect(notify).not.toHaveBeenCalled();
  });
  it("with nobody to invite and a mediator assigned, it just completes the move to MEDIATOR_ASSIGNED", async () => {
    const r = await req(dispute({ status: "MEDIATION_REQUESTED", assignment: { lawyerId: "l1" } }));
    expect(moves()).toEqual([]);
    expect(sendInvitation).not.toHaveBeenCalled();
    expect(markReady).toHaveBeenCalled();
    expect(r.alreadyRequested).toBe(true);
  });
});

describe("requesting the same case twice", () => {
  for (const status of ["AWAITING_OTHER_PARTY", "MEDIATOR_ASSIGNED", "IN_MEDIATION"]) {
    it(`when it is already ${status}: a clear message, and nothing changes or is sent`, async () => {
      await expect(
        req(dispute({ status, otherPartyResponse: "PENDING", assignment: { lawyerId: "l1" } }), { contact: "o@x.com" })
      ).rejects.toThrow("Mediation has already been requested for this case.");
      expect(transition).not.toHaveBeenCalled();
      expect(sendInvitation).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    });
  }
  it("a second request after the first completed is refused, with still just the one invitation sent", async () => {
    const first = await req(dispute(), { contact: "o@x.com" });
    expect(first.alreadyRequested).toBe(false);
    await expect(
      req(dispute({ status: "AWAITING_OTHER_PARTY", otherPartyContact: "o@x.com", otherPartyResponse: "PENDING" }), { contact: "o@x.com" })
    ).rejects.toThrow(/already been requested/);
    expect(sendInvitation).toHaveBeenCalledTimes(1);
  });
  it("two clicks at the same instant: the loser gets a graceful repeat, not an error and not a second invitation", async () => {
    transition.mockRejectedValueOnce(AppError.conflict("This case was just updated."));
    disputeReload.mockResolvedValue({ id: "d1", status: "MEDIATION_REQUESTED" });
    const r = await req(dispute(), { contact: "o@x.com" });
    expect(r.alreadyRequested).toBe(true);
    expect(sendInvitation).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });
  it("a race on the invitation step is handled the same way", async () => {
    transition.mockRejectedValueOnce(AppError.conflict("This case was just updated."));
    disputeReload.mockResolvedValue({ id: "d1", status: "AWAITING_OTHER_PARTY" });
    const r = await req(dispute({ status: "MEDIATION_REQUESTED" }), { contact: "o@x.com" });
    expect(r.alreadyRequested).toBe(true);
    expect(sendInvitation).not.toHaveBeenCalled();
  });
  it("real errors still surface (only a conflict is treated as a repeat)", async () => {
    transition.mockRejectedValueOnce(new Error("database exploded"));
    await expect(req(dispute(), { contact: "o@x.com" })).rejects.toThrow("database exploded");
  });
});

describe("cases that can't request mediation", () => {
  it("a draft must be submitted first, with a clear message", async () => {
    await expect(req(dispute({ status: "DRAFT" }))).rejects.toThrow(/Submit your case/);
  });
  it("closed cases say so", async () => {
    await expect(req(dispute({ status: "RESOLVED" }))).rejects.toThrow(/closed/);
    await expect(req(dispute({ status: "WITHDRAWN" }))).rejects.toThrow(/closed/);
  });
});
