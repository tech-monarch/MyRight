import MediationHeader from "../components/mediation-request/MediationHeader";
import MediationStepper from "../components/mediation-request/MediationStepper";
import MediationForm from "../components/mediation-request/MediationForm";

export default function MediationRequest() {
  return (
    <div className="min-h-screen bg-(--color-bg-off-white) pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <MediationHeader />
        <MediationStepper />
        <MediationForm />
      </div>
    </div>
  );
}
