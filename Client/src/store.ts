import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DisputeFormData, AIPhase, AIMessageProps } from "./types/types";

interface ChatHistoryItem {
  role: string;
  content: string;
}

interface ChatState {
  messages: AIMessageProps[];
  form: DisputeFormData;
  phase: AIPhase;
  chatHistory: ChatHistoryItem[];
  sessionId: number | null;

  // Actions
  setMessages: (
    val: AIMessageProps[] | ((prev: AIMessageProps[]) => AIMessageProps[])
  ) => void;
  setForm: (
    val: DisputeFormData | ((prev: DisputeFormData) => DisputeFormData)
  ) => void;
  setPhase: (phase: AIPhase) => void;
  setChatHistory: (
    val: ChatHistoryItem[] | ((prev: ChatHistoryItem[]) => ChatHistoryItem[])
  ) => void;
  setSessionId: (id: number | null) => void;
  resetChat: () => void;
}

const INITIAL_FORM: DisputeFormData = {
  category: "Other",
  description: "",
  opponentName: "",
  opponentContact: "",
  attachments: [],
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      form: INITIAL_FORM,
      phase: "GREETING",
      chatHistory: [],
      sessionId: null,

      setMessages: (val) =>
        set((state) => ({
          messages: typeof val === "function" ? val(state.messages) : val,
        })),
      setForm: (val) =>
        set((state) => ({
          form: typeof val === "function" ? val(state.form) : val,
        })),
      setPhase: (phase) => set({ phase }),
      setChatHistory: (val) =>
        set((state) => ({
          chatHistory: typeof val === "function" ? val(state.chatHistory) : val,
        })),
      setSessionId: (sessionId) => set({ sessionId }),
      resetChat: () =>
        set({
          messages: [],
          form: INITIAL_FORM,
          phase: "GREETING",
          chatHistory: [],
          sessionId: null,
        }),
    }),
    {
      name: "myright-chat-storage",
      storage: createJSONStorage(() => localStorage),
      // We only persist serializable data
      partialize: (state) => ({
        messages: state.messages.filter((m) => typeof m.content === "string"),
        form: { ...state.form, attachments: [] }, // Files can't be serialized
        phase: state.phase,
        chatHistory: state.chatHistory,
        sessionId: state.sessionId,
      }),
    }
  )
);
