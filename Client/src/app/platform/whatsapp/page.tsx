import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { WhatsAppConnectCard } from "@/components/admin/WhatsAppConnectCard";

export default function PlatformWhatsAppPage() {
  return (
    <>
      <DashboardTopbar title="Default WhatsApp" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-xl">
          <WhatsAppConnectCard
            base="/api/platform/whatsapp"
            title="Platform default WhatsApp number"
            intro="Messages are sent from this number unless a courthouse has linked its own. You can change it any time; linking a different number unlinks the old one."
          />
        </div>
      </main>
    </>
  );
}
