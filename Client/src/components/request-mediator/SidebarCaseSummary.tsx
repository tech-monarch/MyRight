import { Eye } from "lucide-react";

export default function SidebarCaseSummary() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-7 border border-[#eaedf3] mb-6">
      <h3 className="text-[16px] font-extrabold text-primary-navy mb-6">
        Case Summary
      </h3>

      <div className="mb-6">
        <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
          Case Title
        </span>
        <span className="text-[13px] font-extrabold text-gray-900">
          Partnership Dispute #101
        </span>
      </div>

      <div className="mb-8 border-b border-[#eaedf3] pb-6">
        <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
          Respondents
        </span>
        <div className="flex items-center gap-3">
          <div className="w-[26px] h-[26px] rounded-full bg-[#dce7ff] text-primary-navy flex items-center justify-center text-[10px] font-extrabold shrink-0">
            A
          </div>
          <span className="text-[13px] font-bold text-gray-900">
            Aisha Adebayo
          </span>
        </div>
      </div>

      <button className="flex items-center gap-2 text-primary-navy font-bold text-[12px] hover:opacity-80 transition-opacity">
        <Eye className="w-4 h-4" strokeWidth={2.5} />
        View Full Brief
      </button>
    </div>
  );
}
