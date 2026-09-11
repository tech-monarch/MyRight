import { z } from "zod";

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
});

export const setAvailabilitySchema = z.object({
  slots: z.array(slotSchema).max(50),
});

export const createSessionSchema = z
  .object({
    scheduledStart: z.string().datetime(),
    scheduledEnd: z.string().datetime(),
    useGoogleMeet: z.boolean().default(false),
    manualMeetingUrl: z.string().url().optional(),
  })
  .refine((data) => new Date(data.scheduledEnd) > new Date(data.scheduledStart), {
    message: "End time must be after the start time.",
    path: ["scheduledEnd"],
  });
