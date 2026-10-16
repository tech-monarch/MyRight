"use client";

import { useState } from "react";
import { CalendarPlus, Check, ChevronDown, Loader2, Users, Video, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { useApi } from "@/lib/useApi";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { listSessions, createSession, cancelSession, submitOutcomeNotes, getJoinUrl } from "@/lib/mediation-client";
import { ApiError } from "@/lib/api";
import type { Dispute, MediationSession } from "@/lib/types";

export function MediationPanel({ dispute }: { dispute: Dispute }) {
  const { data: user } = useCurrentUser();
  const { data: sessions, loading, refetch } = useApi(() => listSessions(dispute.id), [dispute.id]);
  const [showForm, setShowForm] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  const isMediator = user?.role === "LAWYER" || user?.role === "SUPERADMIN";

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy">Mediation sessions</h2>
          {isMediator && !showForm && (
            <Button size="sm" variant="secondary" icon={<CalendarPlus size={14} />} onClick={() => setShowForm(true)}>
              Schedule session
            </Button>
          )}
        </div>

        {showForm && (
          <ScheduleForm
            disputeId={dispute.id}
            onDone={() => {
              setShowForm(false);
              refetch();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading && (
          <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
            <Loader2 size={14} className="animate-spin" /> Loading sessions...
          </p>
        )}

        {sessions && sessions.length === 0 && !showForm && (
          <p className="mt-4 text-sm text-text-muted">No mediation sessions scheduled yet.</p>
        )}

        {sessions && sessions.length > 0 && (
          <ul className="mt-4 space-y-3">
            {sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                disputeId={dispute.id}
                isMediator={isMediator}
                isActiveCall={activeCallId === s.id}
                onToggleCall={() => setActiveCallId((id) => (id === s.id ? null : s.id))}
                onChanged={refetch}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SessionRow({
  session,
  disputeId,
  isMediator,
  isActiveCall,
  onToggleCall,
  onChanged,
}: {
  session: MediationSession;
  disputeId: string;
  isMediator: boolean;
  isActiveCall: boolean;
  onToggleCall: () => void;
  onChanged: () => void;
}) {
  const isPast = new Date(session.scheduledEnd) < new Date();
  const canJoin = session.status === "SCHEDULED" && !!session.meetingUrl;
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Rooms are private: the server mints a personal, short-lived link for
  // whoever is signed in (the mediator's lets them admit people from the lobby).
  async function handleToggle() {
    if (isActiveCall) {
      onToggleCall();
      return;
    }
    setJoining(true);
    setJoinError("");
    try {
      setJoinUrl(await getJoinUrl(disputeId, session.id));
      onToggleCall();
    } catch (err) {
      setJoinError(err instanceof ApiError ? err.message : "Couldn't open the call. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <li className="rounded-lg border border-border">
      <div className="flex items-center justify-between px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy">
            {new Date(session.scheduledStart).toLocaleString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone={session.status === "SCHEDULED" ? "blue" : session.status === "COMPLETED" ? "success" : "neutral"}>
              {session.status.toLowerCase()}
            </Badge>
            {session.attendance.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Users size={12} /> {session.attendance.length} joined
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {canJoin && (
            <button
              onClick={handleToggle}
              disabled={joining}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue hover:underline disabled:opacity-60"
            >
              {joining ? <Loader2 size={12} className="animate-spin" /> : <Video size={12} />} {isActiveCall ? "Hide call" : "Join call"}
              <ChevronDown size={12} className={isActiveCall ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
          )}
          {isMediator && session.status === "SCHEDULED" && (
            <button
              onClick={() => cancelSession(disputeId, session.id).then(onChanged)}
              className="text-text-muted hover:text-danger"
              aria-label="Cancel session"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {joinError && <p className="border-t border-border px-3.5 py-2 text-xs text-danger">{joinError}</p>}

      {isActiveCall && joinUrl && (
        <div className="border-t border-border bg-navy">
          <iframe
            src={joinUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="aspect-video w-full"
            style={{ border: 0 }}
          />
        </div>
      )}

      {session.attendance.length > 0 && (
        <div className="border-t border-border px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Attendance</p>
          <ul className="mt-1.5 space-y-1">
            {session.attendance.map((a) => (
              <li key={a.id} className="text-xs text-text-muted">
                {a.participantName}
                {a.durationSec ? ` \u00b7 ${Math.round(a.durationSec / 60)} min` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isPast && (isMediator || session.outcomeNotes) && (
        <div className="border-t border-border px-3.5 py-3">
          <OutcomeNotes
            disputeId={disputeId}
            session={session}
            isMediator={isMediator}
            onSaved={onChanged}
          />
        </div>
      )}
    </li>
  );
}

function OutcomeNotes({
  disputeId,
  session,
  isMediator,
  onSaved,
}: {
  disputeId: string;
  session: MediationSession;
  isMediator: boolean;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(session.outcomeNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!editing) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Session notes</p>
        {session.outcomeNotes ? (
          <p className="mt-1.5 whitespace-pre-line text-sm text-navy">{session.outcomeNotes}</p>
        ) : (
          <p className="mt-1.5 text-sm text-text-muted">No notes recorded yet.</p>
        )}
        {isMediator && (
          <button onClick={() => setEditing(true)} className="mt-2 text-xs font-semibold text-blue hover:underline">
            {session.outcomeNotes ? "Edit notes" : "Add notes"}
          </button>
        )}
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await submitOutcomeNotes(disputeId, session.id, notes);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Session notes</p>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      <Textarea
        rows={3}
        className="mt-1.5"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What happened in this session? Any agreements reached, or what's needed next..."
      />
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving} icon={saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ScheduleForm({
  disputeId,
  onDone,
  onCancel,
}: {
  disputeId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [useDailyVideo, setUseDailyVideo] = useState(true);
  const [manualUrl, setManualUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("Choose a date.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createSession(disputeId, {
        scheduledStart: new Date(`${date}T${startTime}:00`).toISOString(),
        scheduledEnd: new Date(`${date}T${endTime}:00`).toISOString(),
        useDailyVideo,
        manualMeetingUrl: !useDailyVideo && manualUrl ? manualUrl : undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't schedule that session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-border pt-4">
      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start">Start time</Label>
          <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="end">End time</Label>
          <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>How will this session happen?</Label>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => setUseDailyVideo(true)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
              useDailyVideo ? "border-blue bg-blue-light text-blue" : "border-border text-text-muted"
            }`}
          >
            Video call in MyRight
          </button>
          <button
            type="button"
            onClick={() => setUseDailyVideo(false)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
              !useDailyVideo ? "border-blue bg-blue-light text-blue" : "border-border text-text-muted"
            }`}
          >
            Paste a link
          </button>
        </div>
      </div>
      {!useDailyVideo && (
        <div>
          <Label htmlFor="manualUrl">Meeting link</Label>
          <Input
            id="manualUrl"
            type="url"
            placeholder="https://..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting} icon={submitting ? <Loader2 size={14} className="animate-spin" /> : undefined}>
          {submitting ? "Scheduling..." : "Schedule"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
