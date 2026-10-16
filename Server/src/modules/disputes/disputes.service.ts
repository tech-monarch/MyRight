import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/utils/AppError";
import type { DisputeStatus, PartyResponse, Prisma } from "@prisma/client";

export function findDisputeWithAssignment(id: string) {
  return prisma.dispute.findUnique({
    where: { id, deletedAt: null },
    include: { assignment: { include: { lawyer: { select: { courthouseId: true } } } } },
  });
}

export async function getDisputeOr404(id: string) {
  const dispute = await findDisputeWithAssignment(id);
  if (!dispute) throw AppError.notFound("Dispute not found");
  return dispute;
}

export function listDisputesForOwner(ownerId: string) {
  return prisma.dispute.findMany({
    where: { ownerId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
}

export function listDisputesForLawyer(lawyerId: string) {
  return prisma.dispute.findMany({
    where: { deletedAt: null, assignment: { lawyerId } },
    orderBy: { updatedAt: "desc" },
  });
}

export function listDisputesForCourthouse(courthouseId: string) {
  return prisma.dispute.findMany({
    where: {
      deletedAt: null,
      OR: [{ assignment: { lawyer: { courthouseId } } }, { assignment: null }],
    },
    orderBy: { updatedAt: "desc" },
    include: { assignment: { include: { lawyer: { select: { name: true } } } } },
  });
}

export function listStatusHistory(disputeId: string) {
  return prisma.disputeStatusHistory.findMany({
    where: { disputeId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createDispute(ownerId: string, input: {
  title: string;
  description: string;
  type: string;
  otherPartyName?: string;
  otherPartyContact?: string;
  desiredOutcome?: string;
}) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const dispute = await tx.dispute.create({
      data: { ownerId, status: "UNDER_REVIEW", ...input },
    });
    await tx.disputeStatusHistory.create({
      data: { disputeId: dispute.id, status: dispute.status, changedById: ownerId },
    });
    return dispute;
  });
}

export async function updateDispute(id: string, input: Partial<{
  title: string;
  description: string;
  type: string;
  otherPartyName: string;
  otherPartyContact: string;
  desiredOutcome: string;
}>) {
  return prisma.dispute.update({ where: { id }, data: input });
}

// Explicit allowed transitions rather than letting any status be set from
// the API: a dispute cannot jump from DRAFT straight to RESOLVED, for
// example, without going through the intermediate steps that actually
// happened.
const ALLOWED_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  DRAFT: ["UNDER_REVIEW", "WITHDRAWN"],
  UNDER_REVIEW: ["MEDIATION_REQUESTED", "WITHDRAWN"],
  // MEDIATOR_ASSIGNED is allowed directly from here too: a case with no
  // other-party contact never passes through AWAITING_OTHER_PARTY.
  MEDIATION_REQUESTED: ["AWAITING_OTHER_PARTY", "MEDIATOR_ASSIGNED", "WITHDRAWN"],
  AWAITING_OTHER_PARTY: ["MEDIATOR_ASSIGNED", "WITHDRAWN"],
  MEDIATOR_ASSIGNED: ["IN_MEDIATION", "WITHDRAWN"],
  IN_MEDIATION: ["RESOLVED", "WITHDRAWN"],
  RESOLVED: [],
  WITHDRAWN: [],
};

export async function transitionStatus(
  disputeId: string,
  currentStatus: DisputeStatus,
  nextStatus: DisputeStatus,
  changedById: string,
  note?: string
) {
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowedNextStatuses.includes(nextStatus)) {
    throw AppError.badRequest(`Cannot move a case from ${currentStatus} to ${nextStatus}`);
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Compare-and-set: only move the case if it is STILL in the status the
    // caller saw. Two requests racing (a double click, two tabs) can't both
    // win, so the history and any follow-up notifications happen once.
    const moved = await tx.dispute.updateMany({
      where: { id: disputeId, status: currentStatus },
      data: { status: nextStatus },
    });
    if (moved.count === 0) {
      throw AppError.conflict("This case was just updated. Please refresh and try again.");
    }
    await tx.disputeStatusHistory.create({
      data: { disputeId, status: nextStatus, changedById, note },
    });
    return tx.dispute.findUniqueOrThrow({ where: { id: disputeId } });
  });
}

/**
 * Moves a case to MEDIATOR_ASSIGNED once a mediator is on it AND mediation
 * can proceed. Mediation can proceed when the case has no other-party invite
 * (MEDIATION_REQUESTED), or the other party has ACCEPTED (from
 * AWAITING_OTHER_PARTY). A case still waiting on, or declined by, the other
 * party stays put. Does nothing for any other status, so it is safe to call
 * from "lawyer assigned", "mediation requested" and "invitation accepted",
 * whichever happens last. Returns the status the case is in afterwards.
 */
export async function markMediatorAssignedIfReady(
  disputeId: string,
  currentStatus: DisputeStatus,
  changedById: string,
  otherPartyResponse?: PartyResponse | null
): Promise<DisputeStatus> {
  const canProceed =
    currentStatus === "MEDIATION_REQUESTED" ||
    (currentStatus === "AWAITING_OTHER_PARTY" && otherPartyResponse === "ACCEPTED");
  if (!canProceed) return currentStatus;
  await transitionStatus(disputeId, currentStatus, "MEDIATOR_ASSIGNED", changedById, "Mediator assigned");
  return "MEDIATOR_ASSIGNED";
}
