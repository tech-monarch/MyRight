import CaseHeader from "../components/case-details/CaseHeader";
import EvidenceSection from "../components/case-details/EvidenceSection";
import WhatToExpect from "../components/case-details/WhatToExpect";
import CaseSidebar from "../components/case-details/CaseSidebar";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

export default function CaseDetails() {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <CaseHeader />
          <EvidenceSection />
          <WhatToExpect />
        </div>

        {/* Right Sidebar Area */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 lg:pt-14">
          <CaseSidebar />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
