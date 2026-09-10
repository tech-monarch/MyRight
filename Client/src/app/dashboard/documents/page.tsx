"use client";

import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/lib/useApi";
import { listMyDisputes, listDocuments } from "@/lib/disputes-client";
import type { DisputeDocument } from "@/lib/types";

async function fetchAllDocuments(): Promise<Array<DisputeDocument & { disputeTitle: string }>> {
  const disputes = await listMyDisputes();
  const perDispute = await Promise.all(
    disputes.map(async (d) => {
      const docs = await listDocuments(d.id);
      return docs.map((doc) => ({ ...doc, disputeTitle: d.title }));
    })
  );
  return perDispute.flat().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export default function DocumentsPage() {
  const { data: docs, loading, error } = useApi(fetchAllDocuments, []);

  return (
    <>
      <DashboardTopbar title="Documents" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-text-muted">
            All evidence and documents you have uploaded, across every dispute.
          </p>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}
          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          {docs && docs.length === 0 && (
            <Card className="mt-6 py-10 text-center">
              <FileText size={26} className="mx-auto text-text-muted" />
              <p className="mt-3 text-sm text-text-muted">You have not uploaded any documents yet.</p>
            </Card>
          )}

          {docs && docs.length > 0 && (
            <ul className="mt-5 space-y-2">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <Link href={`/dashboard/disputes/${doc.disputeId}`}>
                    <Card className="flex items-center justify-between transition-shadow hover:shadow-raised">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                          <FileText size={16} />
                        </span>
                        <span className="min-w-0">
                          <p className="truncate text-sm font-medium text-navy">{doc.fileName}</p>
                          <p className="truncate text-xs text-text-muted">from {doc.disputeTitle}</p>
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-text-muted">
                        {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
