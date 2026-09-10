"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Handshake, Loader2, Mail } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Label, Input, FieldHint } from "@/components/ui/Field";
import { useApi } from "@/lib/useApi";
import { getDispute, listDocuments, requestMediation } from "@/lib/disputes-client";
import { ApiError } from "@/lib/api";

const STEPS = ["Review your case", "Invite the other party", "Confirm"] as const;

export default function MediationRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: dispute, loading, error: loadError } = useApi(() => getDispute(params.id), [params.id]);
  const { data: documents } = useApi(() => listDocuments(params.id), [params.id]);

  const [step, setStep] = useState(0);
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      await requestMediation(params.id, { contactMethod, contact: contact || undefined });
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't send that request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <DashboardTopbar title="Request mediation" />
        <main className="flex-1 px-4 py-20 text-center">
          <Loader2 size={20} className="mx-auto animate-spin text-blue" />
        </main>
      </>
    );
  }

  if (loadError || !dispute) {
    return (
      <>
        <DashboardTopbar title="Request mediation" />
        <main className="flex-1 px-4 py-20 text-center text-sm text-danger">
          {loadError ?? "Case not found."}
        </main>
      </>
    );
  }

  if (done) {
    return (
      <>
        <DashboardTopbar title="Mediation requested" />
        <main className="flex-1 px-4 py-10 md:px-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
              <Check size={26} />
            </div>
            <h1 className="mt-4 text-xl font-bold text-navy">Mediation requested</h1>
            <p className="mt-2 text-sm text-text-muted">
              We have sent an invitation to {dispute.otherPartyName || "the other party"} to join mediation for this
              case. You will be notified as soon as they respond, usually within a few days.
            </p>
            <ButtonLink href={`/dashboard/disputes/${dispute.id}`} className="mt-6">
              Back to case
            </ButtonLink>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar title="Request mediation" />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-xl">
          <ProgressBar step={step} />

          <Card className="mt-6">
            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-navy">Review your case</h2>
                <p className="mt-1 text-sm text-text-muted">
                  This is what will be shared as part of your mediation request.
                </p>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Dispute" value={dispute.title} />
                  <SummaryRow label="Other party" value={dispute.otherPartyName || "Not specified"} />
                  <SummaryRow label="Desired outcome" value={dispute.desiredOutcome || "Not specified"} />
                  <SummaryRow
                    label="Evidence attached"
                    value={documents ? `${documents.length} document${documents.length === 1 ? "" : "s"}` : "..."}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-navy">Invite the other party</h2>
                <p className="mt-1 text-sm text-text-muted">
                  We will send {dispute.otherPartyName || "the other party"} an invitation to respond and take part in
                  mediation. They will only see what you choose to share.
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setContactMethod("email")}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
                        contactMethod === "email"
                          ? "border-blue bg-blue-light text-blue"
                          : "border-border text-text-muted"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod("phone")}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
                        contactMethod === "phone"
                          ? "border-blue bg-blue-light text-blue"
                          : "border-border text-text-muted"
                      }`}
                    >
                      Phone number
                    </button>
                  </div>
                  <div>
                    <Label htmlFor="contact">
                      {contactMethod === "email" ? "Their email address" : "Their phone number"}
                    </Label>
                    <Input
                      id="contact"
                      type={contactMethod === "email" ? "email" : "tel"}
                      placeholder={contactMethod === "email" ? "name@example.com" : "080..."}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                    <FieldHint>
                      If you are not sure how to reach them, you can skip this and MyRight will
                      help you figure out next steps.
                    </FieldHint>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-navy">Confirm your request</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Once you confirm, MyRight will send an invitation and this case will move to
                  "Mediation requested."
                </p>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Dispute" value={dispute.title} />
                  <SummaryRow label="Invitation sent to" value={contact || "Not provided yet"} />
                  <SummaryRow label="Method" value={contactMethod === "email" ? "Email" : "Phone number"} />
                </div>
                <div className="mt-5 flex items-start gap-3 rounded-lg bg-surface-off p-3.5">
                  <Handshake size={18} className="mt-0.5 shrink-0 text-blue" />
                  <p className="text-sm text-text-muted">
                    Mediation is voluntary for both sides. If the other party does not respond
                    within a reasonable time, MyRight will let you know what options are
                    available.
                  </p>
                </div>
                {submitError && <p className="mt-4 text-sm text-danger">{submitError}</p>}
              </div>
            )}
          </Card>

          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="ghost"
              icon={<ArrowLeft size={16} />}
              onClick={() => (step === 0 ? router.push(`/dashboard/disputes/${dispute.id}`) : setStep((s) => s - 1))}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                icon={submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              >
                {submitting ? "Sending request..." : "Send mediation request"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-text-muted">
        <span>{STEPS[step]}</span>
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-blue transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-navy">{value}</span>
    </div>
  );
}
