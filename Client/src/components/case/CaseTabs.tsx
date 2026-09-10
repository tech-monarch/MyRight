"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CaseTimeline } from "@/components/case/CaseTimeline";
import { CaseDocuments } from "@/components/case/CaseDocuments";
import { AIAnalysisPanel } from "@/components/case/AIAnalysisPanel";
import type { Dispute } from "@/lib/types";

const TABS = ["Overview", "Timeline", "Documents", "AI Assistant"] as const;
type Tab = (typeof TABS)[number];

export function CaseTabs({ dispute }: { dispute: Dispute }) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors",
              tab === t ? "border-blue text-blue" : "border-transparent text-text-muted hover:text-navy"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Overview" && <OverviewTab dispute={dispute} />}
        {tab === "Timeline" && (
          <Card>
            <CaseTimeline dispute={dispute} />
          </Card>
        )}
        {tab === "Documents" && (
          <Card>
            <CaseDocuments dispute={dispute} />
          </Card>
        )}
        {tab === "AI Assistant" && (
          <Card className="p-4">
            <ChatPanel
              disputeId={dispute.id}
              suggestions={[
                "What should I do next?",
                "What evidence do I still need?",
                "How long does mediation usually take?",
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ dispute }: { dispute: Dispute }) {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">What happened</p>
        <p className="mt-2 text-sm leading-relaxed text-navy">{dispute.description}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Other party</p>
          <p className="mt-2 text-sm text-navy">{dispute.otherPartyName || "Not specified"}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Desired outcome</p>
          <p className="mt-2 text-sm text-navy">{dispute.desiredOutcome || "Not specified"}</p>
        </Card>
      </div>
      <AIAnalysisPanel disputeId={dispute.id} />
    </div>
  );
}
