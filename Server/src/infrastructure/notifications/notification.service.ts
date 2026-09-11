import { prisma } from "@/infrastructure/database/prisma";
import { whatsAppProvider } from "@/infrastructure/notifications/whatsapp.provider";

/**
 * Every notification in the product goes through this file, not directly
 * through whatsAppProvider, so (a) there's one place templates live, and
 * (b) every send attempt, success or failure or skipped, is logged the
 * same way. A missing phone number or a disconnected WhatsApp session is
 * not an error to the caller, notifications are a nice-to-have, a
 * mediation request must still succeed even if nobody could be notified
 * about it.
 */
async function send(input: {
  userId?: string;
  phone: string | null | undefined;
  template: string;
  message: string;
}): Promise<void> {
  if (!input.phone) {
    await prisma.notificationLog.create({
      data: {
        userId: input.userId,
        channel: "WHATSAPP",
        recipient: "(none)",
        template: input.template,
        status: "SKIPPED",
        error: "No phone number on file.",
      },
    });
    return;
  }

  const result = await whatsAppProvider.sendMessage(input.phone, input.message);
  await prisma.notificationLog.create({
    data: {
      userId: input.userId,
      channel: "WHATSAPP",
      recipient: input.phone,
      template: input.template,
      status: result.sent ? "SENT" : "FAILED",
      error: result.error,
    },
  });
}

export async function notifyLawyerAssigned(input: { lawyerId: string; lawyerPhone: string | null; disputeTitle: string }) {
  await send({
    userId: input.lawyerId,
    phone: input.lawyerPhone,
    template: "lawyer_assigned",
    message: `MyRight: you've been assigned a new case, "${input.disputeTitle}". Log in to MyRight to review it.`,
  });
}

export async function notifySessionScheduled(input: {
  userId?: string;
  phone: string | null | undefined;
  disputeTitle: string;
  scheduledStart: Date;
  meetingUrl: string | null;
}) {
  const when = input.scheduledStart.toLocaleString("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
  const linkLine = input.meetingUrl ? `\nJoin here: ${input.meetingUrl}` : "";
  await send({
    userId: input.userId,
    phone: input.phone,
    template: "session_scheduled",
    message: `MyRight: a mediation session for "${input.disputeTitle}" is scheduled for ${when}.${linkLine}`,
  });
}

export async function notifySigningRequest(input: {
  phone: string | null | undefined;
  disputeTitle: string;
  signingUrl: string;
}) {
  await send({
    phone: input.phone,
    template: "signing_request",
    message: `MyRight: a resolution has been proposed for "${input.disputeTitle}" and is ready for your review and signature: ${input.signingUrl}`,
  });
}

export async function notifyResolutionFullySigned(input: {
  userId?: string;
  phone: string | null | undefined;
  disputeTitle: string;
}) {
  await send({
    userId: input.userId,
    phone: input.phone,
    template: "resolution_signed",
    message: `MyRight: both sides have signed the resolution for "${input.disputeTitle}". The case is now marked resolved.`,
  });
}
