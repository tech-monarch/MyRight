import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["DISPUTANT"]}>
      <div className="flex min-h-screen bg-surface-off">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </RequireAuth>
  );
}
