import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { IntakeWizard } from "@/components/intake/IntakeWizard";

export default function NewDisputePage() {
  return (
    <>
      <DashboardTopbar title="Start a dispute" />
      <main className="flex-1 px-4 py-8 md:px-8">
        <IntakeWizard />
      </main>
    </>
  );
}
