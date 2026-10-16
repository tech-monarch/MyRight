import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/utils/AppError";
import type { DisputeStatus, Prisma } from "@prisma/client";

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
    const dispute = await tx.dispute.update({
      where: { id: disputeId },
      data: { status: nextStatus },
    });
    await tx.disputeStatusHistory.create({
      data: { disputeId, status: nextStatus, changedById, note },
    });
    return dispute;
  });
}

/**
 * Moves a case to MEDIATOR_ASSIGNED once a mediator is on it AND mediation
 * has been requested. Does nothing for any other status (e.g. a lawyer
 * assigned while the case is still UNDER_REVIEW stays UNDER_REVIEW until the
 * owner actually requests mediation), so it is safe to call from both
 * "lawyer assigned" and "mediation requested", whichever happens second.
 * Returns the status the case is in afterwards.
 */
export async function markMediatorAssignedIfReady(
  disputeId: string,
  currentStatus: DisputeStatus,
  changedById: string
): Promise<DisputeStatus> {
  if (currentStatus !== "MEDIATION_REQUESTED" && currentStatus !== "AWAITING_OTHER_PARTY") return currentStatus;
  await transitionStatus(disputeId, currentStatus, "MEDIATOR_ASSIGNED", changedById, "Mediator assigned");
  return "MEDIATOR_ASSIGNED";
}
