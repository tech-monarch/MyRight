import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const transition = vi.fn();
const markReady = vi.fn();
const sendInvitation = vi.fn();
const notifyUser = vi.fn();
const getDispute = vi.fn();
const dbUpdate = vi.fn();

vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    dispute: { update: (a: any) => dbUpdate(a) },
    user: { findUnique: vi.fn().mockResolvedValue({ phone: null, email: null, courthouseId: "ch1" }) },
  },
}));
vi.mock("../src/modules/disputes/disputes.service", () => ({
  getDisputeOr404: (id: string) => getDispute(id),
  transitionStatus: (...a: unknown[]) => transition(...a),
  markMediatorAssignedIfReady: (...a: unknown[]) => markReady(...a),
}));
vi.mock("../src/modules/invitations/invitations.service", () => ({ sendInvitation: (a: unknown) => sendInvitation(a) }));
vi.mock("../src/infrastructure/notifications/notification.service", () => ({ notifyUser: (a: unknown) => notifyUser(a) }));
vi.mock("../src/utils/audit-log", () => ({ writeAuditLog: vi.fn() }));

let controller: typeof import("../src/modules/disputes/disputes.controller");
beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.resetModules();
  controller = await import("../src/modules/disputes/disputes.controller");
});

const dispute = (over: Record<string, unknown> = {}) => ({
  id: "d1", title: "Deposit", ownerId: "owner", status: "UNDER_REVIEW", otherPartyContact: null, otherPartyResponse: null, assignment: null, ...over,
});

async function run(body: Record<string, unknown> = {}, userOver: Record<string, unknown> = {}) {
  const req: any = { params: { id: "d1" }, body, user: { id: "owner", role: "DISPUTANT", name: "Ada", ...userOver } };
  let json: any; let error: any;
  const res: any = { json: (v: unknown) => (json = v) };
  await new Promise<void>((resolve) => {
    controller.requestMediation(req, res, (e?: unknown) => { error = e; resolve(); });
    const t = setInterval(() => { if (json || error) { clearInterval(t); resolve(); } }, 2);
  });
  return { json, error };
}

beforeEach(() => {
  [transition, markReady, sendInvitation, notifyUser, getDispute, dbUpdate].forEach((m) => m.mockReset());
  transition.mockImplementation(async (_id: string, _from: string, to: string) => ({ ...dispute(), status: to }));
  dbUpdate.mockImplementation(async ({ data }: any) => ({ ...dispute(), status: "AWAITING_OTHER_PARTY", ...data }));
  markReady.mockImplementation(async (_i: string, status: string) => status);
  sendInvitation.mockResolvedValue({ respondUrl: "https://app/respond/tok" });
});

const moves = () => transition.mock.calls.map((c) => `${c[1]}->${c[2]}`);

describe("requesting mediation", () => {
  it("a fresh case: requests, then invites the other party and waits for them", async () => {
    getDispute.mockResolvedValue(dispute({ status: "UNDER_REVIEW", otherPartyContact: "07012345678" }));
    const { json, error } = await run({ contactMethod: "phone" });
    expect(error).toBeUndefined();
    expect(moves()).toEqual(["UNDER_REVIEW->MEDIATION_REQUESTED", "MEDIATION_REQUESTED->AWAITING_OTHER_PARTY"]);
    expect(sendInvitation).toHaveBeenCalledOnce();
    expect(json.data.inviteUrl).toBe("https://app/respond/tok");
  });

  it("a case ALREADY in MEDIATION_REQUESTED (the stuck state) carries on instead of failing", async () => {
    getDispute.mockResolvedValue(dispute({ status: "MEDIATION_REQUESTED", otherPartyContact: "07012345678" }));
    const { json, error } = await run({ contactMethod: "phone" });
    expect(error).toBeUndefined();
    // Crucially: NO attempt to move MEDIATION_REQUESTED -> MEDIATION_REQUESTED.
    expect(moves()).toEqual(["MEDIATION_REQUESTED->AWAITING_OTHER_PARTY"]);
    expect(sendInvitation).toHaveBeenCalledOnce();
    expect(json.data.inviteUrl).toBeDefined();
  });

  it("a stuck case with no contact given asks nothing of the other party but still lets an assigned mediator proceed", async () => {
    getDispute.mockResolvedValue(dispute({ status: "MEDIATION_REQUESTED", assignment: { lawyerId: "l1" } }));
    const { error } = await run({ contactMethod: "phone" });
    expect(error).toBeUndefined();
    expect(moves()).toEqual([]);
    expect(sendInvitation).not.toHaveBeenCalled();
    expect(markReady).toHaveBeenCalledWith("d1", "MEDIATION_REQUESTED", "owner", null);
  });

  it("a contact given in the request is used for a stuck case", async () => {
    getDispute.mockResolvedValue(dispute({ status: "MEDIATION_REQUESTED" }));
    await run({ contactMethod: "email", contact: "o@x.com" });
    expect(dbUpdate).toHaveBeenCalledWith({ where: { id: "d1" }, data: { otherPartyContact: "o@x.com" } });
    expect(sendInvitation).toHaveBeenCalledWith(expect.objectContaining({ contact: "o@x.com" }));
  });

  it("a case already further along gets a clear message and nothing is sent", async () => {
    for (const status of ["AWAITING_OTHER_PARTY", "MEDIATOR_ASSIGNED", "IN_MEDIATION"]) {
      getDispute.mockResolvedValue(dispute({ status, otherPartyContact: "07012345678" }));
      const { error } = await run({ contactMethod: "phone" });
      expect(error?.message, status).toBe("Mediation has already been requested for this case.");
    }
    expect(sendInvitation).not.toHaveBeenCalled();
    expect(transition).not.toHaveBeenCalled();
  });

  it("only the owner can request mediation", async () => {
    getDispute.mockResolvedValue(dispute());
    const { error } = await run({}, { id: "someone-else" });
    expect(error).toBeDefined();
    expect(transition).not.toHaveBeenCalled();
  });
});
