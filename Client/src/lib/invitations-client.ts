import { apiFetch } from "@/lib/api";
import type { PartyResponse } from "@/lib/types";

export interface InvitationView {
  disputeTitle: string;
  requesterName: string;
  response: PartyResponse;
  open: boolean;
}

export function getInvitation(token: string): Promise<InvitationView> {
  return apiFetch(`/api/invitations/${token}`);
}
export function respondToInvitation(token: string, accept: boolean): Promise<{ response: PartyResponse; alreadyAnswered: boolean }> {
  return apiFetch(`/api/invitations/${token}/respond`, { method: "POST", body: { accept } });
}
