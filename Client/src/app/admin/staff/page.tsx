"use client";

import { useState } from "react";
import { KeyRound, Loader2, Plus, UserCog } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AccountForm } from "@/components/account/AccountForm";
import { CredentialsCard } from "@/components/account/CredentialsCard";
import { useApi } from "@/lib/useApi";
import { ApiError } from "@/lib/api";
import { PERMISSION_LABELS } from "@/lib/permissions";
import {
  createStaff,
  listStaff,
  resetStaffPassword,
  setStaffPermissions,
  setStaffStatus,
} from "@/lib/admin-client";
import type { StaffPermission, User } from "@/lib/types";

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as StaffPermission[];

function PermissionPicker({
  value,
  onChange,
  disabled,
}: {
  value: StaffPermission[];
  onChange: (next: StaffPermission[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {ALL_PERMISSIONS.map((p) => (
        <label key={p} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-white px-3 py-2.5">
          <input
            type="checkbox"
            className="mt-0.5"
            disabled={disabled}
            checked={value.includes(p)}
            onChange={(e) => onChange(e.target.checked ? [...value, p] : value.filter((x) => x !== p))}
          />
          <span>
            <span className="block text-sm font-medium text-navy">{PERMISSION_LABELS[p].label}</span>
            <span className="block text-xs text-text-muted">{PERMISSION_LABELS[p].hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function StaffRow({ staff, onChanged, onCredentials }: { staff: User; onChanged: () => void; onCredentials: (username: string, password: string) => void }) {
  const [permissions, setPermissions] = useState<StaffPermission[]>(staff.permissions ?? []);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const dirty = [...permissions].sort().join() !== [...(staff.permissions ?? [])].sort().join();
  const active = staff.status === "ACTIVE";

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
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-navy">{staff.name}</p>
            <Badge tone={active ? "success" : "warning"}>{active ? "Active" : "Suspended"}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {staff.username} {"\u00b7"} {staff.email} {"\u00b7"} {staff.phone}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            icon={busy === "reset" ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            onClick={() =>
              run("reset", async () => {
                const { tempPassword } = await resetStaffPassword(staff.id);
                onCredentials(staff.username ?? staff.name, tempPassword);
              })
            }
          >
            Reset password
          </Button>
          <Button size="sm" variant={active ? "danger" : "secondary"} disabled={busy !== null} onClick={() => run("status", async () => { await setStaffStatus(staff.id, active ? "SUSPENDED" : "ACTIVE"); })}>
            {active ? "Suspend" : "Reactivate"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">What they can do</p>
        <PermissionPicker value={permissions} onChange={setPermissions} disabled={busy !== null} />
        {dirty && (
          <Button size="sm" className="mt-3" disabled={busy !== null} icon={busy === "perms" ? <Loader2 size={14} className="animate-spin" /> : undefined} onClick={() => run("perms", async () => { await setStaffPermissions(staff.id, permissions); })}>
            Save permissions
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}

export default function StaffPage() {
  const { data: staff, loading, error, refetch } = useApi(() => listStaff(), []);
  const [adding, setAdding] = useState(false);
  const [newPermissions, setNewPermissions] = useState<StaffPermission[]>(["MANAGE_LAWYERS"]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [credentials, setCredentials] = useState<{ username: string; password: string; title: string } | null>(null);

  return (
    <>
      <DashboardTopbar title="Staff" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-navy">Courthouse staff</h1>
              <p className="text-sm text-text-muted">
                Give colleagues their own logins and choose exactly what each can do. Staff never see the documents or messages inside a case.
              </p>
            </div>
            {!adding && (
              <Button icon={<Plus size={16} />} onClick={() => setAdding(true)}>
                Add staff member
              </Button>
            )}
          </div>

          {credentials && (
            <CredentialsCard title={credentials.title} username={credentials.username} password={credentials.password} onDismiss={() => setCredentials(null)} />
          )}

          {adding && (
            <Card>
              <h2 className="mb-4 text-base font-bold text-navy">New staff member</h2>
              <AccountForm
                submitLabel="Create account"
                busy={busy}
                error={formError}
                extra={
                  <div>
                    <p className="mb-2 text-sm font-medium text-navy">What can they do?</p>
                    <PermissionPicker value={newPermissions} onChange={setNewPermissions} />
                  </div>
                }
                onSubmit={async (values) => {
                  setBusy(true);
                  setFormError("");
                  try {
                    const { staff: created, tempPassword } = await createStaff({ ...values, permissions: newPermissions });
                    setCredentials({ title: `${created.name}'s account is ready`, username: created.username ?? values.username, password: tempPassword });
                    setAdding(false);
                    refetch();
                  } catch (err) {
                    setFormError(err instanceof ApiError ? err.message : "Couldn't create the account.");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setAdding(false)}>
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
          {staff && staff.length === 0 && !adding && (
            <Card className="text-center">
              <UserCog size={22} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm font-medium text-navy">No staff yet</p>
              <p className="mt-1 text-sm text-text-muted">Add a colleague to let them manage lawyers or assign cases.</p>
            </Card>
          )}
          {staff?.map((s) => (
            <StaffRow
              key={s.id}
              staff={s}
              onChanged={refetch}
              onCredentials={(username, password) => setCredentials({ title: "New temporary password", username, password })}
            />
          ))}
        </div>
      </main>
    </>
  );
}
