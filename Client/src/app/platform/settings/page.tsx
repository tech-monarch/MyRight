import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { ChangePasswordCard } from "@/components/account/ChangePasswordCard";
import { ContactDetailsCard } from "@/components/account/ContactDetailsCard";

export default function PlatformSettingsPage() {
  return (
    <>
      <DashboardTopbar title="Settings" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-xl space-y-6">
          <ContactDetailsCard />
          <ChangePasswordCard />
        </div>
      </main>
    </>
  );
}
