"use client";

import { Check, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { getDisputeHistory } from "@/lib/disputes-client";
import { statusLabel } from "@/lib/dispute-display";
import type { Dispute, DisputeStatus } from "@/lib/types";

export function CaseTimeline({ dispute }: { dispute: Dispute }) {
  const { data: history, loading, error } = useApi(() => getDisputeHistory(dispute.id), [dispute.id]);
  const isResolved = dispute.status === "RESOLVED" || dispute.status === "WITHDRAWN";

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
        <Loader2 size={16} className="animate-spin" /> Loading timeline...
      </div>
    );
  }

  if (error || !history) {
    return <p className="py-8 text-sm text-text-muted">Couldn&apos;t load the timeline. Please try again.</p>;
  }

  return (
    <ol className="space-y-0">
      {history.map((event, i) => {
        const isLast = i === history.length - 1;
        const isCurrent = isLast && !isResolved;
        return (
          <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && <span className="absolute left-[11px] top-6 h-full w-px bg-border" aria-hidden />}
            <span
              className={
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white " +
                (isCurrent ? "bg-blue" : "bg-success")
              }
            >
              <Check size={14} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-navy">
                {statusLabel[event.status as DisputeStatus] ?? event.status}
              </p>
              {event.note && <p className="mt-0.5 text-sm text-text-muted">{event.note}</p>}
              <p className="mt-0.5 text-xs text-text-muted">
                {new Date(event.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </li>
        );
      })}

      {!isResolved && (
        <li className="flex gap-4 opacity-50">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border" />
          <div className="pt-0.5">
            <p className="text-sm font-semibold text-navy">What happens next</p>
            <p className="mt-0.5 text-sm text-text-muted">
              We&apos;ll update this timeline as your case progresses.
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}
