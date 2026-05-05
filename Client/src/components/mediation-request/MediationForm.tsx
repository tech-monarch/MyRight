import { UserPlus } from "lucide-react";

export default function MediationForm() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#f4f6f8] w-12 h-12 flex items-center justify-center rounded-lg text-primary-navy">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary-navy">Other party contact</h2>
          <p className="text-[13px] text-gray-500">Provide details to invite them to this case.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
            FULL NAME
          </label>
          <input
            type="text"
            placeholder="Nimah A"
            className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
            ORGANIZATION (OPTIONAL)
          </label>
          <input
            type="text"
            placeholder="Pantheon"
            className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          placeholder="contact@otherparty.com"
          className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy"
        />
      </div>

      <div className="mb-8">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
          PHONE NUMBER
        </label>
        <div className="flex bg-bg-light-gray rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary-navy transition-shadow">
          <div className="px-4 py-3 bg-bg-light-gray text-sm font-semibold text-gray-700 flex items-center shrink-0">
            +234
          </div>
          <input
            type="tel"
            placeholder="801 234 5678"
            className="w-full bg-transparent border-none px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <button className="bg-primary-navy text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-blue-900 transition-colors">
        Send Invitation
      </button>
    </div>
  );
}
