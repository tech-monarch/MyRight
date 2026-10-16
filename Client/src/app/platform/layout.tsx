import { PlatformSidebar } from "@/components/platform/PlatformSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["PLATFORM_ADMIN"]}>
      <MobileMenuProvider>
        <div className="flex min-h-screen bg-surface-off">
          <PlatformSidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </MobileMenuProvider>
    </RequireAuth>
  );
}
