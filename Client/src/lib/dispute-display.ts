import type { DisputeStatus } from "@/lib/types";

export const statusLabel: Record<DisputeStatus, string> = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under review",
  MEDIATION_REQUESTED: "Mediation requested",
  AWAITING_OTHER_PARTY: "Awaiting other party",
  MEDIATOR_ASSIGNED: "Mediator assigned",
  IN_MEDIATION: "In mediation",
  RESOLVED: "Resolved",
  WITHDRAWN: "Withdrawn",
};

export const statusTone: Record<DisputeStatus, "blue" | "success" | "warning" | "neutral" | "danger"> = {
  DRAFT: "neutral",
  UNDER_REVIEW: "blue",
  MEDIATION_REQUESTED: "blue",
  AWAITING_OTHER_PARTY: "warning",
  MEDIATOR_ASSIGNED: "blue",
  IN_MEDIATION: "blue",
  RESOLVED: "success",
  WITHDRAWN: "danger",
};

// A short "what's happening" hint shown on the dashboard for disputes
// that are not yet resolved. Not fetched from the backend, it is a pure
// function of status, so it stays in sync automatically as a case moves
// through its lifecycle without a separate field to keep updated.
export function actionHint(status: DisputeStatus): string | null {
  switch (status) {
    case "UNDER_REVIEW":
      return "Add more detail or evidence to help your case move forward";
    case "AWAITING_OTHER_PARTY":
      return "Waiting for the other party to respond";
    case "MEDIATION_REQUESTED":
      return "Your mediation request has been sent";
    case "MEDIATOR_ASSIGNED":
      return "A mediator has been assigned to your case";
    default:
      return null;
  }
}
export const statusOrder: DisputeStatus[] = [
  "DRAFT",
  "UNDER_REVIEW",
  "MEDIATION_REQUESTED",
  "AWAITING_OTHER_PARTY",
  "MEDIATOR_ASSIGNED",
  "IN_MEDIATION",
  "RESOLVED",
];
