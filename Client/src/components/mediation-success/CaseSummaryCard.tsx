// pages/MediationSuccess.tsx (or whichever file you are using)
import { useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import DashboardTopNav from "../../components/dashboard/DashboardTopNav";

export default function MediationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { caseId, disputeType, initiatedOn, opponentName } = location.state || {};

  const formattedDate = initiatedOn
    ? new Date(initiatedOn).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-primary-navy rounded-xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <h3 className="text-[11px] font-bold text-white/60 tracking-widest uppercase mb-8">
                Case Summary
              </h3>

              <div className="flex flex-col gap-4 mb-10">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[13px] md:text-[14px] text-white/70">
                    Reference ID
                  </span>
                  <span className="text-[13px] md:text-[14px] font-semibold text-white">
                    {caseId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[13px] md:text-[14px] text-white/70">
                    Dispute Type
                  </span>
                  <span className="text-[13px] md:text-[14px] font-semibold text-white">
                    {disputeType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[13px] md:text-[14px] text-white/70">
                    Opponent
                  </span>
                  <span className="text-[13px] md:text-[14px] font-semibold text-white">
                    {opponentName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[13px] md:text-[14px] text-white/70">
                    Initiated On
                  </span>
                  <span className="text-[13px] md:text-[14px] font-semibold text-white">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-5 flex items-center gap-4 border border-white/5">
                <Lock className="w-5 h-5 text-white/80 shrink-0" strokeWidth={2} />
                <p className="text-[11px] md:text-[12px] text-white/80 leading-relaxed font-medium">
                  Your data is protected under the Nigerian<br /> Data Protection Regulation (NDPR).
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-primary-navy underline text-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/dispute-overview")}
                className="text-primary-navy underline text-sm"
              >
                View All Disputes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}