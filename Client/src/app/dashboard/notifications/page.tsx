import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <>
      <DashboardTopbar title="Notifications" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-2xl">
          <NotificationsList />
        </div>
      </main>
    </>
  );
}
