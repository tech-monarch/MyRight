"use client";

import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { listMyDisputes } from "@/lib/disputes-client";
import { statusLabel, statusTone } from "@/lib/dispute-display";

export default function DisputesListPage() {
  const { data: disputes, loading, error } = useApi(() => listMyDisputes(), []);

  return (
    <>
      <DashboardTopbar title="My disputes" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {disputes ? `${disputes.length} dispute${disputes.length === 1 ? "" : "s"}` : "Loading..."}
            </p>
            <ButtonLink href="/dashboard/disputes/new" size="sm" icon={<Plus size={16} />}>
              Start a dispute
            </ButtonLink>
          </div>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}
          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          <div className="mt-4 space-y-3">
            {disputes?.map((d) => (
              <Link key={d.id} href={`/dashboard/disputes/${d.id}`}>
                <Card className="transition-shadow hover:shadow-raised">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{d.title}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {d.type} {"\u00b7"} Updated{" "}
                        {new Date(d.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
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
