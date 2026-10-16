import { env } from "@/config/env";
import { prisma } from "@/infrastructure/database/prisma";
import { whatsAppManager } from "@/infrastructure/notifications/whatsapp.provider";
import { emailProvider } from "@/infrastructure/notifications/email.provider";
import { normalizePhone } from "@/utils/phone";

export { normalizePhone };

/**
 * Every notification in the product goes through this file, so (a) there's
 * one place templates live, and (b) every send attempt is recorded:
 *   - an in-app notification (shown in the app) for anyone with an account,
 *   - WhatsApp and/or email when a phone/email is known,
 *   - a delivery row in notification_logs for each external attempt.
 * Nothing here ever throws to the caller: a mediation request must still
 * succeed even if nobody could be notified about it.
 */

/** A freeform contact (intake collects either) routed to the right channel. */
export function splitContact(contact: string | null | undefined): { phone?: string; email?: string } {
  const c = contact?.trim();
  if (!c) return {};
  return c.includes("@") ? { email: c } : { phone: c };
}

/** Which courthouse's WhatsApp number should send for this case (none yet = platform default). */
export async function courthouseIdForDispute(disputeId: string): Promise<string | null> {
  try {
    const a = await prisma.caseAssignment.findUnique({
      where: { disputeId },
      select: { lawyer: { select: { courthouseId: true } } },
    });
    return a?.lawyer.courthouseId ?? null;
  } catch {
    return null;
  }
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

type SendInput = {
  userId?: string;
  phone?: string | null;
  email?: string | null;
  courthouseId?: string | null;
  template: string;
  subject: string;
  message: string;
  /** App path (e.g. /dashboard/disputes/abc). Stored for the in-app item and appended as a full link externally. */
  link?: string;
};

async function send(input: SendInput): Promise<void> {
  if (input.userId) {
    try {
      await prisma.notification.create({
        data: { userId: input.userId, type: input.template, title: input.subject, body: input.message, link: input.link },
      });
    } catch (err) {
      console.error("Could not create in-app notification", err instanceof Error ? err.name : "unknown");
    }
  }

  const external = input.link ? `${input.message}\nOpen: ${env.APP_URL}${input.link}` : input.message;

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
    const result = await whatsAppManager.sendFor(input.courthouseId, to, external).catch((err: unknown) => ({
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
    const result = await emailProvider.sendEmail({ to: input.email, subject: input.subject, text: external });
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

type Contact = { userId?: string; phone?: string | null; email?: string | null; courthouseId?: string | null };

/** Ad-hoc notification for events that don't need their own template. */
export function notifyUser(input: Contact & { template: string; subject: string; message: string; link?: string }) {
  return send(input);
}

export function notifyLawyerAssigned(input: Contact & { lawyerId: string; disputeTitle: string; disputeId: string }) {
  return send({
    ...input,
    userId: input.lawyerId,
    template: "lawyer_assigned",
    subject: "New case assigned to you on MyRight",
    message: `MyRight: you've been assigned a new case, "${input.disputeTitle}".`,
    link: `/lawyer/cases/${input.disputeId}`,
  });
}

export function notifyAccountCreated(input: Contact & { name: string; username: string; roleLabel: string }) {
  return send({
    ...input,
    template: "account_created",
    subject: `Your MyRight ${input.roleLabel} account is ready`,
    // The temporary password is never sent: whoever created the account hands it over, and it must be changed at first login.
    message: `MyRight: hello ${input.name}, your ${input.roleLabel} account has been created. Your username is "${input.username}". Sign in at ${env.APP_URL}/login with the temporary password your administrator gave you; you'll be asked to change it straight away.`,
  });
}

export function notifyMediationInvite(
  input: Contact & { requesterName: string; disputeTitle: string; respondUrl: string }
) {
  return send({
    ...input,
    template: "mediation_invite",
    subject: "You've been invited to a mediation on MyRight",
    message: `MyRight: ${input.requesterName} has asked for mediation with you about "${input.disputeTitle}". Please open this link to accept or decline: ${input.respondUrl}`,
  });
}

export function notifyInvitationResponse(
  input: Contact & { disputeTitle: string; accepted: boolean; link: string }
) {
  return send({
    ...input,
    template: input.accepted ? "invitation_accepted" : "invitation_declined",
    subject: input.accepted ? "The other party accepted mediation" : "The other party declined mediation",
    message: input.accepted
      ? `MyRight: the other party has accepted mediation for "${input.disputeTitle}".`
      : `MyRight: the other party has declined mediation for "${input.disputeTitle}".`,
  });
}

export function notifySessionScheduled(
  input: Contact & {
    disputeTitle: string;
    scheduledStart: Date;
    /** The raw room link: only for the other party, who has no account and waits in the lobby. */
    meetingUrl?: string | null;
    isOtherParty?: boolean;
    link?: string;
  }
) {
  const when = input.scheduledStart.toLocaleString("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
  const lobby = input.isOtherParty ? " You will wait in a lobby until the mediator lets you in." : "";
  const linkLine = input.meetingUrl ? `\nJoin here: ${input.meetingUrl}${lobby}` : "";
  return send({
    ...input,
    template: "session_scheduled",
    subject: `Mediation session scheduled: ${input.disputeTitle}`,
    message: `MyRight: a mediation session for "${input.disputeTitle}" is scheduled for ${when}.${linkLine}`,
  });
}

export function notifySigningRequest(input: Contact & { disputeTitle: string; signingUrl: string }) {
  return send({
    ...input,
    template: "signing_request",
    subject: `Resolution ready for your signature: ${input.disputeTitle}`,
    message: `MyRight: a resolution has been proposed for "${input.disputeTitle}" and is ready for your review and signature: ${input.signingUrl}`,
  });
}

export function notifyResolutionFullySigned(input: Contact & { disputeTitle: string; link?: string }) {
  return send({
    ...input,
    template: "resolution_signed",
    subject: `Resolution signed: ${input.disputeTitle}`,
    message: `MyRight: both sides have signed the resolution for "${input.disputeTitle}". The case is now marked resolved.`,
  });
}
