import { google } from "googleapis";
import { getAuthorizedClientForLawyer } from "@/infrastructure/google/google-oauth";

export interface CalendarEventResult {
  eventId: string;
  meetingUrl: string | null;
}

/**
 * Creates a Calendar event on the mediator's own connected Google
 * account with `conferenceData` set, which is what makes Google
 * auto-attach a Meet link, there is no separate "create a Meet link"
 * call, Meet links are a side effect of a Calendar event.
 */
export async function createMeetSession(input: {
  lawyerId: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
}): Promise<CalendarEventResult | null> {
  const client = await getAuthorizedClientForLawyer(input.lawyerId);
  if (!client) return null; // Not connected, caller falls back to a manual link.

  const calendar = google.calendar({ version: "v3", auth: client });

  const { data } = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startTime.toISOString() },
      end: { dateTime: input.endTime.toISOString() },
      attendees: input.attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `myright-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return {
    eventId: data.id ?? "",
    meetingUrl: data.hangoutLink ?? null,
  };
}

export async function cancelMeetSession(lawyerId: string, googleEventId: string): Promise<void> {
  const client = await getAuthorizedClientForLawyer(lawyerId);
  if (!client) return;
  const calendar = google.calendar({ version: "v3", auth: client });
  await calendar.events.delete({ calendarId: "primary", eventId: googleEventId }).catch(() => undefined);
}
