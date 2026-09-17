import { prisma } from "@/infrastructure/database/prisma";
import { createSessionRoom, deleteRoom, getRoomPresence } from "@/infrastructure/video/daily.provider";
import { notifySessionScheduled } from "@/infrastructure/notifications/notification.service";
import { transitionStatus } from "@/modules/disputes/disputes.service";
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

  // Scheduling a session is a meaningful enough milestone to move the
  // case forward automatically, rather than requiring a separate manual
  // status update. Only advances forward (see disputes.service.ts's
  // ALLOWED_TRANSITIONS), calling this on a case already further along
  // (e.g. scheduling a second session while already IN_MEDIATION) is a
  // no-op error we deliberately swallow rather than block scheduling on.
  await transitionStatus(dispute.id, dispute.status, "IN_MEDIATION", input.createdById, "Mediation session scheduled").catch(
    () => undefined
  );

  await notifySessionScheduled({
    userId: dispute.ownerId,
    phone: (await prisma.user.findUnique({ where: { id: dispute.ownerId }, select: { phone: true } }))?.phone,
    disputeTitle: dispute.title,
    scheduledStart: input.scheduledStart,
    meetingUrl,
  });

  // otherPartyContact is freeform (collected at intake), only attempt a
  // WhatsApp send if it looks like a phone number rather than an email,
  // see the module README note on this simplification.
  if (dispute.otherPartyContact && !dispute.otherPartyContact.includes("@")) {
    await notifySessionScheduled({
      phone: dispute.otherPartyContact,
      disputeTitle: dispute.title,
      scheduledStart: input.scheduledStart,
      meetingUrl,
    });
  }

  return session;
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
