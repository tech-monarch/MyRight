"use client";

import Link from "next/link";
import { ArrowRight, Loader2, Scale } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { listMyDisputes } from "@/lib/disputes-client";
import { statusLabel, statusTone, actionHint } from "@/lib/dispute-display";

export default function LawyerDashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: cases, loading } = useApi(() => listMyDisputes(), []);

  const needsAttention = (cases ?? []).filter((d) => actionHint(d.status));

  return (
    <>
      <DashboardTopbar title="My dashboard" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-navy">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            You have {cases?.length ?? 0} case{cases?.length === 1 ? "" : "s"} assigned to you.
          </p>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}

          {cases && (
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {needsAttention.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                      Pending actions
                    </h3>
                    <div className="space-y-3">
                      {needsAttention.map((d) => (
                        <Card key={d.id} className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy">{d.title}</p>
                            <p className="mt-0.5 text-sm text-text-muted">{actionHint(d.status)}</p>
                          </div>
                          <Link href={`/lawyer/cases/${d.id}`} className="shrink-0 text-sm font-semibold text-blue hover:underline">
                            View
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                      My assigned cases
                    </h3>
                    <Link href="/lawyer/cases" className="inline-flex items-center gap-1 text-sm font-semibold text-blue hover:underline">
                      View all <ArrowRight size={14} />
                    </Link>
                  </div>
                  {cases.length === 0 ? (
                    <Card className="py-10 text-center">
                      <Scale size={24} className="mx-auto text-text-muted" />
                      <p className="mt-3 text-sm text-text-muted">No cases assigned to you yet.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {cases.map((d) => (
                        <Link key={d.id} href={`/lawyer/cases/${d.id}`}>
                          <Card className="transition-shadow hover:shadow-raised">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-navy">{d.title}</p>
                                <p className="mt-0.5 text-xs text-text-muted">{d.type}</p>
                              </div>
                              <Badge tone={statusTone[d.status]}>{statusLabel[d.status]}</Badge>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
