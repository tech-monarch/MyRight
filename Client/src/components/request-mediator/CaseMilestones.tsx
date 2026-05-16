import { Check } from "lucide-react";

export default function CaseMilestones() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-7 border border-[#eaedf3]">
      <h3 className="text-[16px] font-extrabold text-primary-navy mb-8">
        Case Milestones
      </h3>

      <div className="relative">
        {/* Timeline connecting line */}
        <div className="absolute left-[11px] top-4 bottom-8 w-[2px] bg-[#eaedf3]"></div>

        {/* Step 1: Case Filed */}
        <div className="flex items-start gap-4 mb-8 relative">
          <div className="w-6 h-6 rounded-full bg-primary-navy flex items-center justify-center shrink-0 z-10 relative">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-gray-900 mb-0.5">Case Filed</span>
            <span className="text-[10px] text-gray-500 font-medium">Mar 22, 2024</span>
          </div>
        </div>

        {/* Step 2: Respondent Accepted */}
        <div className="flex items-start gap-4 mb-8 relative">
          <div className="w-6 h-6 rounded-full bg-primary-navy flex items-center justify-center shrink-0 z-10 relative">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-gray-900 mb-0.5">Respondent Accepted</span>
            <span className="text-[10px] text-gray-500 font-medium">Mar 23, 2024</span>
          </div>
        </div>

        {/* Step 3: Request Mediator (Active) */}
        <div className="flex items-start gap-4 mb-8 relative">
          <div className="w-6 h-6 rounded-full bg-white border-2 border-primary-navy flex items-center justify-center shrink-0 z-10 relative">
            <div className="w-2 h-2 rounded-full bg-primary-navy"></div>
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="text-[13px] font-extrabold text-primary-navy mb-0.5 leading-none">Request Mediator</span>
            <span className="text-[10px] font-bold text-primary-navy tracking-wide">Active Step</span>
          </div>
        </div>

        {/* Step 4: Scheduling (Upcoming) */}
        <div className="flex items-start gap-4 relative">
          <div className="w-6 h-6 rounded-full bg-white border-2 border-[#eaedf3] flex items-center justify-center shrink-0 z-10 relative">
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="text-[13px] font-medium text-gray-400 mb-0.5 leading-none">Scheduling</span>
            <span className="text-[10px] text-gray-400/60 font-medium">Awaiting Assignment</span>
          </div>
        </div>

      </div>
    </div>
  );
}
