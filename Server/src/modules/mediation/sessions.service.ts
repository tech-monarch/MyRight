import { prisma } from "@/infrastructure/database/prisma";
import { createMeetingToken, createSessionRoom, deleteRoom, getRoomPresence } from "@/infrastructure/video/daily.provider";
import { courthouseIdForDispute, notifySessionScheduled, splitContact } from "@/infrastructure/notifications/notification.service";
import { markMediatorAssignedIfReady, transitionStatus } from "@/modules/disputes/disputes.service";
import { AppError } from "@/utils/AppError";

export function listSessions(disputeId: string) {
  return prisma.mediationSession.findMany({
    where: { disputeId },
    orderBy: { scheduledStart: "asc" },
    include: { attendance: true },
  });
}

export async function createSession(input: {
  disputeId: string;
  lawyerId: string;
  createdById: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  useDailyVideo: boolean;
  manualMeetingUrl?: string;
}) {
  const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: input.disputeId } });

  let meetingUrl = input.manualMeetingUrl ?? null;
  let dailyRoomName: string | null = null;

  if (input.useDailyVideo) {
    const room = await createSessionRoom({
      disputeId: input.disputeId,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
    });
    meetingUrl = room.url;
    dailyRoomName = room.name;
  }

  const session = await prisma.mediationSession.create({
    data: {
      disputeId: input.disputeId,
      lawyerId: input.lawyerId,
      createdById: input.createdById,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      meetingUrl,
      dailyRoomName,
    },
  });

  // Scheduling a session moves the case into IN_MEDIATION. Cases that never
  // got a "mediator assigned" step (assigned before this fix) are first
  // brought to MEDIATOR_ASSIGNED so the transition is valid. A case already
  // IN_MEDIATION (second session) stays as is; any other unexpected state is
  // logged rather than silently ignored.
  try {
    const current = await markMediatorAssignedIfReady(dispute.id, dispute.status, input.createdById, dispute.otherPartyResponse);
    if (current === "MEDIATOR_ASSIGNED") {
      await transitionStatus(dispute.id, current, "IN_MEDIATION", input.createdById, "Mediation session scheduled");
    }
  } catch (err) {
    console.error("Could not advance case status after scheduling", dispute.status, err instanceof Error ? err.message : "unknown");
  }

  // Notify both sides, each over whichever channel(s) they have. Never
  // allowed to fail the scheduling itself.
  try {
    const owner = await prisma.user.findUnique({ where: { id: dispute.ownerId }, select: { phone: true, email: true } });
    const courthouseId = await courthouseIdForDispute(dispute.id);
    // The case owner joins from inside the app (their link carries a personal token), so they get the case page, not the raw room link.
    await notifySessionScheduled({
      userId: dispute.ownerId,
      phone: owner?.phone,
      email: owner?.email,
      courthouseId,
      disputeTitle: dispute.title,
      scheduledStart: input.scheduledStart,
      link: `/dashboard/disputes/${dispute.id}`,
    });
    // otherPartyContact is freeform (collected at intake): an "@" means email, otherwise a phone number.
    // They have no account, so they get the room link and wait in the lobby until the mediator admits them.
    if (dispute.otherPartyContact) {
      await notifySessionScheduled({
        ...splitContact(dispute.otherPartyContact),
        courthouseId,
        disputeTitle: dispute.title,
        scheduledStart: input.scheduledStart,
        meetingUrl,
        isOtherParty: true,
      });
    }
  } catch (err) {
    console.error("Session notifications failed", err instanceof Error ? err.name : "unknown");
  }

  return session;
}

/**
 * The URL a signed-in participant opens to join. Daily rooms are private, so
 * each person gets a short-lived token minted here: the mediator (lawyer or
 * superadmin) as room owner so they can admit people from the lobby, the
 * case owner as a regular participant. Manual-link sessions just return the
 * link that was pasted in.
 */
export async function getJoinUrl(input: {
  sessionId: string;
  disputeId: string;
  userName: string;
  isMediator: boolean;
}): Promise<string> {
  const session = await prisma.mediationSession.findFirst({ where: { id: input.sessionId, disputeId: input.disputeId } });
  if (!session) throw AppError.notFound("Session not found");
  if (session.status !== "SCHEDULED") throw AppError.badRequest("This session is no longer open to join.");
  if (!session.meetingUrl) throw AppError.badRequest("This session has no meeting link.");
  if (!session.dailyRoomName) return session.meetingUrl;

  const token = await createMeetingToken({
    roomName: session.dailyRoomName,
    userName: input.userName,
    isOwner: input.isMediator,
    scheduledEnd: session.scheduledEnd,
  });
  return `${session.meetingUrl}?t=${encodeURIComponent(token)}`;
}

export async function cancelSession(sessionId: string, disputeId: string) {
  const session = await prisma.mediationSession.findFirst({ where: { id: sessionId, disputeId } });
  if (!session) throw AppError.notFound("Session not found");

  if (session.dailyRoomName) {
    await deleteRoom(session.dailyRoomName);
  }

  return prisma.mediationSession.update({ where: { id: sessionId }, data: { status: "CANCELLED" } });
}

/**
 * Pulls attendance from Daily's presence API and stores it, meant to be
 * called once a session is over (the case detail page calls this the
 * first time someone views a past-scheduled-end session, see
 * mediation.controller.ts). Idempotent-ish: re-fetching just replaces the
 * prior snapshot rather than duplicating rows, since Daily's presence
 * data for a finished room is stable once the room has emptied out.
 */
export async function syncAttendance(sessionId: string): Promise<void> {
  const session = await prisma.mediationSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (!session.dailyRoomName) return; // Manual link sessions have no attendance data to pull.

  const participants = await getRoomPresence(session.dailyRoomName);

  await prisma.$transaction([
    prisma.mediationAttendance.deleteMany({ where: { sessionId } }),
    prisma.mediationAttendance.createMany({
      data: participants.map((p) => ({
        sessionId,
        participantName: p.participantName,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        durationSec: p.durationSec,
      })),
    }),
  ]);
}

export async function submitOutcomeNotes(sessionId: string, disputeId: string, outcomeNotes: string) {
  const session = await prisma.mediationSession.findFirst({ where: { id: sessionId, disputeId } });
  if (!session) throw AppError.notFound("Session not found");

  return prisma.mediationSession.update({
    where: { id: sessionId },
    data: { outcomeNotes, status: "COMPLETED" },
  });
}
