import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";

const BASE_URL = "https://api.daily.co/v1";

/**
 * Daily.co replaces the earlier Google Meet integration. The important
 * difference: this uses one platform-level API key (yours), not a
 * per-mediator OAuth connection. A mediator never has to "connect" any
 * account, session creation just works. This is also why the
 * GoogleAccountConnection model and its encryption machinery were
 * deleted rather than left dormant, there is nothing analogous to keep.
 */
function assertConfigured() {
  if (!env.DAILY_API_KEY) {
    throw new AppError(503, "DAILY_NOT_CONFIGURED", "Video sessions are not configured on this server yet.");
  }
}

async function dailyFetch(path: string, options: { method?: string; body?: unknown } = {}) {
  assertConfigured();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env.DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error("Daily.co API error", res.status, errorBody);
    throw new AppError(502, "VIDEO_PROVIDER_ERROR", "The video service is temporarily unavailable. Please try again.");
  }

  return res.json();
}

export interface CreatedRoom {
  name: string;
  url: string;
}

export async function createSessionRoom(input: {
  disputeId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}): Promise<CreatedRoom> {
  // Joinable 10 minutes early, and left open 2 hours past the scheduled
  // end as overrun grace, a mediation running long shouldn't get cut off
  // mid-conversation, eject_at_room_exp handles the hard close instead.
  const nbf = Math.floor(input.scheduledStart.getTime() / 1000) - 10 * 60;
  const exp = Math.floor(input.scheduledEnd.getTime() / 1000) + 2 * 60 * 60;

  const data = await dailyFetch("/rooms", {
    method: "POST",
    body: {
      name: `mediation-${input.disputeId}-${Date.now()}`,
      // Public rather than requiring per-participant meeting tokens: the
      // disputant and the other party have no Daily accounts, and this
      // matches how the link is already delivered (WhatsApp/email, same
      // as the old Meet link). The real access control is
      // enable_knocking below, an attacker guessing a room name is
      // impractical, but even someone with the link cannot get into an
      // active session without the mediator explicitly admitting them.
      privacy: "public",
      properties: {
        nbf,
        exp,
        eject_at_room_exp: true,
        max_participants: 10,
        enable_knocking: true, // real waiting room, mediator admits each party
        enable_breakout_rooms: true, // supports caucusing (mediator meeting privately with one side)
        enable_screenshare: true,
        enable_chat: true,
        enable_live_captions_ui: true,
        enable_prejoin_ui: true, // camera/mic check before joining, reduces "oops I was muted" confusion
        start_video_off: false,
        start_audio_off: false,
      },
    },
  });

  return { name: data.name, url: data.url };
}

export async function deleteRoom(roomName: string): Promise<void> {
  await dailyFetch(`/rooms/${encodeURIComponent(roomName)}`, { method: "DELETE" }).catch((err) => {
    // A room that's already gone (expired/manually deleted) is not worth
    // failing the caller's request over, this is best-effort cleanup.
    console.error(`Failed to delete Daily room ${roomName}`, err);
  });
}

export interface RoomParticipant {
  participantName: string;
  joinedAt: Date | null;
  leftAt: Date | null;
  durationSec: number | null;
}

/**
 * Pulled on demand (see mediation.controller.ts) rather than pushed via
 * webhook. A webhook would give real-time tracking, but needs a public
 * endpoint registered in Daily's dashboard, extra setup this project
 * doesn't need yet, since MyRight only cares about attendance as a
 * record after the fact, not who's in the call right now.
 */
export async function getRoomPresence(roomName: string): Promise<RoomParticipant[]> {
  const data = await dailyFetch(`/rooms/${encodeURIComponent(roomName)}/presence`);
  const participants = data?.data ?? [];
  return participants.map((p: any) => ({
    participantName: p.userName || p.user_name || "Unknown participant",
    joinedAt: p.joinTime ? new Date(p.joinTime * 1000) : null,
    leftAt: p.leaveTime ? new Date(p.leaveTime * 1000) : null,
    durationSec: p.duration ?? null,
  }));
}
