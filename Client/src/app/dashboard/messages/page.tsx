"use client";

import Link from "next/link";
import { Loader2, MessagesSquare, Sparkles } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/lib/useApi";
import { listMyDisputes, listMessages } from "@/lib/disputes-client";
import type { Dispute, ChatMessage } from "@/lib/types";

async function fetchThreads(): Promise<Array<{ dispute: Dispute; lastMessage: ChatMessage }>> {
  const disputes = await listMyDisputes();
  const withMessages = await Promise.all(
    disputes.map(async (d) => {
      const messages = await listMessages(d.id);
      const last = messages[messages.length - 1];
      return last ? { dispute: d, lastMessage: last } : null;
    })
  );
  return withMessages.filter((t): t is { dispute: Dispute; lastMessage: ChatMessage } => t !== null);
}

export default function MessagesPage() {
  const { data: threads, loading, error } = useApi(fetchThreads, []);

  return (
    <>
      <DashboardTopbar title="Messages" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-text-muted">
            Your conversations with MyRight AI for each dispute. Messages with a human mediator
            will also appear here once mediation begins.
          </p>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          )}
          {error && <p className="mt-10 text-sm text-danger">{error}</p>}

          {threads && threads.length === 0 && (
            <Card className="mt-6 py-10 text-center">
              <MessagesSquare size={26} className="mx-auto text-text-muted" />
              <p className="mt-3 text-sm text-text-muted">No conversations yet.</p>
            </Card>
          )}

          {threads && threads.length > 0 && (
            <ul className="mt-5 space-y-2">
              {threads.map(({ dispute, lastMessage }) => (
                <li key={dispute.id}>
                  <Link href={`/dashboard/disputes/${dispute.id}`}>
                    <Card className="flex items-start gap-3 transition-shadow hover:shadow-raised">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                        <Sparkles size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy">{dispute.title}</p>
                        <p className="mt-0.5 truncate text-sm text-text-muted">
                          {lastMessage.role === "USER" ? "You: " : "MyRight AI: "}
                          {lastMessage.content}
                        </p>
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
