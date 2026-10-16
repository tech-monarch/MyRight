"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, FileSignature, Handshake, Loader2, Scale, UserPlus, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/notifications-client";
import { timeAgo } from "@/lib/time";
import type { AppNotification } from "@/lib/types";

function iconFor(type: string) {
  if (type === "lawyer_assigned") return Scale;
  if (type.startsWith("mediation_") || type.startsWith("invitation_")) return Handshake;
  if (type === "session_scheduled") return Video;
  if (type === "signing_request" || type === "resolution_signed") return FileSignature;
  if (type === "account_created") return UserPlus;
  return Bell;
}

/** Real, per-user notifications. Shared by the disputant and lawyer notification pages. */
export function NotificationsList() {
  const router = useRouter();
  const { data, loading, error, refetch } = useApi(() => listNotifications(), []);
  const [busy, setBusy] = useState(false);

  async function open(n: AppNotification) {
    if (!n.readAt) await markNotificationRead(n.id).catch(() => undefined);
    if (n.link) router.push(n.link);
    else refetch();
  }

  async function markAll() {
    setBusy(true);
    await markAllNotificationsRead().catch(() => undefined);
    setBusy(false);
    refetch();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={20} className="animate-spin text-blue" />
      </div>
    );
  }
  if (error) return <p className="py-10 text-center text-sm text-danger">{error}</p>;

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <Card className="text-center">
        <Bell size={22} className="mx-auto text-text-muted" />
        <p className="mt-2 text-sm font-medium text-navy">You&apos;re all caught up</p>
        <p className="mt-1 text-sm text-text-muted">Updates about your cases will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {(data?.unreadCount ?? 0) > 0 && (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={markAll} disabled={busy} icon={<CheckCheck size={14} />}>
            Mark all as read
          </Button>
        </div>
      )}
      {items.map((n) => {
        const Icon = iconFor(n.type);
        return (
          <button key={n.id} onClick={() => open(n)} className="block w-full text-left">
            <Card className={`flex items-start gap-3 transition-colors hover:border-blue ${n.readAt ? "" : "border-blue-light bg-blue-light/30"}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy">{n.title}</p>
                  {!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-blue" />}
                </div>
                <p className="mt-0.5 whitespace-pre-line text-sm text-text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-text-muted">{timeAgo(n.createdAt)}</p>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
