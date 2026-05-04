import { CheckCircle2, Eye, UserPlus, CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "../../../utils/paths";

export default function CaseHeader() {
  return (
    <div className="mb-12 ">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-wider uppercase mb-8">
        <Link to={paths.dashboard} className="text-gray-500 hover:text-primary-navy transition-colors">
          Active Disputes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={3} />
        <span className="text-primary-navy">CASE-LR-2024-101</span>
      </div>

      {/* Main Status Card */}
      <div className="bg-gray-100 border border-gray-300 rounded-[24px] p-8 md:p-12">
        <div className="inline-flex items-center gap-2.5 bg-[#ffecd6] text-[#d97034] px-3.5 py-1.5 rounded-md w-fit mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#d97034]"></div>
          <span className="text-[11px] font-extrabold tracking-widest uppercase">
            Active Dispute
          </span>
        </div>

        <h1 className="text-[32px] md:text-[46px] font-extrabold text-primary-navy tracking-tight leading-[1.15] mb-6 max-w-[800px]">
          Status: Pending Response from Other Party
        </h1>

        <p className="text-[16px] md:text-[18px] text-gray-500 leading-relaxed max-w-4xl mb-12 font-medium">
          Your mediation request has been successfully transmitted. We are
          currently waiting for the respondent to acknowledge the claim and
          provide their initial statement.
        </p>

        {/* Status Pipeline Buttons */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <button className="flex items-center gap-2.5 bg-primary-navy text-white px-6 py-3.5 rounded-xl text-[13px] font-bold tracking-wider uppercase transition-transform hover:scale-105">
            <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            Sent
          </button>
          
          <button className="flex items-center gap-2.5 bg-[#d6e3ff] text-primary-navy px-6 py-3.5 rounded-xl text-[13px] font-bold tracking-wider uppercase transition-transform hover:scale-105">
            <Eye className="w-4 h-4 text-primary-navy" strokeWidth={2.5} />
            Review
          </button>

          <button className="flex items-center gap-2.5 bg-[#e8ecf1] text-gray-500 px-6 py-3.5 rounded-xl text-[13px] font-bold tracking-wider uppercase transition-transform hover:scale-105">
            <UserPlus className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
            Assignment
          </button>

          <button className="flex items-center gap-2.5 bg-[#e8ecf1] text-gray-500 px-6 py-3.5 rounded-xl text-[13px] font-bold tracking-wider uppercase transition-transform hover:scale-105">
            <CalendarDays className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
            Session
          </button>
        </div>
      </div>
    </div>
  );
}
