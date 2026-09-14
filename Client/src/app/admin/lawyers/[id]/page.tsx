"use client";

import { useState } from "react";
import { Ban, Check, KeyRound, Loader2, Mail, Phone, Plus, RotateCcw, X } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { getLawyer, listCourthouseCases, setLawyerStatus, resetLawyerPassword, assignCase, removeAssignment } from "@/lib/admin-client";
import { statusLabel, statusTone } from "@/lib/dispute-display";
import { ApiError } from "@/lib/api";
import type { UserStatus } from "@/lib/types";

const lawyerStatusTone: Record<UserStatus, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  DEACTIVATED: "neutral",
};

export default function LawyerDetailPage({ params }: { params: { id: string } }) {
  const { data: lawyer, loading, error, refetch: refetchLawyer } = useApi(() => getLawyer(params.id), [params.id]);
  const { data: cases, refetch: refetchCases } = useApi(() => listCourthouseCases(), []);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [newPassword, setNewPassword] = useState<string | null>(null);

  function refetchAll() {
    refetchLawyer();
    refetchCases();
  }

  async function handleStatusChange(status: UserStatus) {
    setBusy(true);
    setActionError("");
    try {
      await setLawyerStatus(params.id, status);
      refetchLawyer();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    setBusy(true);
    setActionError("");
    try {
      const result = await resetLawyerPassword(params.id);
      setNewPassword(result.tempPassword);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't reset that password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(disputeId: string) {
    setBusy(true);
    setActionError("");
    try {
      await assignCase(params.id, disputeId);
      refetchAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't assign that case. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnassign(disputeId: string) {
    setBusy(true);
    setActionError("");
    try {
      await removeAssignment(disputeId);
      refetchAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't remove that assignment. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <DashboardTopbar title="Lawyer profile" />
        <main className="flex-1 px-4 py-20 text-center">
          <Loader2 size={20} className="mx-auto animate-spin text-blue" />
        </main>
      </>
    );
  }

  if (error || !lawyer) {
    return (
      <>
        <DashboardTopbar title="Lawyer profile" />
        <main className="flex-1 px-4 py-20 text-center text-sm text-danger">{error ?? "Lawyer not found."}</main>
      </>
    );
  }

  const assignedIds = new Set(lawyer.assignments?.map((a) => a.disputeId) ?? []);
  const assignedCases = (cases ?? []).filter((d) => assignedIds.has(d.id));
  const unassignedCases = (cases ?? []).filter((d) => !d.assignment);

  return (
    <>
      <DashboardTopbar title="Lawyer profile" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {actionError && <p className="text-sm text-danger">{actionError}</p>}

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-navy">{lawyer.name}</h1>
                  <Badge tone={lawyerStatusTone[lawyer.status]}>{lawyer.status.toLowerCase()}</Badge>
                </div>
                <p className="mt-1 text-sm text-text-muted">@{lawyer.username}</p>
                {lawyer.specialization && <p className="mt-1 text-sm text-text-muted">{lawyer.specialization}</p>}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-muted">
                  {lawyer.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={14} /> {lawyer.email}
                    </span>
                  )}
                  {lawyer.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={14} /> {lawyer.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {lawyer.status === "ACTIVE" ? (
                  <Button variant="secondary" size="sm" icon={<Ban size={15} />} disabled={busy} onClick={() => handleStatusChange("SUSPENDED")}>
                    Suspend
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" icon={<Check size={15} />} disabled={busy} onClick={() => handleStatusChange("ACTIVE")}>
                    Reactivate
                  </Button>
                )}
                <Button variant="danger" size="sm" icon={<X size={15} />} disabled={busy} onClick={() => handleStatusChange("DEACTIVATED")}>
                  Deactivate
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-navy">Password</h2>
                <p className="mt-0.5 text-sm text-text-muted">
                  Generate a new temporary password. {lawyer.name} will need to change it on next login.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleResetPassword} disabled={busy} icon={<RotateCcw size={15} />}>
                Reset password
              </Button>
            </div>
            {newPassword && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface-off px-3.5 py-2.5">
                <KeyRound size={15} className="text-blue" />
                <p className="text-sm text-navy">
                  New temporary password: <span className="font-mono font-semibold">{newPassword}</span>
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-bold text-navy">Assigned cases</h2>
            {assignedCases.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">No cases assigned yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {assignedCases.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{d.title}</p>
                      <Badge tone={statusTone[d.status]} className="mt-1">
                        {statusLabel[d.status]}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleUnassign(d.id)}
                      disabled={busy}
                      className="shrink-0 text-sm font-medium text-text-muted hover:text-danger"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {unassignedCases.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Assign another case</p>
                <ul className="space-y-2">
                  {unassignedCases.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-lg border border-dashed border-border px-3.5 py-2.5">
                      <p className="min-w-0 flex-1 truncate text-sm text-navy">{d.title}</p>
                      <button
                        onClick={() => handleAssign(d.id)}
                        disabled={busy}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue hover:underline"
                      >
                        <Plus size={14} /> Assign
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
