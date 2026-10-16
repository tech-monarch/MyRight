import { env } from "@/config/env";
import type { NotificationResult } from "@/infrastructure/notifications/notification.provider";

/**
 * Email over Resend's HTTPS API. Deliberately not SMTP: Render blocks
 * outbound SMTP ports (25/465/587) on free instances, and port 25 on all
 * of them, so an SMTP client would just time out in production.
 *
 * One attempt, no automatic retry: a retry after a lost response could send
 * the same email twice. The failure is returned (and logged by the caller),
 * never thrown, so a notification problem can't fail the user's action.
 */
const RESEND_URL = "https://api.resend.com/emails";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class EmailProvider {
  isReady(): boolean {
    return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
  }

  async sendEmail(input: { to: string; subject: string; text: string }): Promise<NotificationResult> {
    if (!this.isReady()) return { sent: false, error: "Email is not configured (RESEND_API_KEY / EMAIL_FROM)." };

    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [input.to],
          subject: input.subject,
          text: input.text,
          html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a2433">${escapeHtml(input.text).replace(/\n/g, "<br>")}</div>`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return { sent: true };

      // Resend's error body explains things like "domain not verified"; it never echoes the key.
      const body = (await res.text().catch(() => "")).slice(0, 200);
      return { sent: false, error: `Email provider returned ${res.status}${body ? `: ${body}` : ""}` };
    } catch (err) {
      return { sent: false, error: `Email request failed (${err instanceof Error ? err.name : "unknown"}).` };
    }
  }
}

export const emailProvider = new EmailProvider();
