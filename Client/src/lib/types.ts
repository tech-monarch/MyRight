// Mirrors the backend's Prisma models closely enough for the frontend's
// purposes. Kept hand-written rather than generated, the backend has no
// OpenAPI/schema export step yet, see README for that as a suggested
// follow-up once the API surface stabilizes.

export type UserRole = "DISPUTANT" | "LAWYER" | "SUPERADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface User {
  id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  specialization: string | null;
  courthouseId: string | null;
  mustChangePassword: boolean;
  createdAt: string;
}

export type DisputeStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "MEDIATION_REQUESTED"
  | "AWAITING_OTHER_PARTY"
  | "MEDIATOR_ASSIGNED"
  | "IN_MEDIATION"
  | "RESOLVED"
  | "WITHDRAWN";

export interface Dispute {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: string;
  otherPartyName: string | null;
  otherPartyContact: string | null;
  desiredOutcome: string | null;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  assignment?: { lawyerId: string; lawyer?: { name: string } } | null;
}

export type DocumentStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export interface DisputeDocument {
  id: string;
  disputeId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  disputeId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  sources: string[] | null;
  createdAt: string;
}

export interface DisputeAnalysis {
  summary: string;
  issues: string[];
  possibleADRPaths: string[];
  urgency: "low" | "medium" | "high";
  recommendedNextSteps: string[];
  risks: string[];
  questionsForUser: string[];
  sources: { type: "knowledge" | "document"; id: string; title: string; detail?: string }[];
}

export interface Lawyer extends User {
  role: "LAWYER";
  assignments: { disputeId: string }[];
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorLabel: string;
  action: string;
  targetType: string;
  targetId: string | null;
  result: "SUCCESS" | "DENIED";
  createdAt: string;
}
