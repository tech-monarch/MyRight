import { Wallet, Banknote } from 'lucide-react';

export default function FinancialStatus() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-10 border border-gray-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#0A2540] mb-4">
            ACTIVE CASE #9812
          </span>
          <h2 className="text-[22px] font-bold text-[#0B1A3A]">Financial Status</h2>
        </div>
        <div className="text-[#0F62FE]">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-[15px]">
          <span className="text-gray-500">Deposit Paid</span>
          <span className="font-bold text-[#0B1A3A]">$00.00</span>
        </div>
        <div className="flex justify-between items-center text-[15px]">
          <span className="text-gray-500">Professional Fees</span>
          <span className="font-bold text-[#0B1A3A]">$1500.00</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
        <span className="text-[17px] font-bold text-[#0A2540]">Balance Due</span>
        <span className="text-3xl font-extrabold text-[#0B1A3A]">$1500.00</span>
      </div>

      <button className="w-full bg-[#0B1A3A] hover:bg-[#0A2540]/90 text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Banknote className="w-5 h-5" />
        Settle Outstanding Balance
      </button>
    </div>
  );
}
