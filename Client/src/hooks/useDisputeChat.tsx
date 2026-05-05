import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FALLBACK_RESPONSES, detectFallbackCategory } from "../lib/fallbacks";
import { getDeviceLocation } from "../lib/location";
import { useChatStore } from "../store";
import type { AIMessageProps, Dispute } from "../types/types";

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
  const [disputeContext, setDisputeContext] = useState<Dispute | null>(null);
  const [systemMessageInjected, setSystemMessageInjected] = useState(false);
  const initialAnalysisSent = useRef(false);

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
        sessionId: sessionId ? String(sessionId) : undefined,
      });
      if (result.session?.id) setSessionId(Number(result.session.id));
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

  const loadSession = useCallback((sessionId: string, sessionMessages: AIMessageProps[]) => {
    setMessages(sessionMessages);
    const history = sessionMessages.map(m => ({ role: m.role, content: String(m.content) }));
    setChatHistory(history);
    setSessionId(Number(sessionId));
    setPhase("INTAKE");
  }, [setMessages, setChatHistory, setSessionId, setPhase]);

  // ── Initial analysis (only called from CreateDispute – not via an effect here) ──
  const sendInitialAnalysis = useCallback(async () => {
    if (initialAnalysisSent.current) return;
    if (!disputeContext) return;

    setPhase("ANALYZING");
    try {
      const analysisPrompt = `Analyze the following dispute and give your honest, direct assessment. Include:
- The core problem
- Legal strengths and weaknesses
- Likely outcome if it goes to court
- Practical recommendations (including ADR)
Be concise but brutally honest.`;

      const location = (await getDeviceLocation().catch(() => undefined)) as GeoLocation;
      const fakeHistory: ChatHistoryItem[] = [
        { role: "system", content: `Dispute details: ${JSON.stringify(disputeContext)}` },
        { role: "user", content: analysisPrompt }
      ];
      const analysis = await analyzeWithFallback(analysisPrompt, location, fakeHistory, "analyze");
      const aiMsg: AIMessageProps = {
        role: "ai",
        content: analysis.aiResponse,
        animate: true,
      };
      setMessages([aiMsg]);
      addToHistory("ai", analysis.aiResponse);
      await saveSession([aiMsg], analysis.category, analysis.urgency);
      initialAnalysisSent.current = true;
    } catch (err) {
      console.error("Initial analysis failed:", err);
      addAIMessage("I'm having trouble analyzing your dispute right now. Could you tell me more about what's going on?");
    } finally {
      setPhase("INTAKE");
    }
  }, [disputeContext, setMessages, addToHistory, saveSession, setPhase, analyzeWithFallback]);

  // ── Initial greeting (only when no dispute context) ──
  useEffect(() => {
    if (hasInitialized.current) return;
    if (disputeContext) return; // Skip greeting if we have a dispute
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
  }, [messages.length, addAIMessage, addToHistory, setPhase, disputeContext]);

  // ── Main message handler ─────────────────────────
  const handleSend = async (text: string) => {
    const userMsg: AIMessageProps = {
      role: "user",
      content: text,
      animate: true,
    };

    if (disputeContext && !systemMessageInjected && !chatHistory.some(m => m.role === 'system')) {
      const systemMsg = `The user is discussing their dispute: "${disputeContext.description}". Category: ${disputeContext.category}. Opponent: ${disputeContext.opponentName}. Provide tailored legal and ADR advice based on this information.`;
      addToHistory('system', systemMsg);
      setSystemMessageInjected(true);
    }

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
    loadSession,
    setDisputeContext,
    sendInitialAnalysis,
  };
}