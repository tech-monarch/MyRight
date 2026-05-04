import MediationHeader from "../components/mediation-request/MediationHeader";
import MediationStepper from "../components/mediation-request/MediationStepper";
import MediationForm from "../components/mediation-request/MediationForm";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

export default function MediationRequest() {
  return (
    <div className="flex min-h-screen bg-(--color-bg-off-white) font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
          <MediationHeader />
          <MediationStepper />
          <MediationForm />
        </div>
      </div>
      </div>
    </div>
  );
}
