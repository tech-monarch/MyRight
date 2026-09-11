import { prisma } from "@/infrastructure/database/prisma";
import { createMeetSession, cancelMeetSession } from "@/infrastructure/google/google-calendar";
import { notifySessionScheduled } from "@/infrastructure/notifications/notification.service";
import { transitionStatus } from "@/modules/disputes/disputes.service";
import { AppError } from "@/utils/AppError";

export function listSessions(disputeId: string) {
  return prisma.mediationSession.findMany({
    where: { disputeId },
    orderBy: { scheduledStart: "asc" },
  });
}

export async function createSession(input: {
  disputeId: string;
  lawyerId: string;
  createdById: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  useGoogleMeet: boolean;
  manualMeetingUrl?: string;
}) {
  const dispute = await prisma.dispute.findUniqueOrThrow({
    where: { id: input.disputeId },
    include: { owner: { select: { email: true } } },
  });

  let meetingUrl = input.manualMeetingUrl ?? null;
  let googleEventId: string | null = null;

  if (input.useGoogleMeet) {
    const attendeeEmails = dispute.owner.email ? [dispute.owner.email] : [];
    const event = await createMeetSession({
      lawyerId: input.lawyerId,
      summary: `MyRight mediation: ${dispute.title}`,
      description: "Mediation session scheduled via MyRight.",
      startTime: input.scheduledStart,
      endTime: input.scheduledEnd,
      attendeeEmails,
    });
    if (!event) {
      throw AppError.badRequest(
        "Google Meet isn't connected for your account yet. Connect it in Settings, or paste in a meeting link instead."
      );
    }
    meetingUrl = event.meetingUrl;
    googleEventId = event.eventId;
  }

  const session = await prisma.mediationSession.create({
    data: {
      disputeId: input.disputeId,
      lawyerId: input.lawyerId,
      createdById: input.createdById,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      meetingUrl,
      googleEventId,
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

  if (session.googleEventId) {
    await cancelMeetSession(session.lawyerId, session.googleEventId);
  }

  return prisma.mediationSession.update({ where: { id: sessionId }, data: { status: "CANCELLED" } });
}
