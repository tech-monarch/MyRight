import { z } from "zod";
import { isPlausiblePhone } from "@/utils/phone";
import { STAFF_PERMISSIONS } from "@/utils/permissions";

const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .regex(/^[a-z0-9._-]+$/, "Use only lowercase letters, numbers, dots, dashes, and underscores");

// Email and phone are REQUIRED for every account created by an admin: this
// is how the person is told about assigned cases, sessions and invitations.
const accountFields = {
  name: z.string().trim().min(2),
  username,
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().refine(isPlausiblePhone, "Enter a valid phone number, including the country code"),
};

export const createLawyerSchema = z.object({
  ...accountFields,
  specialization: z.string().trim().optional(),
});

export const permissionsSchema = z.array(z.enum(STAFF_PERMISSIONS)).max(STAFF_PERMISSIONS.length);

export const createStaffSchema = z.object({
  ...accountFields,
  permissions: permissionsSchema.default([]),
});

export const updateStaffPermissionsSchema = z.object({ permissions: permissionsSchema });

export const accountFieldsSchema = z.object(accountFields);

export const updateLawyerStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
});

export const assignCaseSchema = z.object({
  disputeId: z.string().min(1),
});
