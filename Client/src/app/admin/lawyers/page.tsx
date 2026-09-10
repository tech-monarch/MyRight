"use client";

import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { listLawyers } from "@/lib/admin-client";
import type { UserStatus } from "@/lib/types";

const statusTone: Record<UserStatus, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  DEACTIVATED: "neutral",
};

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  DEACTIVATED: "Deactivated",
};

export default function LawyersListPage() {
  const { data: lawyers, loading, error } = useApi(() => listLawyers(), []);

  return (
    <>
      <DashboardTopbar title="Lawyers" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {lawyers ? `${lawyers.length} lawyer accounts` : "Loading..."}
            </p>
            <ButtonLink href="/admin/lawyers/new" size="sm" icon={<UserPlus size={16} />}>
              Add lawyer
            </ButtonLink>
          </div>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}
          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          {lawyers && (
            <Card className="mt-4 overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-off text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Username</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Assigned cases</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lawyers.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy">{l.name}</p>
                        <p className="text-xs text-text-muted sm:hidden">{l.username}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-text-muted sm:table-cell">{l.username}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone[l.status]}>{statusLabel[l.status]}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-text-muted sm:table-cell">
                        {l.assignments?.length ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/lawyers/${l.id}`} className="text-sm font-semibold text-blue hover:underline">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
