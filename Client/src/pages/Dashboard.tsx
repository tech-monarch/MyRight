import {
  DUMMY_USER,
  DUMMY_STATS,
  DUMMY_ACTIVE_DISPUTES,
  DUMMY_RECENT_AGREEMENTS,
} from "../../utils/data";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import TrustIndicator from "../components/dashboard/TrustIndicator";
import StatCards from "../components/dashboard/StatCards";
import ActiveDisputesList from "../components/dashboard/ActiveDisputesList";
import EducationalSidebar from "../components/dashboard/EducationalSidebar";

export default function Dashboard() {

  return (
    <div className="min-h-screen bg-(--color-bg-off-white) pt-28 pb-16 px-6 lg:px-16 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
        <div className="flex-1 flex flex-col gap-10">
          <DashboardHeader user={DUMMY_USER} />
          <TrustIndicator />
          <StatCards stats={DUMMY_STATS} />
          <ActiveDisputesList disputes={DUMMY_ACTIVE_DISPUTES} />
        </div>
        <EducationalSidebar recentAgreements={DUMMY_RECENT_AGREEMENTS} />
      </div>
    </div>
  );
}
