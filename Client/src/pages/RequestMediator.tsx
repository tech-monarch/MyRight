import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "../../utils/paths";
import RespondentAcceptedAlert from "../components/request-mediator/RespondentAcceptedAlert";
import RequestMediatorCard from "../components/request-mediator/RequestMediatorCard";
import SidebarCaseSummary from "../components/request-mediator/SidebarCaseSummary";
import CaseMilestones from "../components/request-mediator/CaseMilestones";

export default function RequestMediator() {
  return (
    <div className="min-h-screen bg-(--color-bg-off-white) pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-wider uppercase mb-8">
            <Link to={paths.dashboard} className="text-gray-500 hover:text-primary-navy transition-colors">
              Active Disputes
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={3} />
            <span className="text-primary-navy">CASE-LR-2024-101</span>
          </div>

          <RespondentAcceptedAlert />
          <RequestMediatorCard />
        </div>

        {/* Right Sidebar Area */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 lg:pt-14">
          <SidebarCaseSummary />
          <CaseMilestones />
        </div>
        
      </div>
    </div>
  );
}
