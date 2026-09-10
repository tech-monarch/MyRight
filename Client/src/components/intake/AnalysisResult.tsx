import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { DisputeAnalysis } from "@/lib/types";

const urgencyTone: Record<DisputeAnalysis["urgency"], "danger" | "warning" | "blue"> = {
  high: "danger",
  medium: "warning",
  low: "blue",
};

export function AnalysisResult({ analysis, showHeading = true }: { analysis: DisputeAnalysis; showHeading?: boolean }) {
  return (
    <div>
      {showHeading && (
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue" />
          <h2 className="text-lg font-bold text-navy">What MyRight understands</h2>
        </div>
      )}
      <p className="mt-2 text-sm text-text-muted">
        This is preliminary AI-assisted information, not legal advice.
      </p>

      <div className="mt-5 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={urgencyTone[analysis.urgency]}>{analysis.urgency} urgency</Badge>
        </div>

        <p className="rounded-lg bg-surface-off p-4 text-sm leading-relaxed text-navy">{analysis.summary}</p>

        {analysis.issues.length > 0 && (
          <Section title="Key issues">
            <ul className="space-y-1.5">
              {analysis.issues.map((p) => (
                <BulletItem key={p}>{p}</BulletItem>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Possible paths forward">
          <ul className="space-y-1.5">
            {analysis.possibleADRPaths.map((p) => (
              <BulletItem key={p}>{p}</BulletItem>
            ))}
          </ul>
        </Section>

        <Section title="What you can do next">
          <ol className="space-y-1.5">
            {analysis.recommendedNextSteps.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-sm text-navy">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-light text-xs font-semibold text-blue">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </Section>

        {analysis.risks.length > 0 && (
          <Section title="Things to be aware of">
            <ul className="space-y-1.5">
              {analysis.risks.map((r) => (
                <BulletItem key={r}>{r}</BulletItem>
              ))}
            </ul>
          </Section>
        )}

        {analysis.questionsForUser.length > 0 && (
          <Section title="Information that would help">
            <ul className="space-y-1.5">
              {analysis.questionsForUser.map((m) => (
                <BulletItem key={m}>{m}</BulletItem>
              ))}
            </ul>
          </Section>
        )}

        {analysis.sources.length > 0 && (
          <Section title="Sources">
            <ul className="space-y-1 text-xs text-text-muted">
              {analysis.sources.map((s) => (
                <li key={s.id}>
                  {s.title}
                  {s.detail ? `: ${s.detail}` : ""}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className={cn("flex gap-2.5 text-sm text-navy")}>
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
      {children}
    </li>
  );
}
