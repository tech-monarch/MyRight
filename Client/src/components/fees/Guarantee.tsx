import { Shield, CheckCircle2 } from 'lucide-react';

export default function Guarantee() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] mb-12 flex flex-col md:flex-row gap-6 items-start">
      <div className="bg-[#0B1A3A] text-white p-4 rounded-xl shrink-0">
        <Shield className="w-8 h-8" />
      </div>
      <div className="flex-1 mt-1 md:mt-0">
        <h3 className="text-xl font-bold text-[#0B1A3A] mb-3">The MyRight Guarantee</h3>
        <p className="text-[15px] text-gray-500 mb-6 leading-relaxed max-w-4xl">
          Your peace of mind is our priority. All deposits are held in a secure, non-interest bearing escrow account. Funds are only released to the resolution professionals once specific case milestones mutually agreed upon at the start of your dispute have been reached and verified.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-24">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-[15px] font-semibold text-gray-800">Milestone-based release</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-[15px] font-semibold text-gray-800">Bank-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
