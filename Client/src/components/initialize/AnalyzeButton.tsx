import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "../../../utils/paths";
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-4 sm:gap-0">
      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-400">
        <Lock size={12} />
        <span>End-to-end encrypted &amp; private</span>
      </div>
      
      <Link
       to={paths.resolution}
        type="button"
        onClick={onClick}
        
        className="w-full sm:w-auto bg-primary-navy hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {loading ? "Analyzing..." : "Analyze Dispute"}
      </Link>
    </div>
  );
}