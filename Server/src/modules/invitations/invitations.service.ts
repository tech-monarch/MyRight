import { randomBytes } from "crypto";
import { prisma } from "@/infrastructure/database/prisma";
import { env } from "@/config/env";
import { hashToken } from "@/utils/session-token";
import { AppError } from "@/utils/AppError";
import { markMediatorAssignedIfReady } from "@/modules/disputes/disputes.service";
import {
  courthouseIdForDispute,
  notifyInvitationResponse,
  notifyMediationInvite,
  splitContact,
} from "@/infrastructure/notifications/notification.service";

const INVITE_TTL_DAYS = 21;

/**
 * Creates a fresh invitation link and sends it to the other party, over
 * WhatsApp or email depending on what their contact is. Only the token's hash
 * is stored. Returns the link too, so the case owner can copy it and share it
 * by hand if automatic delivery isn't set up yet.
 */
export async function sendInvitation(input: {
  disputeId: string;
  disputeTitle: string;
  requesterName: string;
  contact: string;
}): Promise<{ respondUrl: string }> {
  const rawToken = randomBytes(32).toString("hex");
  await prisma.mediationInvitation.create({
    data: {
      disputeId: input.disputeId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const respondUrl = `${env.APP_URL}/respond/${rawToken}`;
  await notifyMediationInvite({
    ...splitContact(input.contact),
    courthouseId: await courthouseIdForDispute(input.disputeId),
    requesterName: input.requesterName,
    disputeTitle: input.disputeTitle,
    respondUrl,
  });
  return { respondUrl };
}

async function findValidInvitation(rawToken: string) {
  const invitation = await prisma.mediationInvitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { dispute: { include: { owner: { select: { id: true, name: true, phone: true, email: true } }, assignment: { include: { lawyer: { select: { id: true, phone: true, email: true, courthouseId: true } } } } } } },
  });
  // One message for "no such link" and "expired", so a link can't be probed.
  if (!invitation || invitation.expiresAt < new Date()) {
    throw AppError.notFound("This invitation link is invalid or has expired.");
  }
  return invitation;
}

/** What the other party may see: the case title and who is asking. Nothing from the description or documents. */
export async function getInvitationSummary(rawToken: string) {
  const { dispute } = await findValidInvitation(rawToken);
  return {
    disputeTitle: dispute.title,
    requesterName: dispute.owner.name,
    response: dispute.otherPartyResponse ?? "PENDING",
    open: dispute.status === "AWAITING_OTHER_PARTY",
  };
}

export async function respondToInvitation(rawToken: string, accept: boolean) {
  const { dispute } = await findValidInvitation(rawToken);

  // Final once given: a second visit shows the answer instead of changing it.
  if (dispute.otherPartyResponse === "ACCEPTED" || dispute.otherPartyResponse === "DECLINED") {
    return { response: dispute.otherPartyResponse, alreadyAnswered: true };
  }
  if (dispute.status !== "AWAITING_OTHER_PARTY") {
    throw AppError.badRequest("This case is no longer waiting for your response.");
  }

  // The where-clause is the guard against a double click or two tabs both answering.
  const response = accept ? "ACCEPTED" : "DECLINED";
  const updated = await prisma.dispute.updateMany({
    where: { id: dispute.id, status: "AWAITING_OTHER_PARTY", OR: [{ otherPartyResponse: null }, { otherPartyResponse: "PENDING" }] },
    data: { otherPartyResponse: response, otherPartyRespondedAt: new Date() },
  });
  if (updated.count === 0) {
    const fresh = await prisma.dispute.findUniqueOrThrow({ where: { id: dispute.id }, select: { otherPartyResponse: true } });
    return { response: fresh.otherPartyResponse ?? "PENDING", alreadyAnswered: true };
  }

  await prisma.disputeStatusHistory.create({
    data: {
      disputeId: dispute.id,
      status: dispute.status,
      changedById: dispute.ownerId,
      note: accept ? "Other party accepted mediation" : "Other party declined mediation",
    },
  });

  // If a mediator is already assigned, an acceptance lets the case move on.
  if (accept && dispute.assignment) {
    await markMediatorAssignedIfReady(dispute.id, dispute.status, dispute.ownerId, "ACCEPTED");
  }

  // Tell the case owner and the assigned mediator. Never allowed to fail the response itself.
  try {
    const courthouseId = dispute.assignment?.lawyer.courthouseId ?? null;
    await notifyInvitationResponse({
      userId: dispute.owner.id,
      phone: dispute.owner.phone,
      email: dispute.owner.email,
      courthouseId,
      disputeTitle: dispute.title,
      accepted: accept,
      link: `/dashboard/disputes/${dispute.id}`,
    });
    if (dispute.assignment) {
      await notifyInvitationResponse({
        userId: dispute.assignment.lawyer.id,
        phone: dispute.assignment.lawyer.phone,
        email: dispute.assignment.lawyer.email,
        courthouseId,
        disputeTitle: dispute.title,
        accepted: accept,
        link: `/lawyer/cases/${dispute.id}`,
      });
    }
  } catch (err) {
    console.error("Invitation-response notifications failed", err instanceof Error ? err.name : "unknown");
  }

  return { response, alreadyAnswered: false };
}
