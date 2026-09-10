import { Scale } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";

const notifications = [
  { id: "n1", title: "New case assigned", body: "You have been assigned to a new case by your SuperAdmin.", time: "5 days ago" },
  { id: "n2", title: "Case updated", body: "A document was added to one of your assigned cases.", time: "1 week ago" },
];

export default function LawyerNotificationsPage() {
  return (
    <>
      <DashboardTopbar title="Notifications" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-2xl space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                <Scale size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{n.title}</p>
                <p className="mt-0.5 text-sm text-text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-text-muted">{n.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
