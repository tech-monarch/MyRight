/**
 * Placeholder in-memory data so the dashboard, case list, and case detail
 * screens can be fully designed and reviewed before the real API exists.
 * Shapes here intentionally mirror the domain model described in the
 * architecture doc (Dispute, DisputeStatus, etc.) so wiring up the real
 * API later is a data-fetching swap, not a UI rewrite.
 */

export type DisputeStatus =
  | "draft"
  | "under_review"
  | "mediation_requested"
  | "awaiting_other_party"
  | "mediator_assigned"
  | "in_mediation"
  | "resolved";

export interface Dispute {
  id: string;
  title: string;
  type: string;
  status: DisputeStatus;
  updatedAt: string;
  actionRequired?: string;
}

export const disputes: Dispute[] = [
  {
    id: "d1",
    title: "Deposit not refunded, Yaba apartment",
    type: "Tenancy",
    status: "awaiting_other_party",
    updatedAt: "2026-09-06",
    actionRequired: "Waiting for landlord to respond",
  },
  {
    id: "d2",
    title: "Unpaid invoice, logo design work",
    type: "Contract / freelance",
    status: "under_review",
    updatedAt: "2026-09-08",
    actionRequired: "Upload your signed contract",
  },
  {
    id: "d3",
    title: "Faulty phone not replaced by vendor",
    type: "Consumer",
    status: "resolved",
    updatedAt: "2026-08-20",
  },
];

export const statusLabel: Record<DisputeStatus, string> = {
  draft: "Draft",
  under_review: "Under review",
  mediation_requested: "Mediation requested",
  awaiting_other_party: "Awaiting other party",
  mediator_assigned: "Mediator assigned",
  in_mediation: "In mediation",
  resolved: "Resolved",
};

export const statusTone: Record<
  DisputeStatus,
  "blue" | "success" | "warning" | "neutral"
> = {
  draft: "neutral",
  under_review: "blue",
  mediation_requested: "blue",
  awaiting_other_party: "warning",
  mediator_assigned: "blue",
  in_mediation: "blue",
  resolved: "success",
};

// Ordered lifecycle used to render the case-detail timeline. A dispute's
// current status determines which of these are "done" vs "upcoming".
export const statusOrder: DisputeStatus[] = [
  "draft",
  "under_review",
  "mediation_requested",
  "awaiting_other_party",
  "mediator_assigned",
  "in_mediation",
  "resolved",
];

export interface TimelineEvent {
  status: DisputeStatus | "created";
  label: string;
  date: string;
  note?: string;
}

export interface DisputeDocument {
  id: string;
  name: string;
  kind: "contract" | "receipt" | "photo" | "message" | "other";
  uploadedAt: string;
  sizeKb: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export interface DisputeDetail extends Dispute {
  summary: string;
  otherParty: string;
  desiredOutcome: string;
  timeline: TimelineEvent[];
  documents: DisputeDocument[];
  chat: ChatMessage[];
}

const detailById: Record<string, DisputeDetail> = {
  d1: {
    ...disputes[0]!,
    summary:
      "Landlord has withheld the full security deposit for three weeks after move-out, citing vague 'cleaning costs' with no receipts provided.",
    otherParty: "Landlord: Mr. Bassey Eyo",
    desiredOutcome: "Full refund of ₦450,000 deposit within 14 days",
    timeline: [
      { status: "created", label: "Dispute submitted", date: "2026-08-28" },
      {
        status: "under_review",
        label: "AI assessment completed",
        date: "2026-08-28",
        note: "Classified as a tenancy deposit dispute",
      },
      {
        status: "mediation_requested",
        label: "Mediation requested",
        date: "2026-09-02",
      },
      {
        status: "awaiting_other_party",
        label: "Waiting for landlord to respond",
        date: "2026-09-06",
      },
    ],
    documents: [
      { id: "doc1", name: "Tenancy agreement.pdf", kind: "contract", uploadedAt: "2026-08-28", sizeKb: 812 },
      { id: "doc2", name: "Move-out photos.zip", kind: "photo", uploadedAt: "2026-08-28", sizeKb: 4320 },
      { id: "doc3", name: "WhatsApp messages with landlord.pdf", kind: "message", uploadedAt: "2026-08-29", sizeKb: 210 },
    ],
    chat: [
      {
        id: "c1",
        role: "user",
        content: "My landlord refused to refund my deposit after I moved out, even though the apartment was in good condition.",
      },
      {
        id: "c2",
        role: "assistant",
        content:
          "Thanks for sharing that. This looks like a tenancy deposit dispute. A few quick questions: did your tenancy agreement mention how the deposit would be handled at move-out, and did you do a walk-through inspection with your landlord?",
      },
    ],
  },
  d2: {
    ...disputes[1]!,
    summary:
      "Client has not paid the final invoice for completed logo design work, despite signing off on the final deliverables over a month ago.",
    otherParty: "Client: Bright Path Retail Ltd.",
    desiredOutcome: "Payment of outstanding ₦180,000 invoice",
    timeline: [
      { status: "created", label: "Dispute submitted", date: "2026-09-05" },
      {
        status: "under_review",
        label: "AI assessment completed",
        date: "2026-09-05",
        note: "Classified as a freelance contract payment dispute",
      },
    ],
    documents: [
      { id: "doc4", name: "Signed contract.pdf", kind: "contract", uploadedAt: "2026-09-05", sizeKb: 540 },
    ],
    chat: [
      {
        id: "c3",
        role: "user",
        content: "A client hasn't paid my final invoice for logo design work even though they approved the final files.",
      },
    ],
  },
  d3: {
    ...disputes[2]!,
    summary:
      "Vendor initially refused to replace a phone that stopped charging within the warranty period. Resolved after mediation.",
    otherParty: "Vendor: TechHub Electronics",
    desiredOutcome: "Replacement device or full refund",
    timeline: [
      { status: "created", label: "Dispute submitted", date: "2026-07-30" },
      { status: "under_review", label: "AI assessment completed", date: "2026-07-30" },
      { status: "mediation_requested", label: "Mediation requested", date: "2026-08-02" },
      { status: "mediator_assigned", label: "Mediator assigned", date: "2026-08-05" },
      { status: "in_mediation", label: "Mediation session held", date: "2026-08-12" },
      {
        status: "resolved",
        label: "Resolved, replacement issued",
        date: "2026-08-20",
        note: "Vendor agreed to replace the device at no extra cost",
      },
    ],
    documents: [
      { id: "doc5", name: "Purchase receipt.jpg", kind: "receipt", uploadedAt: "2026-07-30", sizeKb: 120 },
    ],
    chat: [],
  },
};

export function getDisputeDetail(id: string): DisputeDetail | undefined {
  return detailById[id];
}
