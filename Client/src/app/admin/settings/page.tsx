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

export default function AdminSettingsPage() {
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
            <h2 className="text-base font-bold text-navy">Your account</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Name</span>
                <span className="font-medium text-navy">{user?.name ?? "..."}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Username</span>
                <span className="font-medium text-navy">{user?.username ?? "..."}</span>
              </div>
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
              <Button type="submit" disabled={saving} icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}>
                {saving ? "Updating..." : "Update password"}
              </Button>
            </form>
          </Card>

          <Card className="bg-surface-off">
            <p className="text-sm text-text-muted">
              Courthouse-level settings (name, branding) aren&apos;t backed by an API endpoint
              yet, this section is a placeholder for that.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}
