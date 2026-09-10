"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/lib/useApi";
import { listAuditLog } from "@/lib/admin-client";

export default function ActivityLogPage() {
  const { data: entries, loading, error } = useApi(() => listAuditLog(), []);

  return (
    <>
      <DashboardTopbar title="Activity log" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-text-muted">
            An append only record of important actions in this courthouse. This log cannot be
            edited or deleted by lawyers.
          </p>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}
          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          {entries && (
            <Card className="mt-4 divide-y divide-border p-0">
              {entries.length === 0 && <p className="px-4 py-4 text-sm text-text-muted">No activity yet.</p>}
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3.5">
                  {entry.result === "SUCCESS" ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <XCircle size={16} className="mt-0.5 shrink-0 text-danger" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-navy">
                      <span className="font-medium">{entry.actorLabel}</span>{" "}
                      {entry.action.toLowerCase().replace(/_/g, " ")}
                      {entry.targetId ? <span className="font-medium"> {entry.targetId}</span> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {new Date(entry.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
