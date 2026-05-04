import { useEffect, useRef } from "react";
import DisputeSubmittedCard from "../components/dispute/DisputeSubmittedCard";
import { api } from "../lib/api";
import { FALLBACK_RESPONSES, detectFallbackCategory } from "../lib/fallbacks";
import { getDeviceLocation } from "../lib/location";
import { supabase } from "../lib/supabase";
import { useChatStore } from "../store";
import type { AIMessageProps, DisputeCategory } from "../types/types";
import { createCase } from "./useDB";

type GeoLocation = { lat: number; lng: number; mapsUrl: string } | undefined;
type ChatHistoryItem = { role: string; content: string };

const EMERGENCY_KEYWORDS = [
  "help",
  "police",
  "threat",
  "gun",
  "knife",
  "danger",
  "attack",
  "kill",
  "abuse",
];
const isEmergency = (text: string) =>
  EMERGENCY_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── Modal Component (defined OUTSIDE hook) ─────────
// eslint-disable-next-line react-refresh/only-export-components
function DisputeFormModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    opponentName: string;
    opponentContact: string;
    category: DisputeCategory;
    attachments: File[];
  }) => void;
}) {
  const [opponentName, setOpponentName] = useState("");
  const [opponentContact, setOpponentContact] = useState("");
  const [category, setCategory] = useState<DisputeCategory>("Other");
  const [attachments, setAttachments] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ opponentName, opponentContact, category, attachments });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-(--color-primary-navy) mb-4">
            Dispute Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">
                Opponent Name
              </label>
              <input
                type="text"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                className="w-full border border-(--color-border-light) rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Opponent Contact (phone/email/address)
              </label>
              <input
                type="text"
                value={opponentContact}
                onChange={(e) => setOpponentContact(e.target.value)}
                className="w-full border border-(--color-border-light) rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DisputeCategory)}
                className="w-full border border-(--color-border-light) rounded-md p-2"
              >
                <option value="Landlord-Tenant">Landlord-Tenant</option>
                <option value="Business/Contract">Business/Contract</option>
                <option value="Employment">Employment</option>
                <option value="Consumer/Retail">Consumer/Retail</option>
                <option value="Property/Real Estate">
                  Property/Real Estate
                </option>
                <option value="Debt/Finance">Debt/Finance</option>
                <option value="Neighbour">Neighbour</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Evidence (optional)
              </label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setAttachments(Array.from(e.target.files || []))
                }
                className="w-full"
              />
              <p className="text-xs text-(--color-text-muted) mt-1">
                Photos, receipts, messages, or contracts
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-(--color-border-light) rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-(--color-primary-navy) text-white py-2 rounded-md hover:bg-(--color-primary-blue)"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

// ── Hook ──────────────────────────────────────────
export function useDisputeChat() {
  const {
    messages,
    form,
    phase,
    chatHistory,
    sessionId,
    setMessages,
    setForm,
    setPhase,
    setChatHistory,
    setSessionId,
    resetChat,
  } = useChatStore();

  const [showFormModal, setShowFormModal] = useState(false);
  const hasInitialized = useRef(false);

  const saveSession = async (
    msgs: AIMessageProps[],
    category?: string,
    urgency?: string,
  ) => {
    try {
      const serializable = msgs.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : "[card]",
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

  const addAIMessage = (content: AIMessageProps["content"]) => {
    setMessages((prev) => [...prev, { role: "ai", content, animate: true }]);
  };
  const addToHistory = (role: string, content: string) => {
    setChatHistory((prev) => [...prev, { role, content }]);
  };

  // ── Init ─────────────────────────────────────────
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Only run initial greeting if we don't have saved messages
    if (messages.length > 0) return;

    (async () => {
      await delay(500);
      const greeting =
        "Hello! I'm your MyRight AI guide. Tell me what's going on.";
      addAIMessage(greeting);
      addToHistory("ai", greeting);
      setPhase("INTAKE");
    })();
  }, []);

  // ── Modal submission handler ─────────────────────
  const handleFormSubmit = async (data: {
    opponentName: string;
    opponentContact: string;
    category: DisputeCategory;
    attachments: File[];
  }) => {
    setShowFormModal(false);
    setForm((prev) => ({
      ...prev,
      opponentName: data.opponentName,
      opponentContact: data.opponentContact,
      category: data.category,
      attachments: data.attachments,
    }));

    if (data.attachments.length) {
      try {
        await api.documents.upload(data.attachments);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setPhase("CLARIFYING_WAIT");
    const location = (await getDeviceLocation().catch(
      () => undefined,
    )) as GeoLocation;
    const clarificationPrompt = `The user is filing a dispute. Details:
Description: ${form.description}
Opponent: ${data.opponentName} (${data.opponentContact})
Category: ${data.category}
Number of files: ${data.attachments.length}

Ask up to two short, relevant clarifying questions (e.g., timeline, evidence, witnesses). Keep it friendly, max 40 words. End with a question.`;
    const analysis = await analyzeWithFallback(
      clarificationPrompt,
      location,
      chatHistory,
      "analyze",
    );
    addAIMessage(analysis.aiResponse);
    addToHistory("ai", analysis.aiResponse);
    await saveSession(
      [
        ...messages,
        { role: "user", content: "Form submitted", animate: true },
        { role: "ai", content: analysis.aiResponse },
      ],
      data.category,
      "medium",
    );
  };

  // ── Main message handler ─────────────────────────
  const handleSend = async (text: string) => {
    const userMsg: AIMessageProps = {
      role: "user",
      content: text,
      animate: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    addToHistory("user", text);

    if (isEmergency(text)) {
      setPhase("ANALYZING");
      const location = (await getDeviceLocation().catch(
        () => undefined,
      )) as GeoLocation;
      const analysis = await analyzeWithFallback(text, location, chatHistory);
      addAIMessage(analysis.aiResponse);
      await saveSession(
        [...messages, userMsg, { role: "ai", content: analysis.aiResponse }],
        analysis.category,
        analysis.urgency,
      );
      setPhase("INTAKE");
      return;
    }

    if (phase === "INTAKE") {
      setForm((prev) => ({ ...prev, description: text }));
      setPhase("ANALYZING");
      const location = (await getDeviceLocation().catch(
        () => undefined,
      )) as GeoLocation;
      const analysis = await analyzeWithFallback(text, location, chatHistory);
      const reply = analysis.aiResponse;
      addAIMessage(reply);
      addToHistory("ai", reply);
      await saveSession(
        [...messages, userMsg, { role: "ai", content: reply }],
        analysis.category,
        analysis.urgency,
      );
      setShowFormModal(true);
      setPhase("INTAKE"); // Reset phase so loading stops
      return;
    }

    if (phase === "CLARIFYING_WAIT") {
      setPhase("ANALYZING");
      const location = (await getDeviceLocation().catch(
        () => undefined,
      )) as GeoLocation;
      const summaryPrompt = `User's dispute details:
Description: ${form.description}
Opponent: ${form.opponentName} (${form.opponentContact})
Category: ${form.category}
Additional info from user: ${text}

Now produce a short summary card (plain text, no markdown) with title, description, opponent details. Then ask: "Does this look correct? Type 'yes' to submit." Keep it under 60 words.`;
      const analysis = await analyzeWithFallback(
        summaryPrompt,
        location,
        chatHistory,
        "analyze",
      );
      addAIMessage(analysis.aiResponse);
      addToHistory("ai", analysis.aiResponse);
      await saveSession(
        [...messages, userMsg, { role: "ai", content: analysis.aiResponse }],
        form.category,
        "medium",
      );
      setPhase("REVIEW_WAIT");
      return;
    }

    if (phase === "REVIEW_WAIT") {
      if (!text.toLowerCase().includes("yes")) {
        addAIMessage("What would you like to change?");
        return;
      }
      setPhase("SUBMITTING");
      try {
        await api.disputes.submit(form);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user
          ? parseInt(user.id.replace(/-/g, "").slice(0, 8), 16) % 10000
          : 1;
        await createCase({
          title: `${form.category} Dispute`,
          description: form.description,
          status: "open",
          type: "dispute",
          userId,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: <DisputeSubmittedCard />,
            animate: true,
          } as AIMessageProps,
        ]);
        await saveSession(messages, form.category, "submitted");
        setPhase("SUCCESS");
        // Clear store on success
        setTimeout(() => resetChat(), 5000);
      } catch {
        addAIMessage("Submission failed. Please try again.");
        setPhase("REVIEW_WAIT");
      }
      return;
    }
  };

  const isLoading = phase === "ANALYZING" || phase === "SUBMITTING";
  const isInputDisabled =
    phase === "GREETING" || isLoading || phase === "SUCCESS" || showFormModal;

  const modal = (
    <DisputeFormModal
      isOpen={showFormModal}
      onClose={() => setShowFormModal(false)}
      onSubmit={handleFormSubmit}
    />
  );

  return {
    messages,
    handleSend,
    isInputDisabled,
    isLoading,
    modal,
    placeholder: "Message MyRight AI...", // ADD THIS
  };
}
