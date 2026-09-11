"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { getMyAvailability, setMyAvailability } from "@/lib/mediation-client";
import { ApiError } from "@/lib/api";
import type { AvailabilitySlot } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function AvailabilityEditor() {
  const { data, loading } = useApi(() => getMyAvailability(), []);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setSlots(data);
  }, [data]);

  function addSlot() {
    setSlots((s) => [...s, { dayOfWeek: 1, startMinute: 9 * 60, endMinute: 11 * 60 }]);
  }

  function updateSlot(index: number, patch: Partial<AvailabilitySlot>) {
    setSlots((s) => s.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function removeSlot(index: number) {
    setSlots((s) => s.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const result = await setMyAvailability(slots);
      setSlots(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your availability. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-blue" />
        <h2 className="text-base font-bold text-navy">Weekly availability</h2>
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Let your SuperAdmin and disputants know when you&apos;re generally available for
        mediation sessions.
      </p>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </p>
      )}

      {!loading && (
        <div className="mt-4 space-y-3">
          {slots.map((slot, i) => (
            <div key={slot.id ?? i} className="flex flex-wrap items-center gap-2">
              <select
                value={slot.dayOfWeek}
                onChange={(e) => updateSlot(i, { dayOfWeek: Number(e.target.value) })}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy"
              >
                {DAYS.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={minutesToTime(slot.startMinute)}
                onChange={(e) => updateSlot(i, { startMinute: timeToMinutes(e.target.value) })}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy"
              />
              <span className="text-sm text-text-muted">to</span>
              <input
                type="time"
                value={minutesToTime(slot.endMinute)}
                onChange={(e) => updateSlot(i, { endMinute: timeToMinutes(e.target.value) })}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy"
              />
              <button
                onClick={() => removeSlot(i)}
                className="ml-1 text-text-muted hover:text-danger"
                aria-label="Remove slot"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {slots.length === 0 && <p className="text-sm text-text-muted">No availability set yet.</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addSlot} type="button">
              Add a slot
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save availability"}
            </Button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}
    </Card>
  );
}
