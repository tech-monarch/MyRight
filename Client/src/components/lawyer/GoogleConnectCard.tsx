"use client";

import { useState } from "react";
import { CalendarClock, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { getGoogleStatus, startGoogleConnect, disconnectGoogle } from "@/lib/mediation-client";
import { ApiError } from "@/lib/api";

export function GoogleConnectCard() {
  const { data, loading, refetch } = useApi(() => getGoogleStatus(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setBusy(true);
    setError("");
    try {
      const url = await startGoogleConnect();
      // Full navigation, not a fetch: this needs to leave the app and go
      // to Google's consent screen, then Google redirects back to the
      // backend's callback, which redirects back here.
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start Google connect.");
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    setError("");
    try {
      await disconnectGoogle();
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't disconnect Google.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <CalendarClock size={18} className="text-blue" />
        <h2 className="text-base font-bold text-navy">Google Meet</h2>
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Connect your Google account so mediation sessions you schedule can automatically get a
        Google Meet link on your own calendar.
      </p>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Checking status...
        </p>
      )}

      {data && (
        <div className="mt-4">
          {data.connected ? (
            <div className="flex items-center justify-between">
              <Badge tone="success">
                <Check size={12} /> Connected as {data.email}
              </Badge>
              <Button size="sm" variant="danger" onClick={handleDisconnect} disabled={busy}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={busy}
              icon={busy ? <Loader2 size={14} className="animate-spin" /> : undefined}
            >
              {busy ? "Redirecting..." : "Connect Google account"}
            </Button>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      )}
    </Card>
  );
}
