export default function MediationSuccessStepper() {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-16">
      {/* Step 1 */}
      <div className="bg-primary-navy rounded-sm p-4 md:p-5 flex flex-col justify-between h-[85px] md:h-[95px]">
        <span className="text-[9px] md:text-[10px] text-white/80 font-bold uppercase tracking-widest">
          Step 01
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-xs md:text-[13px] font-semibold text-white">
            Request sent
          </span>
          <div className="w-full h-[3px] bg-white rounded-full"></div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-[#dce7ff] rounded-sm p-4 md:p-5 flex flex-col justify-between h-[85px] md:h-[95px] relative">
        <div className="flex justify-between items-center w-full">
          <span className="text-[9px] md:text-[10px] text-primary-navy/70 font-bold uppercase tracking-widest">
            Step 02
          </span>
          <span className="bg-white text-primary-navy text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-[3px] uppercase">
            Active Task
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs md:text-[13px] font-bold text-primary-navy">
            Awaiting response
          </span>
          <div className="w-full h-[3px] bg-gray-400/30 rounded-full"></div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-[#f0f2f5] rounded-sm p-4 md:p-5 flex flex-col justify-between h-[85px] md:h-[95px]">
        <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Step 03
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-xs md:text-[13px] font-semibold text-gray-400">
            In mediation
          </span>
          <div className="w-full h-[3px] bg-gray-200/50 rounded-full opacity-0"></div>
        </div>
      </div>
    </div>
  );
}
