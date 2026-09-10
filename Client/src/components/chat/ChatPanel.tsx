"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/useApi";
import { listMessages, sendMessage } from "@/lib/disputes-client";
import { ApiError } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

export function ChatPanel({
  disputeId,
  suggestions,
  compact = false,
}: {
  disputeId: string;
  suggestions?: string[];
  compact?: boolean;
}) {
  const { data: initialMessages, loading } = useApi(() => listMessages(disputeId), [disputeId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    setError("");
    try {
      const result = await sendMessage(disputeId, content);
      setMessages((m) => [...m, result.userMessage, result.assistantMessage]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex-1 space-y-4 overflow-y-auto pr-1", compact ? "max-h-80" : "min-h-[24rem]")}>
        {loading && (
          <div className="flex h-full items-center justify-center py-10 text-sm text-text-muted">
            <Loader2 size={16} className="mr-2 animate-spin" /> Loading conversation...
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center text-sm text-text-muted">
            <Sparkles size={22} className="mb-2 text-blue" />
            Ask MyRight anything about this case.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "USER" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm",
                m.role === "USER"
                  ? "bg-navy text-white"
                  : "border border-blue-light bg-blue-light/50 text-navy"
              )}
            >
              {m.role === "ASSISTANT" && (
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue">
                  <Sparkles size={12} /> MyRight AI
                </p>
              )}
              <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 border-t border-blue/20 pt-2 text-xs text-text-muted">
                  Sources: {m.sources.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg border border-blue-light bg-blue-light/50 px-3.5 py-2.5 text-sm text-text-muted">
              <Loader2 size={14} className="animate-spin text-blue" /> Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mb-2 text-sm text-danger">{error}</p>}

      {suggestions && suggestions.length > 0 && messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-blue hover:text-blue"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-end gap-2 border-t border-border pt-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Type a message..."
          className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue/40 focus:border-blue"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue text-white hover:bg-navy disabled:opacity-40"
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
