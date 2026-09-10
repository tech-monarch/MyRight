"use client";

import Link from "next/link";
import { Users, Scale, ClipboardList, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { listLawyers, listCourthouseCases, listAuditLog } from "@/lib/admin-client";
import { statusLabel, statusTone } from "@/lib/dispute-display";

export default function AdminDashboardPage() {
  const { data: lawyers, loading: loadingLawyers } = useApi(() => listLawyers(), []);
  const { data: cases, loading: loadingCases } = useApi(() => listCourthouseCases(), []);
  const { data: auditLog, loading: loadingAudit } = useApi(() => listAuditLog(), []);

  const loading = loadingLawyers || loadingCases || loadingAudit;
  const activeLawyers = lawyers?.filter((l) => l.status === "ACTIVE").length ?? 0;
  const unassigned = cases?.filter((c) => !c.assignment) ?? [];

  const stats = [
    { label: "Active lawyers", value: activeLawyers, icon: Users, href: "/admin/lawyers" },
    { label: "Total cases", value: cases?.length ?? 0, icon: Scale, href: "/admin/cases" },
    { label: "Unassigned cases", value: unassigned.length, icon: ClipboardList, href: "/admin/cases" },
  ];

  return (
    <>
      <DashboardTopbar title="Courthouse dashboard" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              Overview for this courthouse. Lawyers only see cases assigned to them.
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

          {!loading && (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                  <Link key={s.label} href={s.href}>
                    <Card className="transition-shadow hover:shadow-raised">
                      <div className="flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-light text-blue">
                          <s.icon size={17} />
                        </span>
                        <span className="text-2xl font-extrabold text-navy">{s.value}</span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-text-muted">{s.label}</p>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                      Cases needing a lawyer
                    </h2>
                    <Link href="/admin/cases" className="inline-flex items-center gap-1 text-sm font-semibold text-blue hover:underline">
                      View all <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {unassigned.length === 0 && (
                      <p className="text-sm text-text-muted">No unassigned cases right now.</p>
                    )}
                    {unassigned.map((d) => (
                      <Card key={d.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">{d.title}</p>
                          <p className="text-xs text-text-muted">{d.type}</p>
                        </div>
                        <Badge tone={statusTone[d.status]}>{statusLabel[d.status]}</Badge>
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                      Recent activity
                    </h2>
                    <Link href="/admin/activity" className="inline-flex items-center gap-1 text-sm font-semibold text-blue hover:underline">
                      View log <ArrowRight size={14} />
                    </Link>
                  </div>
                  <Card className="divide-y divide-border p-0">
                    {(auditLog ?? []).slice(0, 4).map((entry) => (
                      <div key={entry.id} className="px-4 py-3">
                        <p className="text-sm text-navy">
                          <span className="font-medium">{entry.actorLabel}</span>{" "}
                          {entry.action.toLowerCase().replace(/_/g, " ")}
                          {entry.targetId ? <span className="font-medium"> {entry.targetId}</span> : null}
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {new Date(entry.createdAt).toLocaleString("en-GB")}
                        </p>
                      </div>
                    ))}
                    {(auditLog ?? []).length === 0 && (
                      <p className="px-4 py-3 text-sm text-text-muted">No activity yet.</p>
                    )}
                  </Card>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
