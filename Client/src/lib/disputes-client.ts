import { apiFetch, apiUpload } from "@/lib/api";
import type { Dispute, DisputeDocument, ChatMessage, DisputeAnalysis } from "@/lib/types";

export interface StatusHistoryEntry {
  id: string;
  disputeId: string;
  status: string;
  note: string | null;
  createdAt: string;
}

export function listMyDisputes(): Promise<Dispute[]> {
  return apiFetch<Dispute[]>("/api/disputes");
}

export function getDispute(id: string): Promise<Dispute> {
  return apiFetch<Dispute>(`/api/disputes/${id}`);
}

export function getDisputeHistory(id: string): Promise<StatusHistoryEntry[]> {
  return apiFetch<StatusHistoryEntry[]>(`/api/disputes/${id}/history`);
}

export interface CreateDisputeInput {
  title: string;
  description: string;
  type: string;
  otherPartyName?: string;
  otherPartyContact?: string;
  desiredOutcome?: string;
}

export function createDispute(input: CreateDisputeInput): Promise<Dispute> {
  return apiFetch<Dispute>("/api/disputes", { method: "POST", body: input });
}

export function requestMediation(
  id: string,
  input: { contactMethod?: "email" | "phone"; contact?: string }
): Promise<Dispute> {
  return apiFetch<Dispute>(`/api/disputes/${id}/mediation-request`, { method: "POST", body: input });
}

export function listDocuments(disputeId: string): Promise<DisputeDocument[]> {
  return apiFetch<DisputeDocument[]>(`/api/disputes/${disputeId}/documents`);
}

export function uploadDocument(disputeId: string, file: File): Promise<DisputeDocument> {
  return apiUpload<DisputeDocument>(`/api/disputes/${disputeId}/documents`, file);
}

export function listMessages(disputeId: string): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>(`/api/disputes/${disputeId}/messages`);
}

export function sendMessage(
  disputeId: string,
  message: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  return apiFetch(`/api/disputes/${disputeId}/messages`, { method: "POST", body: { message } });
}

export function runAnalysis(disputeId: string): Promise<DisputeAnalysis> {
  return apiFetch<DisputeAnalysis>(`/api/disputes/${disputeId}/analysis`, { method: "POST" });
}

export function getLatestAnalysis(disputeId: string): Promise<DisputeAnalysis | null> {
  return apiFetch<DisputeAnalysis | null>(`/api/disputes/${disputeId}/analysis`);
}
