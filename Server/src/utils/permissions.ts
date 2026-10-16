import type { UserRole } from "@prisma/client";

/**
 * What a courthouse admin can delegate to COURTHOUSE_STAFF:
 *  - MANAGE_LAWYERS: create lawyers, suspend/reactivate them, reset passwords
 *  - ASSIGN_CASES:   assign cases to lawyers and unassign them
 *  - VIEW_CASES:     see the courthouse case list
 * Staff never get access to an individual case file (documents, AI chat,
 * sessions, resolutions): see canAccessDispute.
 */
export const STAFF_PERMISSIONS = ["MANAGE_LAWYERS", "ASSIGN_CASES", "VIEW_CASES"] as const;
export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

/**
 * A courthouse admin (SUPERADMIN) implicitly holds every permission inside
 * their own courthouse; staff hold only what they were delegated; nobody
 * else holds any.
 */
export function hasAnyPermission(
  user: { role: UserRole; permissions: string[] },
  needed: readonly StaffPermission[]
): boolean {
  if (user.role === "SUPERADMIN") return true;
  if (user.role === "COURTHOUSE_STAFF") return needed.some((p) => user.permissions.includes(p));
  return false;
}
