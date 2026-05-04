import { CreditCard, Landmark } from 'lucide-react';

export default function SecurePaymentMethods() {
  return (
    <div className="bg-[#0B2553] rounded-[24px] p-10 mb-12 flex flex-col md:flex-row gap-10 justify-between items-center shadow-xl">
      <div className="flex-1 max-w-lg">
        <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">Secure Payment Methods</h3>
        <p className="text-[#8B9CBD] text-[15px] leading-relaxed mb-8">
          We support a variety of payment options to ensure the process remains frictionless for all parties involved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#1A3870] hover:bg-[#204485] text-white px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors flex-1 shadow-inner shadow-white/5">
            <CreditCard className="w-5 h-5 text-[#8B9CBD]" />
            Credit/Debit
          </button>
          <button className="bg-[#1A3870] hover:bg-[#204485] text-white px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors flex-1 shadow-inner shadow-white/5">
            <Landmark className="w-5 h-5 text-[#8B9CBD]" />
            Bank Transfer
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-[340px] bg-[#122A59] border border-[#1E3A73] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
        <div className="mb-6 w-32 h-32 rounded-xl overflow-hidden border border-[#2A488A] bg-[#0A1A3A] flex items-center justify-center relative">
          <img 
            src="/pci-dss.png" 
            alt="Secure Infrastructure" 
            className="w-full h-full object-cover opacity-80 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2553] to-transparent mix-blend-multiply opacity-50"></div>
        </div>
        <p className="text-[11px] font-bold text-[#647C9E] tracking-[0.2em]">
          PCI DSS COMPLIANT INFRASTRUCTURE
        </p>
      </div>
    </div>
  );
}
