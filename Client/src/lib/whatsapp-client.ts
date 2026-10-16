import { apiFetch } from "@/lib/api";
import type { WhatsAppState } from "@/lib/types";

/** The same card manages either the platform default number or one courthouse's own number. */
export type WhatsAppBase = "/api/admin/whatsapp" | "/api/platform/whatsapp";

export const getWhatsAppStatus = (base: WhatsAppBase) => apiFetch<WhatsAppState>(`${base}/status`);
export const saveWhatsAppNumber = (base: WhatsAppBase, number: string) =>
  apiFetch<WhatsAppState>(`${base}/number`, { method: "PUT", body: { number } });
export const connectWhatsApp = (base: WhatsAppBase, mode: "code" | "qr") =>
  apiFetch<WhatsAppState>(`${base}/connect`, { method: "POST", body: { mode } });
export const disconnectWhatsApp = (base: WhatsAppBase) => apiFetch<WhatsAppState>(`${base}/disconnect`, { method: "POST" });
export const useDefaultWhatsApp = (base: WhatsAppBase) => apiFetch<WhatsAppState>(`${base}/number`, { method: "DELETE" });
