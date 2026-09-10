import { LawyerSidebar } from "@/components/lawyer/LawyerSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["LAWYER"]}>
      <div className="flex min-h-screen bg-surface-off">
        <LawyerSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </RequireAuth>
  );
}
