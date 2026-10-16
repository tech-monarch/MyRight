import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const historyCreate = vi.fn();
const disputeUpdate = vi.fn();
vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    $transaction: async (fn: (tx: unknown) => unknown) =>
      fn({ dispute: { update: disputeUpdate }, disputeStatusHistory: { create: historyCreate } }),
  },
}));

let svc: typeof import("../src/modules/disputes/disputes.service");
beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.resetModules();
  svc = await import("../src/modules/disputes/disputes.service");
});
beforeEach(() => {
  historyCreate.mockReset();
  disputeUpdate.mockReset().mockImplementation(async ({ data }: { data: { status: string } }) => ({ status: data.status }));
});

const walk = async (from: string, steps: string[]) => {
  let cur = from;
  for (const next of steps) {
    await svc.transitionStatus("d1", cur as never, next as never, "u1");
    cur = next;
  }
};

describe("case status flow", () => {
  it("full path with an other-party contact reaches RESOLVED", async () => {
    await expect(
      walk("UNDER_REVIEW", ["MEDIATION_REQUESTED", "AWAITING_OTHER_PARTY", "MEDIATOR_ASSIGNED", "IN_MEDIATION", "RESOLVED"])
    ).resolves.toBeUndefined();
  });
  it("path without an other-party contact skips straight to MEDIATOR_ASSIGNED", async () => {
    await expect(walk("MEDIATION_REQUESTED", ["MEDIATOR_ASSIGNED", "IN_MEDIATION", "RESOLVED"])).resolves.toBeUndefined();
  });
  it("still refuses nonsense jumps", async () => {
    await expect(walk("MEDIATION_REQUESTED", ["IN_MEDIATION"])).rejects.toThrow();
    await expect(walk("DRAFT", ["RESOLVED"])).rejects.toThrow();
  });
  it("markMediatorAssignedIfReady only acts once mediation was requested", async () => {
    expect(await svc.markMediatorAssignedIfReady("d1", "UNDER_REVIEW", "u1")).toBe("UNDER_REVIEW");
    expect(disputeUpdate).not.toHaveBeenCalled();
    expect(await svc.markMediatorAssignedIfReady("d1", "MEDIATION_REQUESTED", "u1")).toBe("MEDIATOR_ASSIGNED");
    expect(await svc.markMediatorAssignedIfReady("d1", "AWAITING_OTHER_PARTY", "u1")).toBe("MEDIATOR_ASSIGNED");
    expect(await svc.markMediatorAssignedIfReady("d1", "IN_MEDIATION", "u1")).toBe("IN_MEDIATION");
    expect(historyCreate).toHaveBeenCalledTimes(2);
  });
});
