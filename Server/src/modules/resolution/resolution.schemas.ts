import { z } from "zod";

export const createResolutionSchema = z.object({
  terms: z.string().trim().min(10, "Describe the agreed terms in a bit more detail."),
});

export const disputantSignSchema = z.object({});

export const publicSignSchema = z.object({
  signerName: z.string().trim().min(2, "Enter your full name to sign."),
});
