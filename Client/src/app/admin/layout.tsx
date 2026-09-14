import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["SUPERADMIN"]}>
      <MobileMenuProvider>
        <div className="flex min-h-screen bg-surface-off">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </MobileMenuProvider>
    </RequireAuth>
  );
}
