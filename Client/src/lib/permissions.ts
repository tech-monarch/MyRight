import type { StaffPermission, User } from "@/lib/types";

export const PERMISSION_LABELS: Record<StaffPermission, { label: string; hint: string }> = {
  MANAGE_LAWYERS: { label: "Add and manage lawyers", hint: "Create lawyer accounts, suspend or reactivate them, reset their passwords." },
  ASSIGN_CASES: { label: "Assign cases to lawyers", hint: "Choose which lawyer handles each case." },
  VIEW_CASES: { label: "View the case list", hint: "See the courthouse's cases (never the documents or messages inside them)." },
};

/** Courthouse admins can do everything in their courthouse; staff only what they were delegated. Mirrors the backend rule, which is the real enforcement. */
export function canDo(user: User | null | undefined, ...needed: StaffPermission[]): boolean {
  if (!user) return false;
  if (user.role === "SUPERADMIN") return true;
  if (user.role === "COURTHOUSE_STAFF") return needed.some((p) => user.permissions?.includes(p));
  return false;
}
