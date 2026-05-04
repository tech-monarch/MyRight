export default function MediationStepper() {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-10">
      {/* Step 1 */}
      <div className="bg-primary-navy rounded p-4 flex flex-col justify-between h-24">
        <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">
          STEP 01
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-white">Send Request</span>
          <div className="w-full h-[3px] bg-[#3a6db9] rounded-full"></div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-[#e4ecfa] rounded p-4 flex flex-col justify-between h-24">
        <span className="text-[10px] text-primary-navy/70 font-bold uppercase tracking-widest">
          STEP 02
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-primary-navy">Await Response</span>
          <div className="w-full h-[3px] bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-[#f0f2f5] rounded p-4 flex flex-col justify-between h-24">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          STEP 03
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Start Mediation</span>
          <div className="w-full h-[3px] bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
