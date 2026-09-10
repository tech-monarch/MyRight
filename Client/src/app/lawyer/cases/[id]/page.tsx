"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseTabs } from "@/components/case/CaseTabs";
import { useApi } from "@/lib/useApi";
import { getDispute } from "@/lib/disputes-client";

export default function LawyerCaseDetailPage({ params }: { params: { id: string } }) {
  const { data: dispute, loading, error } = useApi(() => getDispute(params.id), [params.id]);

  return (
    <>
      <DashboardTopbar title="Case detail" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading case...
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-md py-16 text-center">
              <ShieldAlert size={26} className="mx-auto text-danger" />
              <h1 className="mt-4 text-lg font-bold text-navy">Can&apos;t open this case</h1>
              <p className="mt-2 text-sm text-text-muted">
                This case may not be assigned to you, or it may not exist. If you believe this is
                a mistake, contact your SuperAdmin.
              </p>
            </div>
          )}

          {dispute && (
            <>
              <CaseHeader dispute={dispute} showMediationAction={false} />
              <div className="mt-6">
                <CaseTabs dispute={dispute} />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
