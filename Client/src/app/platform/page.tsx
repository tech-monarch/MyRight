"use client";

import { useState } from "react";
import { Building2, KeyRound, Loader2, Plus, UserPlus } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Field";
import { AccountForm } from "@/components/account/AccountForm";
import { CredentialsCard } from "@/components/account/CredentialsCard";
import { useApi } from "@/lib/useApi";
import { ApiError } from "@/lib/api";
import {
  addCourthouseAdmin,
  createCourthouse,
  listCourthouses,
  resetAdminPassword,
  setAdminStatus,
} from "@/lib/platform-client";
import type { PlatformCourthouse } from "@/lib/types";

type Creds = { title: string; username: string; password: string };

function CourthouseCard({ c, onChanged, onCreds }: { c: PlatformCourthouse; onChanged: () => void; onCreds: (c: Creds) => void }) {
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError("");
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-navy">{c.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="neutral">{c.counts.lawyers} lawyers</Badge>
            <Badge tone="neutral">{c.counts.staff} staff</Badge>
            <Badge tone={c.whatsapp.linked ? "success" : "neutral"}>
              {c.whatsapp.linked ? `WhatsApp: ${c.whatsapp.number ?? "linked"}` : "Using platform WhatsApp"}
            </Badge>
          </div>
        </div>
        <Button size="sm" variant="secondary" icon={<UserPlus size={14} />} onClick={() => setAddingAdmin((v) => !v)}>
          Add admin
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border rounded-lg border border-border">
        {c.admins.length === 0 && <p className="px-3.5 py-3 text-sm text-text-muted">No admins yet.</p>}
        {c.admins.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy">
                {a.name} <Badge tone={a.status === "ACTIVE" ? "success" : "warning"}>{a.status === "ACTIVE" ? "Active" : "Suspended"}</Badge>
              </p>
              <p className="text-xs text-text-muted">
                {a.username} {"\u00b7"} {a.email} {"\u00b7"} {a.phone}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={busy !== null} icon={busy === `reset-${a.id}` ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                onClick={() => run(`reset-${a.id}`, async () => { const r = await resetAdminPassword(a.id); onCreds({ title: "New temporary password", username: a.username ?? a.name, password: r.tempPassword }); })}>
                Reset password
              </Button>
              <Button size="sm" variant={a.status === "ACTIVE" ? "danger" : "secondary"} disabled={busy !== null}
                onClick={() => run(`status-${a.id}`, async () => { await setAdminStatus(a.id, a.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"); })}>
                {a.status === "ACTIVE" ? "Suspend" : "Reactivate"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {addingAdmin && (
        <div className="mt-4 rounded-lg border border-border bg-surface-off p-4">
          <AccountForm
            submitLabel="Create admin"
            busy={busy === "add"}
            error=""
            onSubmit={(values) =>
              run("add", async () => {
                const r = await addCourthouseAdmin(c.id, values);
                setAddingAdmin(false);
                onCreds({ title: `${r.admin.name}'s admin account is ready`, username: r.admin.username ?? values.username, password: r.tempPassword });
              })
            }
          />
        </div>
      )}
    </Card>
  );
}

export default function PlatformCourthousesPage() {
  const { data: courthouses, loading, error, refetch } = useApi(() => listCourthouses(), []);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [creds, setCreds] = useState<Creds | null>(null);

  return (
    <>
      <DashboardTopbar title="Courthouses" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-navy">Courthouses</h1>
              <p className="text-sm text-text-muted">Each courthouse has its own admin, who then adds staff and lawyers.</p>
            </div>
            {!creating && (
              <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
                New courthouse
              </Button>
            )}
          </div>

          {creds && <CredentialsCard title={creds.title} username={creds.username} password={creds.password} onDismiss={() => setCreds(null)} />}

          {creating && (
            <Card>
              <h2 className="mb-4 text-base font-bold text-navy">New courthouse</h2>
              <div className="mb-4">
                <Label htmlFor="ch-name">Courthouse name</Label>
                <Input id="ch-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lagos High Court, Ikeja" />
              </div>
              <p className="mb-3 text-sm font-medium text-navy">Its first admin</p>
              <AccountForm
                submitLabel="Create courthouse"
                busy={busy}
                error={formError}
                onSubmit={async (admin) => {
                  if (name.trim().length < 2) return setFormError("Enter the courthouse name.");
                  setBusy(true);
                  setFormError("");
                  try {
                    const r = await createCourthouse({ name: name.trim(), admin });
                    setCreds({ title: `${r.courthouse.name} is ready`, username: r.admin.username ?? admin.username, password: r.tempPassword });
                    setCreating(false);
                    setName("");
                    refetch();
                  } catch (err) {
                    setFormError(err instanceof ApiError ? err.message : "Couldn't create the courthouse.");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </Card>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 size={20} className="animate-spin text-blue" />
            </div>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          {courthouses && courthouses.length === 0 && !creating && (
            <Card className="text-center">
              <Building2 size={22} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm font-medium text-navy">No courthouses yet</p>
            </Card>
          )}
          {courthouses?.map((c) => (
            <CourthouseCard key={c.id} c={c} onChanged={refetch} onCreds={setCreds} />
          ))}
        </div>
      </main>
    </>
  );
}
