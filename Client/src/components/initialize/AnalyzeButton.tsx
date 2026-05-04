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
        
        className={`w-full sm:w-auto bg-primary-navy hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center min-w-[150px] ${
          (disabled || loading) ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        }`}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          "Analyze Dispute"
        )}
      </Link>
    </div>
  );
}