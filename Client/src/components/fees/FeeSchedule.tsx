import { Users, Scale, Settings } from 'lucide-react';

export default function FeeSchedule() {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-extrabold text-[#0B1A3A]">Fee Schedule</h2>
        <span className="text-sm font-medium text-gray-500">Effective Q4 2023</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mediation Fees */}
        <div className="bg-[#F8FAFC] rounded-2xl p-8">
          <div className="text-[#0A2540] mb-5">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1A3A] mb-3">Mediation Fees</h3>
          <p className="text-[15px] text-gray-500 mb-8 min-h-[48px] leading-relaxed">
            Best for collaborative resolution and relationship preservation.
          </p>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Simple Dispute</span>
              <span className="font-bold text-[#0B1A3A] text-base">$1,500 <span className="text-xs text-[#0F62FE] font-bold">fixed</span></span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Complex Case</span>
              <span className="font-bold text-[#0B1A3A] text-base">$350 <span className="text-xs text-[#0F62FE] font-bold">/hr</span></span>
            </div>
          </div>
        </div>

        {/* Arbitration Fees */}
        <div className="bg-[#F8FAFC] rounded-2xl p-8">
          <div className="text-[#0A2540] mb-5">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1A3A] mb-3">Arbitration Fees</h3>
          <p className="text-[15px] text-gray-500 mb-8 min-h-[48px] leading-relaxed">
            Formal adjudication for binding decisions based on claim size.
          </p>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Small Claims</span>
              <span className="font-bold text-[#0B1A3A] text-base">2.5% <span className="text-xs text-[#0F62FE] font-bold">min $500</span></span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Commercial</span>
              <span className="font-bold text-[#0B1A3A] text-base">1.5% <span className="text-xs text-[#0F62FE] font-bold">of value</span></span>
            </div>
          </div>
        </div>

        {/* Administrative */}
        <div className="bg-[#F8FAFC] rounded-2xl p-8">
          <div className="text-[#0A2540] mb-5">
            <Settings className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1A3A] mb-3">Administrative</h3>
          <p className="text-[15px] text-gray-500 mb-8 min-h-[48px] leading-relaxed">
            Platform usage, case management, and secure document filing.
          </p>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Initial Filing</span>
              <span className="font-bold text-[#0B1A3A] text-base">$250</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Platform Access</span>
              <span className="font-bold text-[#0B1A3A] text-base">$100 <span className="text-xs text-[#0F62FE] font-bold">/mo</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
