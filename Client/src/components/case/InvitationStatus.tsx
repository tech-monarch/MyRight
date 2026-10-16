"use client";

import { useState } from "react";
import { Check, Clock, Copy, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { resendInvitation } from "@/lib/disputes-client";
import { ApiError } from "@/lib/api";
import type { Dispute } from "@/lib/types";

/**
 * Shows whether the other party has answered the mediation invitation. The
 * case owner can resend it or copy the link and share it by hand (useful when
 * WhatsApp/email delivery isn't set up). Lawyers see the status read-only.
 */
export function InvitationStatus({ dispute, canResend }: { dispute: Dispute; canResend: boolean }) {
  const response = dispute.otherPartyResponse;
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!response) return null;
  const name = dispute.otherPartyName || "The other party";

  async function resend() {
    setBusy(true);
    setError("");
    try {
      setLink((await resendInvitation(dispute.id)).inviteUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't resend the invitation.");
    } finally {
      setBusy(false);
    }
  }

  if (response === "ACCEPTED") {
    return (
      <Card className="mt-4 flex items-center gap-3 border-success/30 bg-success-light">
        <Check size={18} className="shrink-0 text-success" />
        <p className="text-sm text-success">{name} accepted mediation. A session can now be scheduled.</p>
      </Card>
    );
  }

  if (response === "DECLINED") {
    return (
      <Card className="mt-4 flex items-center gap-3 border-danger/30 bg-danger-light">
        <XCircle size={18} className="shrink-0 text-danger" />
        <p className="text-sm text-danger">{name} declined mediation, so a session can&apos;t be scheduled for this case.</p>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <div className="flex items-start gap-3">
        <Clock size={18} className="mt-0.5 shrink-0 text-blue" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy">Waiting for {name.toLowerCase() === "the other party" ? "the other party" : name} to respond</p>
          <p className="mt-0.5 text-sm text-text-muted">
            They&apos;ve been sent an invitation. A mediator can be scheduled as soon as they accept.
          </p>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {canResend && (
            <div className="mt-3 space-y-2">
              <Button size="sm" variant="secondary" onClick={resend} disabled={busy} icon={busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}>
                Resend invitation
              </Button>
              {link && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-off px-3 py-2">
                  <p className="min-w-0 flex-1 truncate font-mono text-xs text-navy">{link}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="shrink-0 text-xs font-semibold text-blue hover:underline"
                  >
                    {copied ? "Copied" : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
