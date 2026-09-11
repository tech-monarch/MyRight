import { apiFetch } from "@/lib/api";
import type { AvailabilitySlot, MediationSession, GoogleConnectionStatus } from "@/lib/types";

export function getMyAvailability(): Promise<AvailabilitySlot[]> {
  return apiFetch<AvailabilitySlot[]>("/api/mediation/availability/me");
}

export function setMyAvailability(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
  return apiFetch<AvailabilitySlot[]>("/api/mediation/availability/me", { method: "PUT", body: { slots } });
}

export function getGoogleStatus(): Promise<GoogleConnectionStatus> {
  return apiFetch<GoogleConnectionStatus>("/api/mediation/google/status");
}

export async function startGoogleConnect(): Promise<string> {
  const result = await apiFetch<{ url: string }>("/api/mediation/google/connect", { method: "POST" });
  return result.url;
}

export function disconnectGoogle(): Promise<void> {
  return apiFetch("/api/mediation/google/disconnect", { method: "POST" });
}

export function listSessions(disputeId: string): Promise<MediationSession[]> {
  return apiFetch<MediationSession[]>(`/api/disputes/${disputeId}/sessions`);
}

export function createSession(
  disputeId: string,
  input: { scheduledStart: string; scheduledEnd: string; useGoogleMeet: boolean; manualMeetingUrl?: string }
): Promise<MediationSession> {
  return apiFetch<MediationSession>(`/api/disputes/${disputeId}/sessions`, { method: "POST", body: input });
}

export function cancelSession(disputeId: string, sessionId: string): Promise<MediationSession> {
  return apiFetch<MediationSession>(`/api/disputes/${disputeId}/sessions/${sessionId}/cancel`, { method: "POST" });
}
