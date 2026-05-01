// import { Lock } from "lucide-react";

interface AnalyzeButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function AnalyzeButton({
  onClick,
  disabled = false,
  loading = false,
}: AnalyzeButtonProps) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        {/* <Lock size={12} /> */}
        <span>End-to-end encrypted &amp; private</span>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {loading ? "Analyzing..." : "Analyze Dispute"}
      </button>
    </div>
  );
}