import { useRef, useEffect } from "react";
import ChatMessage from "../dispute/ChatMessage";
import ChatInput from "../dispute/ChatInput";
import ChatHeader from "../dispute/ChatHeader";
import ChatLoadingIndicator from "../dispute/ChatLoadingIndicator";
import { useDisputeChat } from "../../hooks/useDisputeChat";

export default function Chatbox() {
  const { messages, handleSend, isInputDisabled, placeholder, isLoading } =
    useDisputeChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
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
      <ChatHeader />

      {/* Chat Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth pb-8"
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}

        {isLoading && <ChatLoadingIndicator />}
      </div>

      {/* Fixed Bottom Input */}
      <div className="shrink-0 bg-linear-to-t from-white via-white to-white/0 pt-6">
        <ChatInput
          onSend={handleSend}
          disabled={isInputDisabled}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
