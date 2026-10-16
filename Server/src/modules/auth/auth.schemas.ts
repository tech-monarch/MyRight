import { z } from "zod";
import { isPlausiblePhone } from "@/utils/phone";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  // Optional, but without it WhatsApp notifications can't reach this person.
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || isPlausiblePhone(v), "Enter a valid phone number")
    .optional(),
});

export const loginSchema = z.object({
  // Accepts either an email (disputants) or a username (lawyers/SuperAdmins).
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Use at least 8 characters"),
});

export const updateContactSchema = z
  .object({
    phone: z.string().trim().refine((v) => v === "" || isPlausiblePhone(v), "Enter a valid phone number").optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    // Required only when the email changes (it is the login identifier).
    currentPassword: z.string().optional(),
  })
  .refine((v) => v.phone !== undefined || v.email !== undefined, "Nothing to update");
