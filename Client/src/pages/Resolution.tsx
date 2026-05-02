import ResolutionHeader from "../components/resolution/ResolutionHeader";
import RecommendationCard from "../components/resolution/RecommendationCard";
import BenefitsSection from "../components/resolution/BenefitsSection";
import CaseReferenceFooter from "../components/resolution/CaseReferenceFooter";

export default function Resolution() {
  return (
    <div className="min-h-screen bg-(--color-bg-off-white) pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <ResolutionHeader />
        <RecommendationCard />
        <BenefitsSection />
        <CaseReferenceFooter />
      </div>
    </div>
  );
}
