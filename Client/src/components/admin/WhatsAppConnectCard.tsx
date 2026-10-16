"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, MessageCircle, QrCode, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, FieldHint } from "@/components/ui/Field";
import { useApi } from "@/lib/useApi";
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppStatus,
  saveWhatsAppNumber,
  useDefaultWhatsApp,
  type WhatsAppBase,
} from "@/lib/whatsapp-client";
import { ApiError } from "@/lib/api";

const statusLabel: Record<string, string> = {
  disabled: "Turned off on this server",
  disconnected: "Not linked",
  connecting: "Connecting...",
  awaiting_scan: "Waiting for you to link it",
  connected: "Linked and sending",
};

/**
 * Manages one WhatsApp number: the platform default (platform owner) or one
 * courthouse's own number (courthouse admin). Linking works by entering the
 * number and typing a pairing code into WhatsApp on that phone; a QR code is
 * the alternative.
 */
export function WhatsAppConnectCard({
  base,
  title,
  intro,
  allowUseDefault = false,
}: {
  base: WhatsAppBase;
  title: string;
  intro: string;
  /** Courthouse view: lets the admin drop their own number and fall back to the platform default. */
  allowUseDefault?: boolean;
}) {
  const { data, loading, refetch } = useApi(() => getWhatsAppStatus(base), [base]);
  const [numberInput, setNumberInput] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const shouldPoll = data?.status === "connecting" || data?.status === "awaiting_scan";
    if (shouldPoll && !pollRef.current) pollRef.current = setInterval(refetch, 2500);
    if (!shouldPoll && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [data?.status, refetch]);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setError("");
    try {
      await fn();
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const saved = data?.number ?? "";
  const typed = numberInput ?? saved;
  const dirty = typed.trim() !== saved && typed.trim() !== "";
  const sendingFrom =
    data?.status === "connected"
      ? "this courthouse's own number"
      : data?.platformDefault?.status === "connected"
        ? `the platform default${data.platformDefault.number ? ` (${data.platformDefault.number})` : ""}`
        : null;

  return (
    <Card>
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-blue" />
        <h2 className="text-base font-bold text-navy">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-text-muted">{intro}</p>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Checking status...
        </p>
      )}

      {data && !data.enabled && (
        <p className="mt-4 rounded-lg border border-border bg-surface-off px-3.5 py-2.5 text-sm text-text-muted">
          WhatsApp is turned off on this server. Set <span className="font-mono">WHATSAPP_ENABLED=true</span> in the
          server&apos;s environment to use it.
        </p>
      )}

      {data && data.enabled && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={data.status === "connected" ? "success" : data.status === "awaiting_scan" ? "warning" : "neutral"}>
              {statusLabel[data.status] ?? data.status}
            </Badge>
            {data.connectedNumber && (
              <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                <Smartphone size={14} /> {data.connectedNumber}
              </span>
            )}
          </div>

          {allowUseDefault && (
            <p className="text-sm text-text-muted">
              {sendingFrom ? <>Messages for this courthouse are currently sent from <span className="font-medium text-navy">{sendingFrom}</span>.</> : "No WhatsApp number is connected yet, so WhatsApp messages can't be sent."}
            </p>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div>
            <Label htmlFor={`wa-number-${base}`}>WhatsApp number</Label>
            <div className="flex gap-2">
              <Input
                id={`wa-number-${base}`}
                type="tel"
                placeholder="e.g. 07012345678 or 2347012345678"
                value={typed}
                onChange={(e) => setNumberInput(e.target.value)}
              />
              <Button variant="secondary" disabled={!dirty || busy !== null} onClick={() => run("save", async () => { await saveWhatsAppNumber(base, typed); setNumberInput(null); })} icon={busy === "save" ? <Loader2 size={14} className="animate-spin" /> : undefined}>
                Save
              </Button>
            </div>
            <FieldHint>
              {saved && dirty ? "Saving a different number unlinks the current one; you'll link the new one next." : "The phone that has this WhatsApp account is the one you'll link below."}
            </FieldHint>
          </div>

          {data.status === "awaiting_scan" && data.pairingCode && (
            <div className="rounded-lg border border-border bg-surface-off p-5 text-center">
              <p className="font-mono text-3xl font-bold tracking-widest text-navy">
                {data.pairingCode.replace(/(.{4})(?=.)/g, "$1-")}
              </p>
              <p className="mt-3 text-xs text-text-muted">
                On the phone with this number open WhatsApp, then Settings {"\u2192"} Linked devices {"\u2192"} Link a device
                {" \u2192"} <span className="font-semibold">Link with phone number instead</span>, and enter this code. It expires after a
                couple of minutes; press the button again for a new one.
              </p>
            </div>
          )}

          {data.status === "awaiting_scan" && data.qrDataUrl && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-off p-5">
              <Image src={data.qrDataUrl} alt="WhatsApp QR code" width={220} height={220} unoptimized />
              <p className="text-center text-xs text-text-muted">
                On the phone, open WhatsApp {"\u2192"} Settings {"\u2192"} Linked devices {"\u2192"} Link a device, and scan this code.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {data.status !== "connected" && (
              <>
                <Button size="sm" disabled={!saved || dirty || busy !== null || data.status === "connecting"} onClick={() => run("code", () => connectWhatsApp(base, "code"))} icon={busy === "code" ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />}>
                  Link with phone number
                </Button>
                <Button size="sm" variant="secondary" disabled={busy !== null || data.status === "connecting"} onClick={() => run("qr", () => connectWhatsApp(base, "qr"))} icon={busy === "qr" ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}>
                  Link with QR code
                </Button>
              </>
            )}
            {(data.status === "connected" || data.status === "awaiting_scan") && (
              <Button size="sm" variant="danger" disabled={busy !== null} onClick={() => run("disconnect", () => disconnectWhatsApp(base))}>
                Disconnect
              </Button>
            )}
            {allowUseDefault && saved && (
              <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => { if (window.confirm("Stop using this courthouse's own number and send from the platform default instead?")) void run("default", () => useDefaultWhatsApp(base)); }}>
                Use the platform default instead
              </Button>
            )}
          </div>

          <p className="text-xs text-text-muted">
            This uses WhatsApp&apos;s unofficial linked-device protocol, not the official Business API. There is a real risk
            of the number being banned, so use a dedicated number rather than one you can&apos;t afford to lose.
          </p>
        </div>
      )}
    </Card>
  );
}
