import { apiFetch } from "@/lib/api";
import type { AppNotification } from "@/lib/types";

export function listNotifications(): Promise<{ items: AppNotification[]; unreadCount: number }> {
  return apiFetch("/api/notifications");
}
export function getUnreadCount(): Promise<{ unreadCount: number }> {
  return apiFetch("/api/notifications?countOnly=1");
}
export function markNotificationRead(id: string): Promise<null> {
  return apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
}
export function markAllNotificationsRead(): Promise<null> {
  return apiFetch("/api/notifications/read-all", { method: "POST" });
}
