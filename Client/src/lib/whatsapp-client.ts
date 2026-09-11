import { apiFetch } from "@/lib/api";
import type { WhatsAppState } from "@/lib/types";

export function getWhatsAppStatus(): Promise<WhatsAppState> {
  return apiFetch<WhatsAppState>("/api/admin/whatsapp/status");
}

export function connectWhatsApp(): Promise<WhatsAppState> {
  return apiFetch<WhatsAppState>("/api/admin/whatsapp/connect", { method: "POST" });
}

export function disconnectWhatsApp(): Promise<WhatsAppState> {
  return apiFetch<WhatsAppState>("/api/admin/whatsapp/disconnect", { method: "POST" });
}
