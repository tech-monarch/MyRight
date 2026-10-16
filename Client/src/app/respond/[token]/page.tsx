"use client";

import { useEffect, useState } from "react";
import { Check, Handshake, Loader2, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getInvitation, respondToInvitation, type InvitationView } from "@/lib/invitations-client";
import type { PartyResponse } from "@/lib/types";

/**
 * Public page (no account needed) where the other party accepts or declines a
 * mediation invitation. The link itself is the credential. It deliberately
 * shows only the case title and who is asking, never the description.
 */
export default function RespondToInvitationPage({ params }: { params: { token: string } }) {
  const [view, setView] = useState<InvitationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState<"accept" | "decline" | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [answer, setAnswer] = useState<PartyResponse | null>(null);

  useEffect(() => {
    getInvitation(params.token)
      .then((v) => {
        setView(v);
        if (v.response !== "PENDING") setAnswer(v.response);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "This invitation link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function respond(accept: boolean) {
    setSubmitting(accept ? "accept" : "decline");
    setSubmitError("");
    try {
      const r = await respondToInvitation(params.token, accept);
      setAnswer(r.response);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't send your answer. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-off">
      <header className="border-b border-border bg-white">
        <div className="container-page flex h-16 items-center">
          <Logo href="/" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 size={22} className="animate-spin text-blue" />
            </div>
          )}

          {loadError && (
            <Card className="text-center">
              <p className="text-sm text-danger">{loadError}</p>
            </Card>
          )}

          {view && answer && (
            <Card className="text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${answer === "ACCEPTED" ? "bg-success-light text-success" : "bg-surface-off text-text-muted"}`}>
                {answer === "ACCEPTED" ? <Check size={26} /> : <X size={26} />}
              </div>
              <h1 className="mt-4 text-lg font-bold text-navy">
                {answer === "ACCEPTED" ? "You've accepted mediation" : "You've declined mediation"}
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                {answer === "ACCEPTED"
                  ? `${view.requesterName} has been told. A mediator will be assigned and you'll be sent the session details.`
                  : `${view.requesterName} has been told. You don't need to do anything else.`}
              </p>
            </Card>
          )}

          {view && !answer && (
            <Card>
              <div className="flex items-center gap-2">
                <Handshake size={18} className="text-blue" />
                <h1 className="text-lg font-bold text-navy">You&apos;ve been invited to mediation</h1>
              </div>
              <p className="mt-3 text-sm text-text-muted">
                <span className="font-semibold text-navy">{view.requesterName}</span> has asked for mediation with you about:
              </p>
              <p className="mt-2 rounded-lg bg-surface-off p-4 text-sm font-semibold text-navy">{view.disputeTitle}</p>
              <p className="mt-3 text-sm text-text-muted">
                Mediation is a voluntary, confidential conversation led by a neutral mediator. Accepting doesn&apos;t
                mean you agree with anything yet, and you can still walk away at any point.
              </p>

              {!view.open ? (
                <p className="mt-5 rounded-lg border border-border bg-surface-off px-3.5 py-2.5 text-sm text-text-muted">
                  This case is no longer waiting for your response.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {submitError && <p className="text-sm text-danger">{submitError}</p>}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button className="flex-1" onClick={() => respond(true)} disabled={submitting !== null} icon={submitting === "accept" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}>
                      Accept mediation
                    </Button>
                    <Button className="flex-1" variant="secondary" onClick={() => respond(false)} disabled={submitting !== null} icon={submitting === "decline" ? <Loader2 size={16} className="animate-spin" /> : undefined}>
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
