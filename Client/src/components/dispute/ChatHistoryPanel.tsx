/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import type { AIMessageProps } from "../../types/types";

interface ChatSession {
  id: string;
  messages: AIMessageProps[];
  category: string;
  urgency: string;
  updated_at: string;
  created_at: string;
}

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string, messages: AIMessageProps[]) => void;
}

export default function ChatHistoryPanel({ isOpen, onClose, onSelectSession }: ChatHistoryPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.chats.getAll();
      setSessions(data.sessions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load chat history";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, fetchSessions]);

  const handleSelect = (session: ChatSession) => {
    onSelectSession(session.id, session.messages);
    onClose();
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the parent button
    if (!confirm("Delete this chat session? This action cannot be undone.")) return;
    try {
      await api.chats.delete(sessionId);
      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete chat session");
    }
  };

  const getPreview = (msg: AIMessageProps): string => {
    if (typeof msg.content === "string") return msg.content.slice(0, 40);
    return "Chat message";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-96 h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary-navy">Chat History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No chat sessions found.</div>
          ) : (
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li key={session.id} className="relative group">
                  <button
                    onClick={() => handleSelect(session)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors pr-12"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[70%]">
                        {getPreview(session.messages[0])}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-500">{session.category}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500 capitalize">{session.urgency}</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}