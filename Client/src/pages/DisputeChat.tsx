import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useChatStore } from "../store";
import CreateDispute from "./CreateDispute";
import type { Dispute } from "../types/types";

interface RawDispute {
  id: string;
  description: string;
  category: string;
  opponent_name: string;
  opponent_email: string;
  opponent_phone: string;
  opponent_organization?: string;
  status: string;
  created_at: string;
}

export default function DisputeChat() {
  const { id } = useParams<{ id: string }>();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resetChat = useChatStore((state) => state.resetChat);
  const analysisTriggered = useRef(false);

  useEffect(() => {
    if (!id) return;
    const fetchDispute = async () => {
      try {
        const data = await api.dashboard.getDispute(id);
        const raw = data.dispute as RawDispute;
        const mapped: Dispute = {
          id: raw.id,
          title: raw.description.substring(0, 60),
          description: raw.description,
          category: raw.category,
          status: raw.status,
          opponentName: raw.opponent_name,
          opponentEmail: raw.opponent_email,
          opponentPhone: raw.opponent_phone,
          opponentOrganization: raw.opponent_organization,
          dateInitiated: new Date(raw.created_at).toLocaleDateString(),
          created_at: raw.created_at,
        };

        // ✅ Reset the entire chat store – clears previous messages, history, sessionId, form
        resetChat();

        setDispute(mapped);
        analysisTriggered.current = false; // allow fresh analysis
      } catch (err) {
        console.error(err);
        setError("Failed to load dispute details");
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [id, resetChat]);

  if (loading) return <div className="p-8">Loading case details...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!dispute) return <div className="p-8">Dispute not found.</div>;

  return <CreateDispute dispute={dispute} />;
}