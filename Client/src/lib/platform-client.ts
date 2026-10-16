import { apiFetch } from "@/lib/api";
import type { PlatformCourthouse, User } from "@/lib/types";

export interface NewAccountInput {
  name: string;
  username: string;
  email: string;
  phone: string;
}

export const listCourthouses = () => apiFetch<PlatformCourthouse[]>("/api/platform/courthouses");

export const createCourthouse = (input: { name: string; admin: NewAccountInput }) =>
  apiFetch<{ courthouse: { id: string; name: string }; admin: User; tempPassword: string }>("/api/platform/courthouses", {
    method: "POST",
    body: input,
  });

export const addCourthouseAdmin = (courthouseId: string, input: NewAccountInput) =>
  apiFetch<{ admin: User; tempPassword: string }>(`/api/platform/courthouses/${courthouseId}/admins`, { method: "POST", body: input });

export const setAdminStatus = (id: string, status: "ACTIVE" | "SUSPENDED") =>
  apiFetch<User>(`/api/platform/admins/${id}/status`, { method: "POST", body: { status } });

export const resetAdminPassword = (id: string) =>
  apiFetch<{ tempPassword: string }>(`/api/platform/admins/${id}/reset-password`, { method: "POST" });
