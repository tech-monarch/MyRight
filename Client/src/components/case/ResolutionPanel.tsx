"use client";

import { useState } from "react";
import { Check, Copy, FileSignature, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Field";
import { useApi } from "@/lib/useApi";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { getResolution, createResolution, signAsDisputant } from "@/lib/resolution-client";
import { ApiError } from "@/lib/api";
import type { Dispute } from "@/lib/types";

export function ResolutionPanel({ dispute }: { dispute: Dispute }) {
  const { data: user } = useCurrentUser();
  const { data: resolution, loading, refetch } = useApi(() => getResolution(dispute.id), [dispute.id]);
  const [showForm, setShowForm] = useState(false);
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [signing, setSigning] = useState(false);

  const isMediator = user?.role === "LAWYER" || user?.role === "SUPERADMIN";
  const isOwner = user?.role === "DISPUTANT" && dispute.ownerId === user.id;
  const hasDisputantSigned = resolution?.signatures.some((s) => s.party === "DISPUTANT");
  const hasOtherPartySigned = resolution?.signatures.some((s) => s.party === "OTHER_PARTY");

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await createResolution(dispute.id, terms);
      setSigningUrl(result.signingUrl);
      setShowForm(false);
      setTerms("");
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't propose that resolution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSign() {
    setSigning(true);
    setError("");
    try {
      await signAsDisputant(dispute.id);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign. Please try again.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <FileSignature size={18} className="text-blue" />
        <h2 className="text-sm font-bold text-navy">Resolution</h2>
      </div>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </p>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {!loading && !resolution && !showForm && (
        <div className="mt-4">
          <p className="text-sm text-text-muted">No resolution has been proposed yet.</p>
          {isMediator || isOwner ? (
            <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              Propose a resolution
            </Button>
          ) : null}
        </div>
      )}

      {showForm && (
        <form onSubmit={handlePropose} className="mt-4 space-y-3">
          <Textarea
            rows={5}
            placeholder="Describe the agreed terms, e.g. amounts, deadlines, and any actions each side will take..."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting} icon={submitting ? <Loader2 size={14} className="animate-spin" /> : undefined}>
              {submitting ? "Sending..." : "Send for signature"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {signingUrl && (
        <div className="mt-4 rounded-lg border border-blue-light bg-blue-light/40 p-3.5">
          <p className="text-sm text-navy">
            The other party has been notified where possible. If you need to share the signing
            link yourself, here it is:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white px-2 py-1.5 text-xs text-navy">{signingUrl}</code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(signingUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="shrink-0 rounded-lg border border-border bg-white p-1.5 text-text-muted hover:text-blue"
              aria-label="Copy signing link"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {resolution && (
        <div className="mt-4 space-y-4">
          <Badge tone={resolution.status === "FULLY_SIGNED" ? "success" : "warning"}>
            {resolution.status === "FULLY_SIGNED" ? "Fully signed" : "Awaiting signatures"}
          </Badge>
          <p className="whitespace-pre-line rounded-lg bg-surface-off p-4 text-sm text-navy">{resolution.terms}</p>

          <div className="space-y-2">
            <SignatureRow label="You (disputant)" signed={!!hasDisputantSigned} />
            <SignatureRow label="Other party" signed={!!hasOtherPartySigned} />
          </div>

          {isOwner && !hasDisputantSigned && (
            <Button
              size="sm"
              onClick={handleSign}
              disabled={signing}
              icon={signing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            >
              {signing ? "Signing..." : "Sign this resolution"}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function SignatureRow({ label, signed }: { label: string; signed: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-sm">
      <span className="text-navy">{label}</span>
      {signed ? (
        <span className="inline-flex items-center gap-1 text-success">
          <Check size={14} /> Signed
        </span>
      ) : (
        <span className="text-text-muted">Not yet signed</span>
      )}
    </div>
  );
}
