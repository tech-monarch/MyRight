import { LawyerSidebar } from "@/components/lawyer/LawyerSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["LAWYER"]}>
      <MobileMenuProvider>
        <div className="flex min-h-screen bg-surface-off">
          <LawyerSidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </MobileMenuProvider>
    </RequireAuth>
  );
}
