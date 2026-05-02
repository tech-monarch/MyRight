import { Printer, Share2 } from "lucide-react";

export default function CaseReferenceFooter() {
  return (
    <div className="bg-[#e9ecef]/50 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 md:gap-12 text-sm mt-8">
      <div className="flex flex-col shrink-0">
        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">
          Case Reference
        </span>
        <span className="text-primary-navy font-bold text-base">
          #LR-2024-104
        </span>
      </div>

      <div className="flex-1 md:border-l-2 md:border-gray-200/60 md:pl-8 py-2">
        <p className="text-gray-500 italic text-[13px] leading-relaxed max-w-2xl text-center md:text-left">
          "Parties have expressed a desire to maintain a business
          relationship post-resolution, making mediation the optimal path
          for reconciliation."
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-navy shadow-sm hover:shadow-md transition-shadow">
          <Printer className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-navy shadow-sm hover:shadow-md transition-shadow">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
