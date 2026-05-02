import { Lock } from "lucide-react";

export default function CaseSummaryCard() {
  return (
    <div className="bg-primary-navy rounded-xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <h3 className="text-[11px] font-bold text-white/60 tracking-widest uppercase mb-8">
        Case Summary
      </h3>

      <div className="flex flex-col gap-4 mb-10">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <span className="text-[13px] md:text-[14px] text-white/70">Reference ID</span>
          <span className="text-[13px] md:text-[14px] font-semibold text-white">SS-2824-8921</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <span className="text-[13px] md:text-[14px] text-white/70">Dispute Type</span>
          <span className="text-[13px] md:text-[14px] font-semibold text-white">Commercial Contract</span>
        </div>

        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <span className="text-[13px] md:text-[14px] text-white/70">Initiated On</span>
          <span className="text-[13px] md:text-[14px] font-semibold text-white">Oct 24, 2024</span>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-5 flex items-center gap-4 border border-white/5">
        <Lock className="w-5 h-5 text-white/80 shrink-0" strokeWidth={2} />
        <p className="text-[11px] md:text-[12px] text-white/80 leading-relaxed font-medium">
          Your data is protected under the Nigerian<br className="hidden md:block" /> Data Protection Regulation (NDPR).
        </p>
      </div>
    </div>
  );
}
