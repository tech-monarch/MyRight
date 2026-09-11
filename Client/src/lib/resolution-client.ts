import { apiFetch } from "@/lib/api";
import type { Resolution } from "@/lib/types";

export function getResolution(disputeId: string): Promise<Resolution | null> {
  return apiFetch<Resolution | null>(`/api/disputes/${disputeId}/resolution`);
}

export function createResolution(
  disputeId: string,
  terms: string
): Promise<{ resolution: Resolution; signingUrl: string }> {
  return apiFetch(`/api/disputes/${disputeId}/resolution`, { method: "POST", body: { terms } });
}

export function signAsDisputant(disputeId: string): Promise<Resolution> {
  return apiFetch<Resolution>(`/api/disputes/${disputeId}/resolution/sign`, { method: "POST" });
}

// --- Public signing (the other party, no MyRight account) ---

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface PublicResolutionView {
  disputeTitle: string;
  terms: string;
  alreadySigned: boolean;
}

export async function getPublicResolution(token: string): Promise<PublicResolutionView> {
  const res = await fetch(`${API_BASE}/api/sign/${token}`);
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error?.message ?? "This signing link is invalid or has expired.");
  return payload.data;
}

export async function signPublicResolution(token: string, signerName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sign/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signerName }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error?.message ?? "Couldn't sign this resolution.");
}
