"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { listCourthouseCases } from "@/lib/admin-client";
import { statusLabel, statusTone } from "@/lib/dispute-display";

export default function AdminCasesPage() {
  const { data: cases, loading, error } = useApi(() => listCourthouseCases(), []);

  return (
    <>
      <DashboardTopbar title="All cases" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-text-muted">
            Every case in this courthouse. Lawyers can only see cases assigned to them.
          </p>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}
          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          <div className="mt-4 space-y-3">
            {cases?.map((d) => (
              <Link key={d.id} href={`/admin/cases/${d.id}`}>
                <Card className="transition-shadow hover:shadow-raised">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{d.title}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {d.type}
                        {d.assignment?.lawyer?.name ? `, assigned to ${d.assignment.lawyer.name}` : ", unassigned"}
                      </p>
                    </div>
                    <Badge tone={statusTone[d.status]}>{statusLabel[d.status]}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
