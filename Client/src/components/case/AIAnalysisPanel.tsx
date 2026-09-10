"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnalysisResult } from "@/components/intake/AnalysisResult";
import { useApi } from "@/lib/useApi";
import { getLatestAnalysis, runAnalysis } from "@/lib/disputes-client";
import { ApiError } from "@/lib/api";
import type { DisputeAnalysis } from "@/lib/types";

export function AIAnalysisPanel({ disputeId }: { disputeId: string }) {
  const { data: latest, loading, refetch } = useApi(() => getLatestAnalysis(disputeId), [disputeId]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DisputeAnalysis | null>(null);

  async function handleRun() {
    setRunning(true);
    setError("");
    try {
      const analysis = await runAnalysis(disputeId);
      setResult(analysis);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't run analysis. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  const analysis = result ?? latest;

  return (
    <Card>
      {loading && (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Checking for an existing analysis...
        </p>
      )}

      {!loading && !analysis && (
        <div className="text-center py-4">
          <Sparkles size={22} className="mx-auto text-blue" />
          <p className="mt-2 text-sm text-text-muted">
            MyRight hasn&apos;t analyzed this case yet.
          </p>
          <Button
            className="mt-4"
            onClick={handleRun}
            disabled={running}
            icon={running ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          >
            {running ? "Analyzing..." : "Analyze with AI"}
          </Button>
        </div>
      )}

      {analysis && (
        <div>
          <AnalysisResult analysis={analysis} />
          <Button
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={handleRun}
            disabled={running}
            icon={running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          >
            {running ? "Re-analyzing..." : "Re-analyze"}
          </Button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}
