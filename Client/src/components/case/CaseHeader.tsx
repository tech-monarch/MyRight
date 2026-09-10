import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { statusLabel, statusTone } from "@/lib/dispute-display";
import type { Dispute } from "@/lib/types";

export function CaseHeader({ dispute, showMediationAction = true }: { dispute: Dispute; showMediationAction?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone[dispute.status]}>{statusLabel[dispute.status]}</Badge>
            <span className="text-xs text-text-muted">{dispute.type}</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">{dispute.title}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Updated{" "}
            {new Date(dispute.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        {showMediationAction && dispute.status !== "RESOLVED" && dispute.status !== "WITHDRAWN" && (
          <ButtonLink href={`/dashboard/disputes/${dispute.id}/mediation`} variant="secondary" size="sm">
            Request mediation
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
