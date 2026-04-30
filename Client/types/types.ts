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

export type Dispute = {
  id: string;
  title: string;
  category: string;
  status: "AI Assessment" | "Invited Party" | "In Mediation" | "Resolved";
  dateInitiated: string;
};

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

export type DisputeCategory =
  | "Landlord-Tenant"
  | "Business/Contract"
  | "Employment"
  | "Consumer/Retail"
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
  | "SUCCESS";

export type AIMessageRole = "ai" | "user";

export interface AIMessageProps {
  role: AIMessageRole;
  content: string | React.ReactNode;
  animate?: boolean;
}

