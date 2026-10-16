"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { changePassword } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

export function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone(false);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-bold text-navy">Change password</h2>
      <form onSubmit={submit} className="mt-5 space-y-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        {done && <p className="text-sm text-success">Password changed.</p>}
        <div>
          <Label htmlFor="cp-current">Current password</Label>
          <Input id="cp-current" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cp-next">New password</Label>
          <Input id="cp-next" type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy || !current || next.length < 8} icon={busy ? <Loader2 size={16} className="animate-spin" /> : undefined}>
          Update password
        </Button>
      </form>
    </Card>
  );
}
