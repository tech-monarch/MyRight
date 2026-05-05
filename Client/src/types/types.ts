type UserRole = "DISPUTANT" | "MEDIATOR" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  bio?: string;
  specialization?: string[];
  isCertified: boolean;
  createdAt: Date;
};

export type ChatMessage = {
  id: string;
  disputeId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  timestamp: Date;
};

export type MediationSession = {
  disputeId: string;
  mediatorId: string;
  partyA_Id: string;
  partyB_Id: string;
  startTime: Date;
  isLive: boolean;
};

export type Settlement = {
  id: string;
  disputeId: string;
  mediatorId: string;
  agreementText: string;
  isSignedByAll: boolean;
  documentUrl: string;
  resolvedAt: Date;
};

export type UserFeedback = {
  id: string;
  userId: string;
  rating: number;
  comments: string;
};

export interface Dispute {
  id: string;
  title: string;
  description?: string; // may not be used everywhere
  category: string;
  status: "pending" | "invited" | "in_mediation" | "resolved"; // backend status strings
  dateInitiated: string; // formatted string
  opponentName: string;
  opponentEmail: string;
  opponentPhone: string;
  opponentOrganization?: string;
}

export type Agreement = {
  id: string;
  title: string;
  dateSigned: string;
};

export type DashboardStats = {
  totalDisputes: number;
  activeMediations: number;
  resolvedCases: number;
};

// FIX: expanded to cover all categories Gemini and dummy data can return
export type DisputeCategory =
  | "Landlord-Tenant"
  | "Business/Contract"
  | "Business B2B"
  | "Employment"
  | "Consumer/Retail"
  | "Consumer/Product"
  | "Property/Real Estate"
  | "Property"
  | "Police/Law Enforcement"
  | "Cult/Street Violence"
  | "Family/Domestic Violence"
  | "Debt/Finance"
  | "Neighbour"
  | "Other";

export type DisputeFormData = {
  category: DisputeCategory | "";
  description: string;
  opponentName: string;
  opponentContact: string;
  attachments: File[];
};

export type AIPhase =
  | "GREETING"
  | "INTAKE"
  | "ANALYZING"
  | "OPPONENT_ASK"
  | "OPPONENT_WAIT"
  | "REVIEW_ASK"
  | "REVIEW_WAIT"
  | "SUBMITTING"
  | "SUCCESS"
  | "CLARIFYING_WAIT";

export type AIMessageRole = "ai" | "user";

export interface AIMessageProps {
  role: AIMessageRole;
  content: string | React.ReactNode;
  animate?: boolean;
}

export interface AnalysisResult {
  summary: string;
  keyIssues: string[];
  relevantLaws: string[];
  ADRRecommendation: string;
  nextSteps: string[];
  urgencyLevel: string;
  estimatedDuration: string;
  riskNotes: string;
  localResources: string | null;
}
