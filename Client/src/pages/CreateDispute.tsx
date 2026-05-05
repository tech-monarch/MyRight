import { useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import ChatInput from "../components/dispute/ChatInput";
import ChatLoadingIndicator from "../components/dispute/ChatLoadingIndicator";
import ChatMessage from "../components/dispute/ChatMessage";
import Sidebar from "../components/Sidebar";
import { useDisputeChat } from "../hooks/useDisputeChat";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";
import ChatHistoryPanel from "../components/dispute/ChatHistoryPanel";
import type { AIMessageProps, Dispute } from "../types/types";

interface CreateDisputeProps {
  initialDisputeContext?: Dispute;
  dispute?: Dispute;
}

export default function CreateDispute({ initialDisputeContext, dispute: propDispute }: CreateDisputeProps) {
  const { messages, handleSend, isInputDisabled, isLoading, modal, loadSession, setDisputeContext, sendInitialAnalysis } = useDisputeChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const initialAnalysisTriggered = useRef(false);

  const dispute = propDispute || initialDisputeContext;

  useEffect(() => {
    if (dispute) {
      setDisputeContext(dispute);
    }
  }, [dispute, setDisputeContext]);

  // 👇 NEW: trigger initial analysis once when dispute context is set and no messages yet
  useEffect(() => {
    if (dispute && !initialAnalysisTriggered.current && messages.length === 0) {
      initialAnalysisTriggered.current = true;
      sendInitialAnalysis();
    }
  }, [dispute, messages.length, sendInitialAnalysis]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const isConversationStarted = messages.some((m) => m.role === "user");
  const showGreeting = !isConversationStarted && messages.length > 0;

  const handleSelectSession = (sessionId: string, sessionMessages: AIMessageProps[]) => {
    loadSession(sessionId, sessionMessages);
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full md:ml-64 relative overflow-hidden">
        <DashboardTopNav />

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="fixed top-20 right-4 z-40 bg-primary-navy text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-colors"
        >
          <History size={20} />
        </button>

        {modal}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pb-8 relative">
          {dispute && (
            <div className="mx-4 mt-4 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-primary-navy">Dispute: {dispute.title || "Untitled"}</h3>
                  <p className="text-xs text-gray-600 mt-1">Category: {dispute.category}</p>
                  <p className="text-xs text-gray-600">Opponent: {dispute.opponentName}</p>
                  <p className="text-xs text-gray-600">Status: {dispute.status}</p>
                </div>
                <div className="text-xs text-gray-400">ID: {dispute.id.slice(0, 8)}</div>
              </div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {dispute.description?.substring(0, 150)}...
              </p>
            </div>
          )}

          {showGreeting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
              <h1 className="text-3xl md:text-4xl font-semibold text-primary-navy mb-4 tracking-tight">
                Hello! I'm your MyRight AI guide.
              </h1>
              <p className="text-base md:text-lg text-gray-500 font-medium max-w-sm">
                Tell me what's going on, and I'll help you resolve your dispute.
              </p>
            </div>
          ) : (
            <>
              {messages.slice(1).map((msg, i) => (
                <ChatMessage key={i} {...msg} />
              ))}
              {isLoading && <ChatLoadingIndicator />}
            </>
          )}
        </div>
        <div className="shrink-0 bg-linear-to-t from-white via-white to-white/0 pt-6">
          <ChatInput onSend={handleSend} disabled={isInputDisabled} />
        </div>
      </div>

      <ChatHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectSession}
      />
    </div>
  );
} 