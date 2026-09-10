import { Bell, Handshake, FileText, Clock } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";

interface Notification {
  id: string;
  icon: typeof Bell;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const notifications: Notification[] = [
  {
    id: "n1",
    icon: Handshake,
    title: "Mediation requested",
    body: "Your mediation request for \"Deposit not refunded, Yaba apartment\" has been sent.",
    time: "2 days ago",
    unread: true,
  },
  {
    id: "n2",
    icon: FileText,
    title: "Document uploaded",
    body: "WhatsApp messages with landlord.pdf was added to your case.",
    time: "5 days ago",
    unread: false,
  },
  {
    id: "n3",
    icon: Clock,
    title: "Action needed",
    body: "Upload your signed contract to continue with \"Unpaid invoice, logo design work.\"",
    time: "1 week ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <>
      <DashboardTopbar title="Notifications" />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-2xl space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`flex items-start gap-3 ${n.unread ? "border-blue-light bg-blue-light/30" : ""}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                <n.icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy">{n.title}</p>
                  {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-blue" />}
                </div>
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
