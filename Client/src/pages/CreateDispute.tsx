import { useEffect, useRef } from "react";
import ChatInput from "../components/dispute/ChatInput";
import ChatLoadingIndicator from "../components/dispute/ChatLoadingIndicator";
import ChatMessage from "../components/dispute/ChatMessage";
import Sidebar from "../components/Sidebar";
import { useDisputeChat } from "../hooks/useDisputeChat";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

export default function CreateDispute() {
  const { messages, handleSend, isInputDisabled, isLoading, modal } =
    useDisputeChat();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full md:ml-64 relative overflow-hidden">
        <DashboardTopNav />
        {modal}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth pb-8 relative"
        >
          {showGreeting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
              <h1 className="text-3xl md:text-4xl font-semibold text-(--color-primary-navy) mb-4 tracking-tight">
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
          <ChatInput
            onSend={(text) => {
              handleSend(text);
            }}
            disabled={isInputDisabled}
          />
        </div>
      </div>
    </div>
  );
}
