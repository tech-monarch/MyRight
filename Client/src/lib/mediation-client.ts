import { apiFetch } from "@/lib/api";
import type { AvailabilitySlot, MediationSession } from "@/lib/types";

export function getMyAvailability(): Promise<AvailabilitySlot[]> {
  return apiFetch<AvailabilitySlot[]>("/api/mediation/availability/me");
}

export function setMyAvailability(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
  return apiFetch<AvailabilitySlot[]>("/api/mediation/availability/me", { method: "PUT", body: { slots } });
}

export function listSessions(disputeId: string): Promise<MediationSession[]> {
  return apiFetch<MediationSession[]>(`/api/disputes/${disputeId}/sessions`);
}

export function createSession(
  disputeId: string,
  input: { scheduledStart: string; scheduledEnd: string; useDailyVideo: boolean; manualMeetingUrl?: string }
): Promise<MediationSession> {
  return apiFetch<MediationSession>(`/api/disputes/${disputeId}/sessions`, { method: "POST", body: input });
}

export function cancelSession(disputeId: string, sessionId: string): Promise<MediationSession> {
  return apiFetch<MediationSession>(`/api/disputes/${disputeId}/sessions/${sessionId}/cancel`, { method: "POST" });
}

export function submitOutcomeNotes(
  disputeId: string,
  sessionId: string,
  outcomeNotes: string
): Promise<MediationSession> {
  return apiFetch<MediationSession>(`/api/disputes/${disputeId}/sessions/${sessionId}/outcome`, {
    method: "POST",
    body: { outcomeNotes },
  });
}
