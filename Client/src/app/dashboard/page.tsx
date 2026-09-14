"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Plus, Scale } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { listMyDisputes } from "@/lib/disputes-client";
import { statusLabel, statusTone, actionHint } from "@/lib/dispute-display";
import type { Dispute } from "@/lib/types";

export default function DashboardOverviewPage() {
  const { data: user } = useCurrentUser();
  const { data: disputes, loading, error } = useApi(() => listMyDisputes(), []);

  return (
    <>
      <DashboardTopbar title="Overview" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-navy">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Here&apos;s what&apos;s happening with your disputes.
          </p>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading your disputes...
            </div>
          )}

          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          {disputes && disputes.length === 0 && <EmptyState />}

          {disputes && disputes.length > 0 && (
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <NeedsAttention disputes={disputes} />

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                      Active disputes
                    </h3>
                    <Link
                      href="/dashboard/disputes"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue hover:underline"
                    >
                      View all <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {disputes
                      .filter((d) => d.status !== "RESOLVED" && d.status !== "WITHDRAWN")
                      .map((d) => (
                        <Link key={d.id} href={`/dashboard/disputes/${d.id}`}>
                          <Card className="flex flex-col gap-2 transition-shadow hover:shadow-raised sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-navy">{d.title}</p>
                              <p className="mt-0.5 text-xs text-text-muted">
                                {d.type} {"\u00b7"} Updated{" "}
                                {new Date(d.updatedAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                            <Badge tone={statusTone[d.status]} className="self-start">
                              {statusLabel[d.status]}
                            </Badge>
                          </Card>
                        </Link>
                      ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <Card className="bg-navy text-white">
                  <Scale size={22} className="text-blue-light" />
                  <p className="mt-3 font-semibold">Have a new dispute?</p>
                  <p className="mt-1 text-sm text-blue-light/90">
                    Tell us what happened and we&apos;ll help you figure out the
                    best way forward.
                  </p>
                  <ButtonLink
                    href="/dashboard/disputes/new"
                    className="mt-4 w-full bg-white text-navy hover:bg-blue-light"
                    icon={<Plus size={16} />}
                  >
                    Start a dispute
                  </ButtonLink>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function NeedsAttention({ disputes }: { disputes: Dispute[] }) {
  const withHints = disputes
    .map((d) => ({ dispute: d, hint: actionHint(d.status) }))
    .filter((x) => x.hint);

  if (withHints.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Needs your attention
      </h3>
      <div className="space-y-3">
        {withHints.map(({ dispute, hint }) => (
          <Card key={dispute.id} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy">{dispute.title}</p>
                <p className="mt-0.5 text-sm text-text-muted">{hint}</p>
              </div>
            </div>
            <Link
              href={`/dashboard/disputes/${dispute.id}`}
              className="shrink-0 text-sm font-semibold text-blue hover:underline sm:self-start"
            >
              View
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <Card className="mt-8 flex flex-col items-center py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-light text-blue">
        <Scale size={26} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-navy">
        You don&apos;t have any disputes yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        If something has gone wrong and you&apos;re not sure how to resolve
        it, tell us what happened and we&apos;ll help you take the first
        step.
      </p>
      <ButtonLink href="/dashboard/disputes/new" className="mt-5" icon={<Plus size={16} />}>
        Start a dispute
      </ButtonLink>
    </Card>
  );
}
