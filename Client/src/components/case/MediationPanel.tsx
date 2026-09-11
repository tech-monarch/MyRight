"use client";

import { useState } from "react";
import { CalendarPlus, Loader2, Video, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Label, Input } from "@/components/ui/Field";
import { useApi } from "@/lib/useApi";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { listSessions, createSession, cancelSession } from "@/lib/mediation-client";
import { ApiError } from "@/lib/api";
import type { Dispute } from "@/lib/types";

export function MediationPanel({ dispute }: { dispute: Dispute }) {
  const { data: user } = useCurrentUser();
  const { data: sessions, loading, refetch } = useApi(() => listSessions(dispute.id), [dispute.id]);
  const [showForm, setShowForm] = useState(false);

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
          <ul className="mt-4 space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">
                    {new Date(s.scheduledStart).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={s.status === "SCHEDULED" ? "blue" : s.status === "COMPLETED" ? "success" : "neutral"}>
                      {s.status.toLowerCase()}
                    </Badge>
                    {s.meetingUrl && (
                      <a
                        href={s.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue hover:underline"
                      >
                        <Video size={12} /> Join
                      </a>
                    )}
                  </div>
                </div>
                {isMediator && s.status === "SCHEDULED" && (
                  <button
                    onClick={() => cancelSession(dispute.id, s.id).then(refetch)}
                    className="shrink-0 text-text-muted hover:text-danger"
                    aria-label="Cancel session"
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
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
  const [useGoogleMeet, setUseGoogleMeet] = useState(true);
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
        useGoogleMeet,
        manualMeetingUrl: !useGoogleMeet && manualUrl ? manualUrl : undefined,
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUseGoogleMeet(true)}
          className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
            useGoogleMeet ? "border-blue bg-blue-light text-blue" : "border-border text-text-muted"
          }`}
        >
          Google Meet
        </button>
        <button
          type="button"
          onClick={() => setUseGoogleMeet(false)}
          className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
            !useGoogleMeet ? "border-blue bg-blue-light text-blue" : "border-border text-text-muted"
          }`}
        >
          Paste a link
        </button>
      </div>
      {!useGoogleMeet && (
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
