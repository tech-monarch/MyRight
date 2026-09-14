import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["DISPUTANT"]}>
      <MobileMenuProvider>
        <div className="flex min-h-screen bg-surface-off">
          <DashboardSidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </MobileMenuProvider>
    </RequireAuth>
  );
}
