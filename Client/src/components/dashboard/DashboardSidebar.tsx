"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Scale,
  FileText,
  MessagesSquare,
  Bell,
  Settings,
  Plus,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { logout } from "@/lib/auth-client";
import { useMobileMenu } from "@/lib/MobileMenuContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/disputes", label: "My disputes", icon: Scale },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/messages", label: "Messages", icon: MessagesSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close } = useMobileMenu();

  return (
    <>
      {/* Backdrop, mobile only, tapping it closes the drawer */}
      <div
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-navy/40 transition-opacity md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-border bg-white transition-transform duration-200 ease-out",
          "md:static md:z-auto md:w-64 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo href="/dashboard" />
          <button onClick={close} className="rounded-lg p-2 text-navy hover:bg-surface-off md:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pt-4">
          <ButtonLink href="/dashboard/disputes/new" className="w-full" icon={<Plus size={16} />}>
            Start a dispute
          </ButtonLink>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-light text-blue"
                    : "text-text-muted hover:bg-surface-off hover:text-navy"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 space-y-3">
          <div className="rounded-lg bg-surface-off p-3.5 text-xs text-text-muted">
            <p className="font-semibold text-navy">Need urgent help?</p>
            <p className="mt-1">
              If you&apos;re in immediate danger, contact the police or emergency
              services first.
            </p>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-off hover:text-navy"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
