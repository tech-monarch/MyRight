import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FALLBACK_RESPONSES, detectFallbackCategory } from "../lib/fallbacks";
import { getDeviceLocation } from "../lib/location";
import { useChatStore } from "../store";
import type { AIMessageProps } from "../types/types";

type GeoLocation = { lat: number; lng: number; mapsUrl: string } | undefined;
type ChatHistoryItem = { role: string; content: string };

const EMERGENCY_KEYWORDS = [
  "help", "police", "threat", "gun", "knife", "danger", "attack", "kill", "abuse",
];
const isEmergency = (text: string) =>
  EMERGENCY_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function useDisputeChat() {
  const navigate = useNavigate();
  const {
    messages,
    phase,
    chatHistory,
    sessionId,
    setMessages,
    setPhase,
    setChatHistory,
    setSessionId,
  } = useChatStore();

  const hasInitialized = useRef(false);

  const saveSession = async (
    msgs: AIMessageProps[],
    category?: string,
    urgency?: string,
  ) => {
    try {
      const serializable = msgs.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : "[non-text]",
      }));
      const result = await api.chats.save({
        messages: serializable,
        category,
        urgency,
        sessionId: sessionId || undefined,
      });
      if (result.session?.id) setSessionId(result.session.id);
    } catch (err) {
      console.error("saveSession failed:", err);
    }
  };

  const analyzeWithFallback = async (
    text: string,
    location?: GeoLocation,
    history?: ChatHistoryItem[],
    mode: "chat" | "analyze" = "analyze",
  ) => {
    try {
      return await api.disputes.analyze(text, location, history, mode);
    } catch {
      const key = detectFallbackCategory(text);
      const fallback = FALLBACK_RESPONSES[key];
      return {
        ...fallback,
        category: key === "default" ? "Other" : key,
        urgency: "low",
        summary: text.slice(0, 80),
        chatReply: fallback.aiResponse,
        aiResponse: fallback.aiResponse,
      };
    }
  };

  const addAIMessage = useCallback(
    (content: AIMessageProps["content"]) => {
      setMessages((prev) => [...prev, { role: "ai", content, animate: true }]);
    },
    [setMessages],
  );

  const addToHistory = useCallback(
    (role: string, content: string) => {
      setChatHistory((prev) => [...prev, { role, content }]);
    },
    [setChatHistory],
  );

  // Show a simple "Resolve Issue" button that navigates to /initialize
  const showResolveButton = () => {
    const buttonMessage = (
      <div className="mt-2">
        <button
          onClick={() => navigate("/initialize")}
          className="bg-(--color-primary-navy) text-white px-4 py-2 rounded-md hover:bg-(--color-primary-blue)"
        >
          Resolve Issue
        </button>
      </div>
    );
    addAIMessage(buttonMessage);
    addToHistory("ai", "[Resolve Issue button]");
  };

  // ── Initialisation ─────────────────────────────────
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    if (messages.length > 0) return;

    (async () => {
      await delay(500);
      const greeting =
        "Hello! I'm your MyRight AI guide. I can help you understand your rights, suggest next steps, or just chat. If you want to resolve a dispute, type **RESOLVE ISSUE** and I'll show you a button to continue.";
      addAIMessage(greeting);
      addToHistory("ai", greeting);
      setPhase("INTAKE");
    })();
  }, [messages.length, addAIMessage, addToHistory, setPhase]);

  // ── Main message handler (context‑aware only, no data collection) ──
  const handleSend = async (text: string) => {
    const userMsg: AIMessageProps = {
      role: "user",
      content: text,
      animate: true,
    };

    // Emergency override (kept for safety)
    if (isEmergency(text)) {
      setPhase("ANALYZING");
      const location = (await getDeviceLocation().catch(() => undefined)) as GeoLocation;
      const analysis = await analyzeWithFallback(text, location, chatHistory);
      const aiMsg: AIMessageProps = {
        role: "ai",
        content: analysis.aiResponse,
        animate: true,
      };
      const newMessages: AIMessageProps[] = [...messages, userMsg, aiMsg];
      setMessages(newMessages);
      addToHistory("user", text);
      addToHistory("ai", analysis.aiResponse);
      await saveSession(newMessages, analysis.category, analysis.urgency);
      setPhase("INTAKE");
      return;
    }

    // Normal flow: get AI response (context‑aware via history)
    setPhase("ANALYZING");
    const location = (await getDeviceLocation().catch(() => undefined)) as GeoLocation;
    const analysis = await analyzeWithFallback(text, location, chatHistory, "analyze");

    const aiMsg: AIMessageProps = {
      role: "ai",
      content: analysis.aiResponse,
      animate: true,
    };
    const newMessages: AIMessageProps[] = [...messages, userMsg, aiMsg];
    setMessages(newMessages);
    addToHistory("user", text);
    addToHistory("ai", analysis.aiResponse);

    await saveSession(newMessages, analysis.category || "General", analysis.urgency || "low");

    // If user typed exactly "RESOLVE ISSUE", show the navigation button
    if (text.trim() === "RESOLVE ISSUE") {
      showResolveButton();
    }

    setPhase("INTAKE");
  };

  const isLoading = phase === "ANALYZING";
  const isInputDisabled = isLoading;

  return {
    messages,
    handleSend,
    isInputDisabled,
    isLoading,
    modal: null,
    placeholder: "Ask me anything...",
  };
}