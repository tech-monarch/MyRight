import { useState, useRef, useEffect } from "react";
import type { DisputeFormData, AIPhase, AIMessageProps } from "../../types/types";
import CaseSummaryCard from "../components/dispute/CaseSummaryCard";
import DisputeSubmittedCard from "../components/dispute/DisputeSubmittedCard";

const INITIAL_FORM: DisputeFormData = {
  category: "Other", // Will be predicted by AI later
  description: "",
  opponentName: "",
  opponentContact: "",
  attachments: [],
};

// Delay helper for "typing" effect
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function useDisputeChat() {
  const [phase, setPhase] = useState<AIPhase>("GREETING");
  const [messages, setMessages] = useState<AIMessageProps[]>([]);
  const [form, setForm] = useState<DisputeFormData>(INITIAL_FORM);
  const hasInitialized = useRef(false);

  // Initial Greeting sequence
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      await delay(500);
      setMessages([
        {
          role: "ai",
          content:
            "Hello! I'm your MyRight AI guide. I'm here to help you resolve your conflict quickly and fairly.",
          animate: true,
        },
      ]);
      await delay(1000);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "To get started, please tell me what happened in your own words. The more detail you provide, the better I can guide you.",
          animate: true,
        },
      ]);
      setPhase("INTAKE");
    };
    initChat();
  }, []);

  const handleSend = async (text: string, files?: File[]) => {
    // Add user message
    const userMsg: AIMessageProps = {
      role: "user",
      content: text,
      animate: true,
    };
    setMessages((prev) => [...prev, userMsg]);

    if (phase === "INTAKE") {
      setForm((prev) => ({
        ...prev,
        description: text,
        attachments: files || [],
      }));
      setPhase("ANALYZING");

      // Simulate AI thinking
      await delay(1500);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Thank you for sharing. Based on what you've described, this sounds like a Business/Contract dispute. Mediation is highly recommended for this type of issue.",
          animate: true,
        },
      ]);

      await delay(1500);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Next, I need to know who you are in conflict with so we can send them a formal mediation invitation. Please reply with their **Full Name/Business Name** and their **Email or Phone Number**.",
          animate: true,
        },
      ]);
      setPhase("OPPONENT_WAIT");
    } else if (phase === "OPPONENT_WAIT") {
      // In a real app, we'd use NLP to extract name and email from the raw text.
      // Here we'll just mock it.
      setForm((prev) => ({
        ...prev,
        opponentName: "The Other Party",
        opponentContact: text,
      }));
      setPhase("REVIEW_ASK");

      await delay(1000);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Got it. I have prepared the mediation request.",
          animate: true,
        },
      ]);

      await delay(1000);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: (
            <CaseSummaryCard
              description={form.description || text}
              contactText={text}
            />
          ),
          animate: true,
        },
      ]);

      await delay(800);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Does everything look correct? Should I submit this and send the formal invitation?",
          animate: true,
        },
      ]);
      setPhase("REVIEW_WAIT");
    } else if (phase === "REVIEW_WAIT") {
      setPhase("SUBMITTING");
      await delay(2000); // Simulate API call

      setPhase("SUCCESS");

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: <DisputeSubmittedCard />,
          animate: true,
        },
      ]);
    }
  };

  const isLoading =
    phase === "ANALYZING" ||
    phase === "OPPONENT_ASK" ||
    phase === "REVIEW_ASK" ||
    phase === "SUBMITTING";

  const isInputDisabled =
    phase === "GREETING" ||
    isLoading ||
    phase === "SUCCESS";

  const getPlaceholder = () => {
    switch (phase) {
      case "INTAKE":
        return "Describe the issue...";
      case "OPPONENT_WAIT":
        return "Name and contact info...";
      case "REVIEW_WAIT":
        return "Type 'Yes' to submit or explain changes...";
      case "SUBMITTING":
        return "Submitting case...";
      case "SUCCESS":
        return "Dispute submitted successfully.";
      default:
        return "Please wait...";
    }
  };

  return {
    messages,
    handleSend,
    isInputDisabled,
    placeholder: getPlaceholder(),
    isLoading,
  };
}
