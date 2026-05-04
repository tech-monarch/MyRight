import MediationSuccessHeader from "../components/mediation-success/MediationSuccessHeader";
import MediationSuccessStepper from "../components/mediation-success/MediationSuccessStepper";
import CaseSummaryCard from "../components/mediation-success/CaseSummaryCard";
import WhatHappensNext from "../components/mediation-success/WhatHappensNext";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

export default function MediationSuccess() {
  return (
    <div className="flex min-h-screen bg-(--color-bg-off-white) font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-12">
          <div className="max-w-250 mx-auto">
          <MediationSuccessHeader />
          <MediationSuccessStepper />

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-8 items-stretch mt-12">
            <CaseSummaryCard />
            <WhatHappensNext />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
