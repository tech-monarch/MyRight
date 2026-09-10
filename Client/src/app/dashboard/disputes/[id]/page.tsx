"use client";

import { Loader2 } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseTabs } from "@/components/case/CaseTabs";
import { useApi } from "@/lib/useApi";
import { getDispute } from "@/lib/disputes-client";

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { data: dispute, loading, error } = useApi(() => getDispute(params.id), [params.id]);

  return (
    <>
      <DashboardTopbar />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading case...
            </div>
          )}
          {error && <p className="py-20 text-center text-sm text-danger">{error}</p>}
          {dispute && (
            <>
              <CaseHeader dispute={dispute} />
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
