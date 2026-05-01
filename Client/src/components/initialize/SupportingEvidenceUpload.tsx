import { useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
// import { UploadCloud, X } from "lucide-react";

const ACCEPTED = ".pdf,.jpg,.png";
const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

interface UploadedFile {
  name: string;
  size: number;
}

interface SupportingEvidenceUploadProps {
  onFilesChange?: (files: File[]) => void;
}

export default function SupportingEvidenceUpload({ onFilesChange }: SupportingEvidenceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const processFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid: File[] = [];
    const rejected: string[] = [];

    Array.from(incoming).forEach((f) => {
      if (f.size > MAX_BYTES) {
        rejected.push(f.name);
      } else {
        valid.push(f);
      }
    });

    if (rejected.length > 0) {
      setError(`Skipped (too large): ${rejected.join(", ")}`);
    } else {
      setError("");
    }

    setFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({ name: f.name, size: f.size })),
    ]);
    onFilesChange?.(valid);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
        Supporting Evidence{" "}
        <span className="normal-case font-normal text-gray-400">(Optional)</span>
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer
          ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
      >
        {/* <UploadCloud size={28} className="text-gray-400" /> */}
        <p className="text-sm text-gray-500">
          Drag &amp; drop files or{" "}
          <span className="text-blue-600 underline">browse</span>
        </p>
        <p className="text-xs text-gray-400">PDF, JPG, or PNG. Max {MAX_MB}MB per file.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="text-xs text-gray-600 flex justify-between items-center">
              <span>{f.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${f.name}`}
                >
                  {/* <X size={12} /> */}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}