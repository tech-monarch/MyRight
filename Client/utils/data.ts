import type { DashboardStats, Dispute, Agreement, User } from "../src/types/types";

export const DUMMY_USER: User = {
  id: "USR-0001",
  fullName: "Adeyemi Okafor",
  email: "adeyemi.okafor@myright.ng",
  role: "DISPUTANT",
  isCertified: false,
  createdAt: new Date("2025-09-01"),
};
export const DUMMY_STATS: DashboardStats = {
  totalDisputes: 12,
  activeMediations: 3,
  resolvedCases: 9,
};

export const DUMMY_ACTIVE_DISPUTES: Dispute[] = [
  {
    id: "DSP-2026-001",
    title: "Commercial Lease Disagreement",
    category: "Landlord-Tenant",
    status: "In Mediation",
    dateInitiated: "2026-04-10",
  },
  {
    id: "DSP-2026-004",
    title: "Software Development Contract Breach",
    category: "Business B2B",
    status: "AI Assessment",
    dateInitiated: "2026-04-25",
  },
  {
    id: "DSP-2026-007",
    title: "Neighbor Property Line Dispute",
    category: "Property",
    status: "Invited Party",
    dateInitiated: "2026-04-28",
  },
];

export const DUMMY_RECENT_AGREEMENTS: Agreement[] = [
  {
    id: "AGR-2026-001",
    title: "Settlement Agreement: Vendor Supply Dispute",
    dateSigned: "2026-03-15",
  },
  {
    id: "AGR-2025-042",
    title: "Mediation Output: Freelance Payment",
    dateSigned: "2025-11-02",
  },
];
