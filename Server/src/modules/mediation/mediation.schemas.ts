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
    // Defaults true, unlike the old Google Meet flag: Daily needs no
    // per-mediator connection, so there is no reason to default to "off"
    // the way useGoogleMeet had to (a mediator might not have connected
    // Google yet). A mediator can still opt out and paste a manual link.
    useDailyVideo: z.boolean().default(true),
    manualMeetingUrl: z.string().url().optional(),
  })
  .refine((data) => new Date(data.scheduledEnd) > new Date(data.scheduledStart), {
    message: "End time must be after the start time.",
    path: ["scheduledEnd"],
  });

export const submitOutcomeNotesSchema = z.object({
  outcomeNotes: z.string().trim().min(3, "Add a short note about how the session went."),
});
