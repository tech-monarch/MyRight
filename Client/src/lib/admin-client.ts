import { apiFetch } from "@/lib/api";
import type { Dispute, Lawyer, AuditLogEntry, StaffPermission, User } from "@/lib/types";

export function listLawyers(): Promise<Lawyer[]> {
  return apiFetch<Lawyer[]>("/api/admin/lawyers");
}

export function getLawyer(id: string): Promise<Lawyer> {
  return apiFetch<Lawyer>(`/api/admin/lawyers/${id}`);
}

export interface CreateLawyerInput {
  name: string;
  username: string;
  email: string;
  phone: string;
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

export interface CreateStaffInput {
  name: string;
  username: string;
  email: string;
  phone: string;
  permissions: StaffPermission[];
}

export function listStaff(): Promise<User[]> {
  return apiFetch<User[]>("/api/admin/staff");
}
export function createStaff(input: CreateStaffInput): Promise<{ staff: User; tempPassword: string }> {
  return apiFetch("/api/admin/staff", { method: "POST", body: input });
}
export function setStaffPermissions(id: string, permissions: StaffPermission[]): Promise<User> {
  return apiFetch<User>(`/api/admin/staff/${id}/permissions`, { method: "POST", body: { permissions } });
}
export function setStaffStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"): Promise<User> {
  return apiFetch<User>(`/api/admin/staff/${id}/status`, { method: "POST", body: { status } });
}
export function resetStaffPassword(id: string): Promise<{ tempPassword: string }> {
  return apiFetch(`/api/admin/staff/${id}/reset-password`, { method: "POST" });
}
