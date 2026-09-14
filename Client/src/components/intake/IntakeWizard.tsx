"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Textarea, FieldHint } from "@/components/ui/Field";
import { AnalysisResult } from "@/components/intake/AnalysisResult";
import { createDispute, uploadDocument, runAnalysis } from "@/lib/disputes-client";
import { ApiError } from "@/lib/api";
import type { DisputeAnalysis } from "@/lib/types";

const STEPS = ["What happened", "Who's involved", "When & where", "What you want", "Evidence", "Your options"] as const;

interface FormState {
  description: string;
  otherParty: string;
  relationship: string;
  when: string;
  where: string;
  desiredOutcome: string;
  files: File[];
}

export function IntakeWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    description: "",
    otherParty: "",
    relationship: "",
    when: "",
    where: "",
    desiredOutcome: "",
    files: [],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [analysis, setAnalysis] = useState<DisputeAnalysis | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return form.description.trim().length >= 10;
      case 1:
        return form.otherParty.trim().length > 0;
      case 3:
        return form.desiredOutcome.trim().length > 0;
      default:
        return true;
    }
  })();

  async function goNext() {
    if (step === 4) {
      setStep(5);
      setCreating(true);
      setCreateError("");
      try {
        // The dispute is genuinely created here, not just previewed. The
        // wizard's final step shows the AI's take on a real case, not a
        // sandboxed draft, matching how the backend actually works
        // (there is no "create without persisting" endpoint).
        const dispute = await createDispute({
          title: form.description.slice(0, 80),
          description: form.description,
          type: form.relationship || "General dispute",
          otherPartyName: form.otherParty,
          desiredOutcome: form.desiredOutcome,
        });
        setDisputeId(dispute.id);

        await Promise.all(form.files.map((file) => uploadDocument(dispute.id, file).catch(() => null)));

        const result = await runAnalysis(dispute.id);
        setAnalysis(result);
      } catch (err) {
        setCreateError(
          err instanceof ApiError ? err.message : "Something went wrong while creating your case. Please try again."
        );
      } finally {
        setCreating(false);
      }
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar step={step} />

      <Card className="mt-6">
        {step === 0 && (
          <StepShell
            title="Tell us what happened"
            hint="Write it however feels natural, no legal terms needed. We'll ask follow-up questions if we need more detail."
          >
            <Textarea
              autoFocus
              rows={7}
              placeholder="e.g. My landlord hasn't returned my deposit three weeks after I moved out, even though the apartment was left in good condition..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            <FieldHint>{form.description.trim().length}/10 characters minimum</FieldHint>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="Who's involved?" hint="This helps us understand the relationship and who might need to be invited later.">
            <div className="space-y-4">
              <div>
                <Label htmlFor="otherParty">Who is the other party?</Label>
                <Input
                  id="otherParty"
                  placeholder="e.g. Mr. Bassey Eyo, my landlord"
                  value={form.otherParty}
                  onChange={(e) => update("otherParty", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="relationship">What kind of dispute is this?</Label>
                <Input
                  id="relationship"
                  placeholder="e.g. Tenancy, Contract, Consumer"
                  value={form.relationship}
                  onChange={(e) => update("relationship", e.target.value)}
                />
              </div>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="When and where did this happen?" hint="Approximate is fine if you're not sure of exact dates.">
            <div className="space-y-4">
              <div>
                <Label htmlFor="when">When</Label>
                <Input id="when" type="date" value={form.when} onChange={(e) => update("when", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="where">Where</Label>
                <Input
                  id="where"
                  placeholder="e.g. Yaba, Lagos"
                  value={form.where}
                  onChange={(e) => update("where", e.target.value)}
                />
              </div>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="What outcome are you hoping for?" hint="Be as specific as you can. An amount, an action, or an apology all count.">
            <Textarea
              autoFocus
              rows={4}
              placeholder="e.g. Full refund of my ₦450,000 deposit within two weeks"
              value={form.desiredOutcome}
              onChange={(e) => update("desiredOutcome", e.target.value)}
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Do you have any evidence?"
            hint="You can upload contracts, receipts, screenshots, photos, or messages related to your dispute. This step is optional, you can add evidence later too."
          >
            <EvidenceUpload files={form.files} onChange={(files) => update("files", files)} />
          </StepShell>
        )}

        {step === 5 && (
          <AnalysisStep
            creating={creating}
            createError={createError}
            analysis={analysis}
            disputeId={disputeId}
            onGoToCase={() => disputeId && router.push(`/dashboard/disputes/${disputeId}`)}
          />
        )}
      </Card>

      {step < 5 && (
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={step === 0} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <Button onClick={goNext} disabled={!canAdvance} icon={<ArrowRight size={16} />} className="flex-row-reverse">
            {step === 4 ? "See my options" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-text-muted">
        <span>{STEPS[step]}</span>
        <span>
          Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
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

function StepShell({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      {hint && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function EvidenceUpload({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    onChange([...files, ...Array.from(fileList)]);
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-off px-6 py-8 text-center hover:border-blue">
        <Upload size={22} className="text-blue" />
        <p className="mt-2 text-sm font-medium text-navy">Drag files here, or click to choose</p>
        <p className="mt-1 text-xs text-text-muted">Contracts, receipts, screenshots, or photos: PDF, JPG, PNG, DOC</p>
        <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm">
              <span className="flex min-w-0 flex-1 items-center gap-2 text-navy">
                <FileText size={16} className="shrink-0 text-blue" />
                <span className="min-w-0 truncate">{file.name}</span>
              </span>
              <button
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="shrink-0 text-text-muted hover:text-danger"
                aria-label={`Remove ${file.name}`}
                type="button"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnalysisStep({
  creating,
  createError,
  analysis,
  disputeId,
  onGoToCase,
}: {
  creating: boolean;
  createError: string;
  analysis: DisputeAnalysis | null;
  disputeId: string | null;
  onGoToCase: () => void;
}) {
  if (creating) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <Loader2 size={26} className="animate-spin text-blue" />
        <p className="mt-4 text-sm font-medium text-navy">Understanding your situation...</p>
        <p className="mt-1 text-xs text-text-muted">Finding relevant information and preparing your options</p>
      </div>
    );
  }

  if (createError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-danger">{createError}</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div>
      <AnalysisResult analysis={analysis} />
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onGoToCase} disabled={!disputeId} icon={<Check size={16} />} className="sm:flex-1" size="lg">
          Go to my case
        </Button>
      </div>
    </div>
  );
}
