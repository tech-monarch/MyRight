"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import { listDocuments, uploadDocument } from "@/lib/disputes-client";
import { documentDownloadUrl, ApiError } from "@/lib/api";
import type { Dispute, DocumentStatus } from "@/lib/types";

const statusNote: Record<DocumentStatus, string | null> = {
  UPLOADED: null,
  PROCESSING: "Processing for AI search",
  READY: null,
  FAILED: "Could not be processed for AI search",
};

export function CaseDocuments({ dispute }: { dispute: Dispute }) {
  const { data: documents, loading, error, refetch } = useApi(() => listDocuments(dispute.id), [dispute.id]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      await uploadDocument(dispute.id, file);
      refetch();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {documents ? `${documents.length} file${documents.length === 1 ? "" : "s"}` : "Loading..."}
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={uploading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add evidence"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
        />
      </div>

      {uploadError && <p className="mb-3 text-sm text-danger">{uploadError}</p>}

      {loading && <p className="text-sm text-text-muted">Loading documents...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      {documents && documents.length === 0 && (
        <p className="rounded-lg bg-surface-off p-4 text-sm text-text-muted">
          No documents uploaded yet. You can upload contracts, receipts, screenshots, or photos related to this case.
        </p>
      )}

      {documents && documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={documentDownloadUrl(dispute.id, doc.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-border bg-white px-3.5 py-3 hover:border-blue"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                    <FileText size={16} />
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">{doc.fileName}</p>
                    <p className="text-xs text-text-muted">
                      {(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                      {" \u00b7 "}
                      {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {statusNote[doc.status] ? ` \u00b7 ${statusNote[doc.status]}` : ""}
                    </p>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
