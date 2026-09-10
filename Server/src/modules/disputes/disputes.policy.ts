import type { AuthenticatedUser } from "@/types/express";
import type { CaseAssignment, Dispute } from "@prisma/client";

type AssignmentWithLawyer = CaseAssignment & { lawyer: { courthouseId: string | null } };

/**
 * The single function every dispute-reading route calls before returning
 * data. Centralizing it here means the "can lawyer A see case 124" rule
 * is defined once, not re-derived (and potentially re-derived wrong) in
 * every controller.
 *
 * IMPORTANT: this only decides whether to return data that has already
 * been fetched. Every dispute route must still fetch by the dispute's own
 * id (never trust a courthouse/lawyer id from the request to pre-filter)
 * and then call this function, so a denied check fails closed.
 */
export function canAccessDispute(
  user: AuthenticatedUser,
  dispute: Dispute,
  assignment: AssignmentWithLawyer | null
): boolean {
  if (user.role === "DISPUTANT") {
    return dispute.ownerId === user.id;
  }

  if (user.role === "LAWYER") {
    return assignment?.lawyerId === user.id;
  }

  if (user.role === "SUPERADMIN") {
    // A SuperAdmin can review cases in their own courthouse, plus
    // unassigned cases so they have something to triage and assign.
    // Known limitation: in a multi-courthouse deployment, every
    // unassigned case is currently visible to every courthouse's
    // SuperAdmin until it is claimed. Acceptable for a single-courthouse
    // launch, flagged in the README as something to revisit before
    // onboarding a second courthouse.
    if (!assignment) return true;
    return assignment.lawyer.courthouseId === user.courthouseId;
  }

  return false;
}

export function canModifyDispute(user: AuthenticatedUser, dispute: Dispute): boolean {
  if (user.role !== "DISPUTANT") return false;
  if (dispute.ownerId !== user.id) return false;
  return dispute.status === "DRAFT" || dispute.status === "UNDER_REVIEW";
}
