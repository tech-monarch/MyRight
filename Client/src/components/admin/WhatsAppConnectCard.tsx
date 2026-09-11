"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, MessageCircle, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from "@/lib/whatsapp-client";
import { ApiError } from "@/lib/api";

const statusLabel: Record<string, string> = {
  disabled: "Not enabled on this server",
  disconnected: "Not connected",
  connecting: "Connecting...",
  awaiting_scan: "Scan the QR code below",
  connected: "Connected",
};

export function WhatsAppConnectCard() {
  const { data, loading, refetch } = useApi(() => getWhatsAppStatus(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const shouldPoll = data?.status === "connecting" || data?.status === "awaiting_scan";
    if (shouldPoll && !pollRef.current) {
      pollRef.current = setInterval(refetch, 2500);
    }
    if (!shouldPoll && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [data?.status, refetch]);

  async function handleConnect() {
    setBusy(true);
    setError("");
    try {
      await connectWhatsApp();
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start WhatsApp pairing.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    setError("");
    try {
      await disconnectWhatsApp();
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't disconnect WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-blue" />
        <h2 className="text-base font-bold text-navy">WhatsApp notifications</h2>
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Links a real WhatsApp number to send case notifications. This uses WhatsApp&apos;s
        unofficial linked-device protocol, not an official Business API, there is a small but
        real risk of the linked number being flagged. Read your team&apos;s notes on this before
        connecting a number you care about.
      </p>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Checking status...
        </p>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge tone={data.status === "connected" ? "success" : data.status === "awaiting_scan" ? "warning" : "neutral"}>
              {statusLabel[data.status] ?? data.status}
            </Badge>
            {data.connectedNumber && (
              <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                <Smartphone size={14} /> {data.connectedNumber}
              </span>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {data.status === "awaiting_scan" && data.qrDataUrl && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-off p-5">
              <Image src={data.qrDataUrl} alt="WhatsApp QR code" width={220} height={220} unoptimized />
              <p className="text-center text-xs text-text-muted">
                Open WhatsApp on the phone you want to link, go to Settings {"\u2192"} Linked devices
                {" \u2192"} Link a device, and scan this code.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {data.status === "disconnected" && (
              <Button size="sm" onClick={handleConnect} disabled={busy} icon={busy ? <Loader2 size={14} className="animate-spin" /> : undefined}>
                {busy ? "Starting..." : "Connect WhatsApp"}
              </Button>
            )}
            {(data.status === "connected" || data.status === "awaiting_scan") && (
              <Button size="sm" variant="danger" onClick={handleDisconnect} disabled={busy}>
                Disconnect
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
