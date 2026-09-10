/**
 * Placeholder data for the SuperAdmin and Lawyer areas. Mirrors the domain
 * model in the RBAC spec (User with role, Courthouse, CaseAssignment,
 * AuditLog) so the real API swap later is a data layer change, not a UI
 * rewrite. All authorization here is cosmetic. The real backend must
 * enforce role and courthouse checks server side, this file only exists to
 * make the UI reviewable.
 */

export type LawyerStatus = "active" | "suspended" | "deactivated";

export interface Lawyer {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  specialization?: string;
  status: LawyerStatus;
  mustChangePassword: boolean;
  assignedCaseIds: string[];
  createdAt: string;
  lastActiveAt?: string;
}

export const courthouse = {
  id: "ch1",
  name: "Lagos Central ADR Courthouse",
};

export const lawyers: Lawyer[] = [
  {
    id: "l1",
    name: "Chinelo Adeyemi",
    username: "chinelo.adeyemi",
    email: "chinelo.adeyemi@myright.ng",
    phone: "0803 000 1111",
    specialization: "Tenancy & property disputes",
    status: "active",
    mustChangePassword: false,
    assignedCaseIds: ["d1"],
    createdAt: "2026-06-02",
    lastActiveAt: "2026-09-08",
  },
  {
    id: "l2",
    name: "Tunde Bakare",
    username: "tunde.bakare",
    email: "tunde.bakare@myright.ng",
    phone: "0803 000 2222",
    specialization: "Contract & commercial disputes",
    status: "active",
    mustChangePassword: false,
    assignedCaseIds: ["d2"],
    createdAt: "2026-07-15",
    lastActiveAt: "2026-09-07",
  },
  {
    id: "l3",
    name: "Grace Effiong",
    username: "grace.effiong",
    email: "grace.effiong@myright.ng",
    specialization: "Consumer disputes",
    status: "suspended",
    mustChangePassword: false,
    assignedCaseIds: [],
    createdAt: "2026-05-20",
    lastActiveAt: "2026-08-10",
  },
];

export function getLawyer(id: string): Lawyer | undefined {
  return lawyers.find((l) => l.id === id);
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  result: "success" | "denied";
}

export const auditLog: AuditLogEntry[] = [
  {
    id: "a1",
    actor: "SuperAdmin (You)",
    action: "Created lawyer account",
    target: "Tunde Bakare",
    timestamp: "2026-07-15 09:32",
    result: "success",
  },
  {
    id: "a2",
    actor: "SuperAdmin (You)",
    action: "Assigned case",
    target: "d2 to Tunde Bakare",
    timestamp: "2026-09-05 14:02",
    result: "success",
  },
  {
    id: "a3",
    actor: "Grace Effiong",
    action: "Attempted to access unassigned case",
    target: "Case d1",
    timestamp: "2026-08-09 11:45",
    result: "denied",
  },
  {
    id: "a4",
    actor: "SuperAdmin (You)",
    action: "Suspended lawyer account",
    target: "Grace Effiong",
    timestamp: "2026-08-10 08:15",
    result: "success",
  },
  {
    id: "a5",
    actor: "Chinelo Adeyemi",
    action: "Viewed case",
    target: "Case d1",
    timestamp: "2026-09-08 16:20",
    result: "success",
  },
];

/** Generates a temporary password. Real implementation must hash this
 * server side and never log or persist it in plaintext. */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
