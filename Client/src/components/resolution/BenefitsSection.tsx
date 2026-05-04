import { Clock, PiggyBank, Lock } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Faster Resolution",
    description: "Avoid court backlogs. Mediation typically concludes in 1-3 sessions compared to months of litigation."
  },
  {
    icon: PiggyBank,
    title: "Cost Effective",
    description: "Significantly reduce legal fees and administrative costs by settling early in a controlled environment."
  },
  {
    icon: Lock,
    title: "Confidential",
    description: "Unlike public court proceedings, mediation happens behind closed doors, protecting your reputation and privacy."
  }
];

export default function BenefitsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {benefits.map((benefit, idx) => (
        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <benefit.icon className="w-6 h-6 text-primary-navy mb-5" strokeWidth={1.5} />
          <h3 className="text-[15px] font-medium text-primary-navy mb-3">
            {benefit.title}
          </h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            {benefit.description}
          </p>
        </div>
      ))}
    </div>
  );
}
