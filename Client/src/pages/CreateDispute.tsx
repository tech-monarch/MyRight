import { useRef, useEffect } from "react";
import ChatMessage from "../components/dispute/ChatMessage";
import ChatInput from "../components/dispute/ChatInput";
import ChatHeader from "../components/dispute/ChatHeader";
import ChatLoadingIndicator from "../components/dispute/ChatLoadingIndicator";
import { useDisputeChat } from "../hooks/useDisputeChat";

export default function CreateDispute() {
  const {
    messages,
    handleSend,
    isInputDisabled,
    isLoading,
    modal,
  } = useDisputeChat(); //  added modal
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      {modal} {/*  render modal here */}
      <ChatHeader />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth pb-8"
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {isLoading && <ChatLoadingIndicator />}
      </div>
      <div className="shrink-0 bg-gradient-to-t from-white via-white to-white/0 pt-6">
        <ChatInput onSend={handleSend} disabled={isInputDisabled} />
      </div>
    </div>
  );
}
