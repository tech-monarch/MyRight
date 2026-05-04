import { Award, CalendarDays, ShieldCheck } from "lucide-react";

export default function RequestMediatorCard() {
  const features = [
    {
      icon: Award,
      title: "Subject Expertise",
      desc: "Deep alignment with case legal specifics."
    },
    {
      icon: CalendarDays,
      title: "Availability",
      desc: "Ready to initiate the preliminary hearing."
    },
    {
      icon: ShieldCheck,
      title: "Neutral Status",
      desc: "Vetted for 100% impartial mediation."
    }
  ];

  return (
    <div className="bg-white rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-8 md:p-12 mb-8 border border-[#eaedf3]">
      <h1 className="text-[32px] md:text-[38px] font-extrabold text-primary-navy tracking-tight mb-5 leading-tight">
        Request Mediator
      </h1>
      <p className="text-[15px] md:text-[17px] text-gray-500 leading-relaxed max-w-2xl mb-10 font-medium">
        MyRight uses a proprietary matching algorithm to assign the most
        qualified professional based on your case details, technical complexity,
        and party preferences.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {features.map((item, idx) => (
          <div key={idx} className="bg-[#f7f9fc] rounded-xl p-5 border border-[#eaedf3] flex flex-col items-start">
            <item.icon className="w-[22px] h-[22px] text-primary-navy mb-4" strokeWidth={1.5} />
            <h4 className="text-[13px] font-extrabold text-primary-navy mb-1.5">
              {item.title}
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <button className="bg-primary-navy text-white px-8 py-4 rounded-xl text-[14px] font-bold transition-transform hover:scale-105 shadow-md">
          Request Mediator
        </button>
        <span className="text-[11px] text-gray-400 font-medium italic max-w-[150px] leading-snug">
          Assignment typically takes 1-2 business days.
        </span>
      </div>
    </div>
  );
}
