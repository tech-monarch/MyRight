"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { UserRole } from "@/lib/types";

/**
 * Why this is a client component checking /api/auth/me, rather than
 * Next.js middleware reading a cookie: the frontend and backend run on
 * different origins (localhost:3000 vs localhost:4000 in development,
 * likely different subdomains in production), so the backend's session
 * cookie is never visible to a request made to the Next.js server itself,
 * middleware could not see it no matter how it was written. This makes
 * one real network call to confirm the session server-side instead.
 *
 * This is a UX convenience (redirect a logged-out person to /login
 * instead of showing them a broken dashboard), not the security boundary,
 * the backend independently re-checks role and resource access on every
 * request regardless of what this component decides.
 */
export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { data: user, loading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const home = user.role === "SUPERADMIN" ? "/admin" : user.role === "LAWYER" ? "/lawyer" : "/dashboard";
      router.replace(home);
    }
  }, [loading, user, allowedRoles, router, pathname]);

  if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-off">
        <Loader2 size={22} className="animate-spin text-blue" />
      </div>
    );
  }

  return <>{children}</>;
}
