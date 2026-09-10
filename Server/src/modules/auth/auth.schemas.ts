import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
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
