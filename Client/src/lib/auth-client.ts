import { apiFetch, ApiError, clearCachedCsrfToken } from "@/lib/api";
import type { User } from "@/lib/types";

export function roleHome(role: User["role"]): string {
  if (role === "SUPERADMIN") return "/admin";
  if (role === "LAWYER") return "/lawyer";
  return "/dashboard";
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

async function run(fn: () => Promise<User>): Promise<AuthResult> {
  try {
    const user = await fn();
    return { success: true, user };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.message };
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export function login(email: string, password: string): Promise<AuthResult> {
  return run(() => apiFetch<User>("/api/auth/login", { method: "POST", body: { identifier: email, password } }));
}

export function register(data: { name: string; email: string; password: string }): Promise<AuthResult> {
  return run(() => apiFetch<User>("/api/auth/register", { method: "POST", body: data }));
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
  clearCachedCsrfToken();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/api/auth/me");
  } catch {
    return null;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch("/api/auth/change-password", { method: "POST", body: { currentPassword, newPassword } });
}
