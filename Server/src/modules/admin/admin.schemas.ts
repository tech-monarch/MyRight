import { z } from "zod";

export const createLawyerSchema = z.object({
  name: z.string().trim().min(2),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .regex(/^[a-z0-9._-]+$/, "Use only lowercase letters, numbers, dots, dashes, and underscores"),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().optional(),
  specialization: z.string().trim().optional(),
});

export const updateLawyerStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
});

export const assignCaseSchema = z.object({
  disputeId: z.string().min(1),
});
