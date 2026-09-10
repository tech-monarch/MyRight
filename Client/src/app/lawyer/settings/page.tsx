"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { changePassword } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

export default function LawyerSettingsPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await changePassword(current, next);
      // The backend invalidates every session on password change,
      // including this one, so the person needs to log in again.
      setSaved(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update your password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DashboardTopbar title="Settings" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-xl space-y-6">
          <Card>
            <h2 className="text-base font-bold text-navy">Profile</h2>
            <p className="mt-1 text-sm text-text-muted">
              Your username and role are managed by your SuperAdmin.
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Name" value={user?.name ?? "..."} />
              <SummaryRow label="Username" value={user?.username ?? "..."} />
              <SummaryRow label="Phone" value={user?.phone ?? "Not set"} />
              <SummaryRow label="Specialization" value={user?.specialization ?? "Not set"} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-navy">Password</h2>
            <p className="mt-1 text-sm text-text-muted">Choose a password that is at least 8 characters long.</p>
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              {error && <p className="text-sm text-danger">{error}</p>}
              {saved && <p className="text-sm text-success">Password updated. Redirecting to log in...</p>}
              <div>
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
              </div>
              <Button type="submit" variant="secondary" disabled={saving} icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}>
                {saving ? "Updating..." : "Update password"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-navy">{value}</span>
    </div>
  );
}
