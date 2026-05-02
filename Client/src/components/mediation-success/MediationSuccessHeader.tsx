import { CheckCircle2 } from "lucide-react";

export default function MediationSuccessHeader() {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-1.5 bg-[#dce7ff] text-[#2c5ebc] px-3.5 py-1.5 rounded-full w-fit mb-5">
        <CheckCircle2 className="w-4 h-4 fill-[#2c5ebc] text-[#dce7ff]" />
        <span className="text-[10px] font-bold tracking-widest uppercase mt-0.5">
          Submission Successful
        </span>
      </div>

      <h1 className="text-3xl md:text-[40px] font-extrabold text-primary-navy tracking-tight leading-[1.1] mb-5">
        Mediation Request Sent
      </h1>

      <p className="text-[15px] md:text-base text-gray-600 leading-relaxed max-w-2xl font-medium">
        Your request for dispute resolution has been formally logged. We are now
        preparing to invite the other party to the MyRight portal.
      </p>
    </div>
  );
}
