import ResolutionHeader from "../components/resolution/ResolutionHeader";
import RecommendationCard from "../components/resolution/RecommendationCard";
import BenefitsSection from "../components/resolution/BenefitsSection";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

export default function Resolution() {
  return (
    <div className="flex min-h-screen bg-(--color-bg-off-white) font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
          <ResolutionHeader />
          <RecommendationCard />
          <BenefitsSection />
        </div>
      </div>
      </div>
    </div>
  );
}
