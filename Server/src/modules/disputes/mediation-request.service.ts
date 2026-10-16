import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/utils/AppError";
import * as disputesService from "@/modules/disputes/disputes.service";
import * as invitationsService from "@/modules/invitations/invitations.service";
import { notifyUser } from "@/infrastructure/notifications/notification.service";

type DisputeWithAssignment = Awaited<ReturnType<typeof disputesService.getDisputeOr404>>;

export interface MediationRequestResult {
  dispute: Awaited<ReturnType<typeof disputesService.transitionStatus>> | DisputeWithAssignment;
  /** The link the other party was sent, so the owner can share it by hand if delivery fails. */
  inviteUrl?: string;
  /** True when this call changed nothing (a repeat request); callers must not log or announce it again. */
  alreadyRequested: boolean;
}

const isConflict = (err: unknown) => err instanceof AppError && err.statusCode === 409;

/**
 * Requests mediation for a case, safely repeatable.
 *
 *  - UNDER_REVIEW: the normal first request.
 *  - MEDIATION_REQUESTED: either just now, or left there by an earlier
 *    version that never sent the invitation. If there is an other-party
 *    contact that hasn't been invited yet, it is invited now (this is what
 *    un-sticks those cases); otherwise there is nothing to do.
 *  - Anything further along (waiting on the other party, mediator assigned,
 *    in mediation): refused with a plain message, nothing is sent again.
 *    The invitation can be resent from the case page.
 *  - Two requests arriving at the same instant (double click, two tabs): one
 *    wins; the other gets a graceful "already requested" result, not an error.
 *
 * The lawyer is only alerted on the genuine first request, never on a repeat.
 */
export async function requestMediation(input: {
  dispute: DisputeWithAssignment;
  requesterId: string;
  requesterName: string;
  contactMethod?: string;
  contact?: string;
}): Promise<MediationRequestResult> {
  const { dispute } = input;

  if (dispute.status === "DRAFT") {
    throw AppError.badRequest("Submit your case for review before requesting mediation.");
  }
  if (dispute.status === "RESOLVED" || dispute.status === "WITHDRAWN") {
    throw AppError.badRequest("This case is closed, so mediation can't be requested.");
  }

  // Already under way: say so plainly rather than silently doing nothing. The
  // invitation can be resent from the case page.
  if (dispute.status === "AWAITING_OTHER_PARTY" || dispute.status === "MEDIATOR_ASSIGNED" || dispute.status === "IN_MEDIATION") {
    throw AppError.badRequest("Mediation has already been requested for this case.");
  }

  const newContact = input.contact?.trim() || undefined;
  const reload = () => prisma.dispute.findUniqueOrThrow({ where: { id: dispute.id } });
  let current: MediationRequestResult["dispute"] = dispute;
  let firstRequest = false;

  if (dispute.status === "UNDER_REVIEW") {
    try {
      current = await disputesService.transitionStatus(
        dispute.id,
        "UNDER_REVIEW",
        "MEDIATION_REQUESTED",
        input.requesterId,
        newContact ? `Invited other party via ${input.contactMethod}: ${newContact}` : undefined
      );
      firstRequest = true;
    } catch (err) {
      // Someone (a double click, another tab) got there first. Same outcome, nothing more to do.
      if (isConflict(err)) return { dispute: await reload(), alreadyRequested: true };
      throw err;
    }
  }

  // Already past this stage: the invitation is out, or a mediator is on it.
  if (current.status !== "MEDIATION_REQUESTED") return { dispute: current, alreadyRequested: true };

  // Use the contact given now, falling back to the one collected at intake.
  // Only fill otherPartyContact when it was empty; never overwrite intake data.
  if (newContact && !current.otherPartyContact) {
    current = await prisma.dispute.update({ where: { id: dispute.id }, data: { otherPartyContact: newContact } });
  }
  const contact = newContact || current.otherPartyContact || dispute.otherPartyContact || undefined;

  let inviteUrl: string | undefined;
  const needsInvite = Boolean(contact) && !current.otherPartyResponse;
  if (needsInvite) {
    try {
      current = await disputesService.transitionStatus(
        dispute.id,
        "MEDIATION_REQUESTED",
        "AWAITING_OTHER_PARTY",
        input.requesterId,
        "Invitation sent to the other party"
      );
    } catch (err) {
      if (isConflict(err)) return { dispute: await reload(), alreadyRequested: true };
      throw err;
    }
    // The case now waits for their answer (see invitations.service).
    current = await prisma.dispute.update({
      where: { id: dispute.id },
      data: { otherPartyResponse: "PENDING", otherPartyRespondedAt: null },
    });
    ({ respondUrl: inviteUrl } = await invitationsService.sendInvitation({
      disputeId: dispute.id,
      disputeTitle: dispute.title,
      requesterName: input.requesterName,
      contact: contact!,
    }));
  }

  // If a mediator is already assigned and nothing is left to wait for, mediation proceeds.
  // State-driven and idempotent, so it's safe on a repeat; it also heals older stuck cases.
  if (dispute.assignment) {
    const next = await disputesService.markMediatorAssignedIfReady(
      dispute.id,
      current.status,
      input.requesterId,
      current.otherPartyResponse
    );
    current = { ...current, status: next };

    if (firstRequest) {
      // Tell the mediator. Never allowed to fail the request.
      try {
        const lawyer = await prisma.user.findUnique({
          where: { id: dispute.assignment.lawyerId },
          select: { phone: true, email: true, courthouseId: true },
        });
        await notifyUser({
          userId: dispute.assignment.lawyerId,
          phone: lawyer?.phone,
          email: lawyer?.email,
          courthouseId: lawyer?.courthouseId,
          template: "mediation_requested",
          subject: "Mediation requested on your case",
          message: `MyRight: mediation has been requested on "${dispute.title}".`,
          link: `/lawyer/cases/${dispute.id}`,
        });
      } catch (err) {
        console.error("Mediation-requested notification failed", err instanceof Error ? err.name : "unknown");
      }
    }
  }

  return { dispute: current, inviteUrl, alreadyRequested: !firstRequest && !needsInvite };
}
