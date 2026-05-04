import { CheckCircle } from "lucide-react";

export default function RespondentAcceptedAlert() {
  return (
    <div className="bg-[#eef3fb] border-l-[4px] border-primary-navy rounded-r-xl p-5 md:p-6 mb-8 flex items-start gap-4">
      <div className="text-primary-navy mt-0.5">
        <CheckCircle className="w-[22px] h-[22px] fill-primary-navy text-white" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-bold text-primary-navy">
          The respondent has accepted!
        </h3>
        <p className="text-[13px] text-gray-500/90 leading-relaxed font-medium">
          Both parties have now agreed to proceed with mediation. The next step
          is to assign an impartial mediator.
        </p>
      </div>
    </div>
  );
}
