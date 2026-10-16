import { describe, expect, it } from "vitest";
import { hasAnyPermission } from "../src/utils/permissions";
import { canAccessDispute } from "../src/modules/disputes/disputes.policy";
import { isPlausiblePhone, normalizePhone } from "../src/utils/phone";

const user = (role: string, permissions: string[] = [], id = "u1", courthouseId: string | null = "ch1") =>
  ({ id, role, status: "ACTIVE", name: "N", courthouseId, mustChangePassword: false, permissions }) as never;

describe("delegated permissions", () => {
  it("courthouse admins hold every permission", () => {
    expect(hasAnyPermission(user("SUPERADMIN"), ["MANAGE_LAWYERS"])).toBe(true);
    expect(hasAnyPermission(user("SUPERADMIN"), ["ASSIGN_CASES", "VIEW_CASES"])).toBe(true);
  });
  it("staff hold only what was delegated", () => {
    const staff = user("COURTHOUSE_STAFF", ["MANAGE_LAWYERS"]);
    expect(hasAnyPermission(staff, ["MANAGE_LAWYERS"])).toBe(true);
    expect(hasAnyPermission(staff, ["ASSIGN_CASES"])).toBe(false);
    expect(hasAnyPermission(staff, ["ASSIGN_CASES", "MANAGE_LAWYERS"])).toBe(true); // any-of
    expect(hasAnyPermission(user("COURTHOUSE_STAFF", []), ["VIEW_CASES"])).toBe(false);
  });
  it("nobody else holds any permission, whatever is in their list", () => {
    for (const role of ["LAWYER", "DISPUTANT", "PLATFORM_ADMIN"]) {
      expect(hasAnyPermission(user(role, ["MANAGE_LAWYERS", "ASSIGN_CASES", "VIEW_CASES"]), ["MANAGE_LAWYERS"])).toBe(false);
    }
  });
});

describe("opening an individual case file", () => {
  const dispute = { id: "d1", ownerId: "owner" } as never;
  const assignment = { lawyerId: "lawyer1", lawyer: { courthouseId: "ch1" } } as never;

  it("works for the owner, the assigned lawyer and the courthouse admin", () => {
    expect(canAccessDispute(user("DISPUTANT", [], "owner"), dispute, assignment)).toBe(true);
    expect(canAccessDispute(user("LAWYER", [], "lawyer1"), dispute, assignment)).toBe(true);
    expect(canAccessDispute(user("SUPERADMIN"), dispute, assignment)).toBe(true);
  });
  it("is denied to staff EVEN WITH every permission, and to the platform owner", () => {
    const all = ["MANAGE_LAWYERS", "ASSIGN_CASES", "VIEW_CASES"];
    expect(canAccessDispute(user("COURTHOUSE_STAFF", all), dispute, assignment)).toBe(false);
    expect(canAccessDispute(user("COURTHOUSE_STAFF", all), dispute, null)).toBe(false);
    expect(canAccessDispute(user("PLATFORM_ADMIN", [], "p", null), dispute, assignment)).toBe(false);
    expect(canAccessDispute(user("PLATFORM_ADMIN", [], "p", null), dispute, null)).toBe(false);
  });
  it("is still denied to other disputants, other lawyers and other courthouses' admins", () => {
    expect(canAccessDispute(user("DISPUTANT", [], "someone"), dispute, assignment)).toBe(false);
    expect(canAccessDispute(user("LAWYER", [], "lawyer2"), dispute, assignment)).toBe(false);
    expect(canAccessDispute(user("SUPERADMIN", [], "a2", "ch2"), dispute, assignment)).toBe(false);
  });
});

describe("phone numbers", () => {
  it("normalizes and validates", () => {
    expect(normalizePhone("07012345678")).toBe("2347012345678");
    expect(isPlausiblePhone("07012345678")).toBe(true);
    expect(isPlausiblePhone("+234 704 342 7233")).toBe(true);
    expect(isPlausiblePhone("12345")).toBe(false);
    expect(isPlausiblePhone("not a number")).toBe(false);
  });
});
