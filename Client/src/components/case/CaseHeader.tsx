import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { statusLabel, statusTone } from "@/lib/dispute-display";
import type { Dispute } from "@/lib/types";

/**
 * Offered only when it can actually do something: a submitted case that
 * hasn't been requested yet, or one stuck as "requested" whose invitation
 * never went out. Drafts must be submitted first; anything already under way
 * (waiting on the other party, mediator assigned, in mediation) or closed
 * has nothing left to request.
 */
function canRequestMediation(d: Dispute) {
  return d.status === "UNDER_REVIEW" || (d.status === "MEDIATION_REQUESTED" && !d.otherPartyResponse);
}

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
        {showMediationAction && canRequestMediation(dispute) && (
          <ButtonLink href={`/dashboard/disputes/${dispute.id}/mediation`} variant="secondary" size="sm">
            {dispute.status === "MEDIATION_REQUESTED" ? "Finish mediation request" : "Request mediation"}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
