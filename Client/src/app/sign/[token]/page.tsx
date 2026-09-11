"use client";

import { useEffect, useState } from "react";
import { Check, FileSignature, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { getPublicResolution, signPublicResolution, type PublicResolutionView } from "@/lib/resolution-client";

export default function PublicSigningPage({ params }: { params: { token: string } }) {
  const [view, setView] = useState<PublicResolutionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    getPublicResolution(params.token)
      .then(setView)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "This link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await signPublicResolution(params.token, name);
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't sign this resolution. Please try again.");
    } finally {
      setSubmitting(false);
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

          {view && !done && (
            <Card>
              <div className="flex items-center gap-2">
                <FileSignature size={18} className="text-blue" />
                <h1 className="text-lg font-bold text-navy">Resolution for review</h1>
              </div>
              <p className="mt-1 text-sm text-text-muted">{view.disputeTitle}</p>

              <p className="mt-4 whitespace-pre-line rounded-lg bg-surface-off p-4 text-sm text-navy">
                {view.terms}
              </p>

              {view.alreadySigned ? (
                <p className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-light px-3.5 py-2.5 text-sm text-success">
                  <Check size={16} /> This resolution has already been signed.
                </p>
              ) : (
                <form onSubmit={handleSign} className="mt-5 space-y-4">
                  {submitError && <p className="text-sm text-danger">{submitError}</p>}
                  <div>
                    <Label htmlFor="name">Your full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name to sign"
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-surface-off p-3 text-xs text-text-muted">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue" />
                    <span>
                      By typing your name and submitting, you confirm you have read and agree to
                      these terms. Your name, the time, and your IP address will be recorded as
                      your signature.
                    </span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                    icon={submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  >
                    {submitting ? "Signing..." : "I agree, sign this resolution"}
                  </Button>
                </form>
              )}
            </Card>
          )}

          {done && (
            <Card className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
                <Check size={26} />
              </div>
              <h1 className="mt-4 text-lg font-bold text-navy">Signed</h1>
              <p className="mt-2 text-sm text-text-muted">
                Thank you, your signature has been recorded. If both sides have now signed, the
                case will be marked resolved.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
