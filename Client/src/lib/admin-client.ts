import { apiFetch } from "@/lib/api";
import type { Dispute, Lawyer, AuditLogEntry } from "@/lib/types";

export function listLawyers(): Promise<Lawyer[]> {
  return apiFetch<Lawyer[]>("/api/admin/lawyers");
}

export function getLawyer(id: string): Promise<Lawyer> {
  return apiFetch<Lawyer>(`/api/admin/lawyers/${id}`);
}

export interface CreateLawyerInput {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  specialization?: string;
}

export function createLawyer(input: CreateLawyerInput): Promise<{ lawyer: Lawyer; tempPassword: string }> {
  return apiFetch(`/api/admin/lawyers`, { method: "POST", body: input });
}

export function setLawyerStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"): Promise<Lawyer> {
  return apiFetch<Lawyer>(`/api/admin/lawyers/${id}/status`, { method: "POST", body: { status } });
}

export function resetLawyerPassword(id: string): Promise<{ tempPassword: string }> {
  return apiFetch(`/api/admin/lawyers/${id}/reset-password`, { method: "POST" });
}

export function assignCase(lawyerId: string, disputeId: string) {
  return apiFetch(`/api/admin/lawyers/${lawyerId}/assignments`, { method: "POST", body: { disputeId } });
}

export function removeAssignment(disputeId: string) {
  return apiFetch(`/api/admin/assignments/${disputeId}`, { method: "DELETE" });
}

export function listCourthouseCases(): Promise<Dispute[]> {
  return apiFetch<Dispute[]>("/api/admin/cases");
}

export function listAuditLog(): Promise<AuditLogEntry[]> {
  return apiFetch<AuditLogEntry[]>("/api/admin/audit-log");
}
