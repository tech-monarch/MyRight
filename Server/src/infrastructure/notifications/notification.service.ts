import { prisma } from "@/infrastructure/database/prisma";
import { whatsAppProvider } from "@/infrastructure/notifications/whatsapp.provider";
import { emailProvider } from "@/infrastructure/notifications/email.provider";

/**
 * Every notification in the product goes through this file, so (a) there's
 * one place templates live, and (b) every send attempt, success, failure or
 * skipped, is logged the same way in notification_logs. Nothing here ever
 * throws to the caller: a mediation request must still succeed even if
 * nobody could be notified about it.
 */

/** A freeform contact (intake collects either) routed to the right channel. */
export function splitContact(contact: string | null | undefined): { phone?: string; email?: string } {
  const c = contact?.trim();
  if (!c) return {};
  return c.includes("@") ? { email: c } : { phone: c };
}

/**
 * WhatsApp needs international digits. Nigerian numbers are usually typed
 * locally (08030001111), which must become 2348030001111. Anything that
 * already has a country code (+234..., 234...) just has symbols stripped.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

async function log(data: {
  userId?: string;
  channel: "WHATSAPP" | "EMAIL";
  recipient: string;
  template: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  error?: string;
}) {
  try {
    await prisma.notificationLog.create({ data });
  } catch (err) {
    console.error("Could not write notification log", err instanceof Error ? err.name : "unknown");
  }
}

async function send(input: {
  userId?: string;
  phone?: string | null;
  email?: string | null;
  template: string;
  subject: string;
  message: string;
}): Promise<void> {
  if (!input.phone && !input.email) {
    await log({
      userId: input.userId,
      channel: "WHATSAPP",
      recipient: "(none)",
      template: input.template,
      status: "SKIPPED",
      error: "No phone number or email on file.",
    });
    return;
  }

  if (input.phone) {
    const to = normalizePhone(input.phone);
    const result = await whatsAppProvider.sendMessage(to, input.message).catch((err) => ({
      sent: false,
      error: err instanceof Error ? err.name : "unknown error",
    }));
    await log({
      userId: input.userId,
      channel: "WHATSAPP",
      recipient: to,
      template: input.template,
      status: result.sent ? "SENT" : "FAILED",
      error: result.error,
    });
  }

  if (input.email) {
    const result = await emailProvider.sendEmail({ to: input.email, subject: input.subject, text: input.message });
    await log({
      userId: input.userId,
      channel: "EMAIL",
      recipient: input.email,
      template: input.template,
      // Not configured is a SKIP (nothing was attempted), a provider rejection is a FAILURE.
      status: result.sent ? "SENT" : emailProvider.isReady() ? "FAILED" : "SKIPPED",
      error: result.error,
    });
  }
}

type Contact = { userId?: string; phone?: string | null; email?: string | null };

export async function notifyLawyerAssigned(input: Contact & { lawyerId: string; disputeTitle: string }) {
  await send({
    userId: input.lawyerId,
    phone: input.phone,
    email: input.email,
    template: "lawyer_assigned",
    subject: "New case assigned to you on MyRight",
    message: `MyRight: you've been assigned a new case, "${input.disputeTitle}". Log in to MyRight to review it.`,
  });
}

export async function notifyMediationInvite(input: Contact & { requesterName: string; disputeTitle: string }) {
  await send({
    userId: input.userId,
    phone: input.phone,
    email: input.email,
    template: "mediation_invite",
    subject: "You've been invited to a mediation on MyRight",
    message: `MyRight: ${input.requesterName} has asked for mediation with you about "${input.disputeTitle}". A mediator will be assigned and you'll be sent the session details. No action is needed yet.`,
  });
}

export async function notifySessionScheduled(
  input: Contact & { disputeTitle: string; scheduledStart: Date; meetingUrl: string | null; isOtherParty?: boolean }
) {
  const when = input.scheduledStart.toLocaleString("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
  const lobby = input.isOtherParty ? " You will wait in a lobby until the mediator lets you in." : "";
  const linkLine = input.meetingUrl ? `\nJoin here: ${input.meetingUrl}${lobby}` : "";
  await send({
    userId: input.userId,
    phone: input.phone,
    email: input.email,
    template: "session_scheduled",
    subject: `Mediation session scheduled: ${input.disputeTitle}`,
    message: `MyRight: a mediation session for "${input.disputeTitle}" is scheduled for ${when}.${linkLine}`,
  });
}

export async function notifySigningRequest(input: Contact & { disputeTitle: string; signingUrl: string }) {
  await send({
    userId: input.userId,
    phone: input.phone,
    email: input.email,
    template: "signing_request",
    subject: `Resolution ready for your signature: ${input.disputeTitle}`,
    message: `MyRight: a resolution has been proposed for "${input.disputeTitle}" and is ready for your review and signature: ${input.signingUrl}`,
  });
}

export async function notifyResolutionFullySigned(input: Contact & { disputeTitle: string }) {
  await send({
    userId: input.userId,
    phone: input.phone,
    email: input.email,
    template: "resolution_signed",
    subject: `Resolution signed: ${input.disputeTitle}`,
    message: `MyRight: both sides have signed the resolution for "${input.disputeTitle}". The case is now marked resolved.`,
  });
}
