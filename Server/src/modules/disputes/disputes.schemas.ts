import { z } from "zod";

export const createDisputeSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10, "Tell us a bit more about what happened"),
  type: z.string().trim().min(2),
  otherPartyName: z.string().trim().optional(),
  otherPartyContact: z.string().trim().optional(),
  desiredOutcome: z.string().trim().optional(),
});

export const updateDisputeSchema = createDisputeSchema.partial();

export const mediationRequestSchema = z.object({
  contactMethod: z.enum(["email", "phone"]).optional(),
  contact: z.string().trim().optional(),
});
