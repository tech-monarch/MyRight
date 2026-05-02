import { CheckCircle } from "lucide-react";

export default function RecommendationCard() {
  return (
    <div className="bg-[#f4f6f8] rounded-2xl overflow-hidden flex flex-col md:flex-row mb-8 shadow-sm border border-gray-100">
      {/* Left Content Area */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-md w-fit mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
          <span className="text-[10px] font-bold tracking-widest uppercase">
            ADR Recommended
          </span>
        </div>

        <h2 className="text-4xl md:text-[42px] font-medium text-primary-navy mb-4 tracking-tight">
          Arbitration
        </h2>
        
        <p className="text-[15px] text-gray-600 leading-relaxed mb-8 max-w-md">
          This type of dispute is best resolved through arbitration. Arbitration
          offers a confidential, flexible, and structured process where a neutral
          third party helps you reach a mutually beneficial agreement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-primary-navy text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors">
            Start Arbitration
          </button>
          <button className="bg-white text-primary-navy px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            View Other Options
          </button>
        </div>
      </div>

      {/* Right Image Area */}
      <div className="w-full md:w-[45%] relative min-h-[300px] md:min-h-full">
        {/* Using a placeholder image that looks like a corporate professional */}
        <img
          src="/resolute.png"
          alt="Arbitration Professional"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-navy/40 mix-blend-multiply"></div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full max-w-[280px] text-white shadow-xl">
            <CheckCircle className="w-6 h-6 mb-4 text-white" />
            <div className="text-lg font-bold mb-2 tracking-wide">92% Success Rate</div>
            <p className="text-[11px] leading-relaxed text-gray-200">
              Similar cases in the Lagos Multi-Door Courthouse were resolved
              within 14 days using this method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
