"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Scale, Bell, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/Badge";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { logout } from "@/lib/auth-client";

const navItems = [
  { href: "/lawyer", label: "My dashboard", icon: LayoutDashboard },
  { href: "/lawyer/cases", label: "My cases", icon: Scale },
  { href: "/lawyer/notifications", label: "Notifications", icon: Bell },
  { href: "/lawyer/settings", label: "Settings", icon: Settings },
];

export function LawyerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white md:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo href="/lawyer" />
      </div>
      <div className="px-4 pt-4 flex items-center justify-between">
        <Badge tone="blue">Lawyer</Badge>
        {user && <span className="truncate text-xs text-text-muted">{user.name}</span>}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const active = item.href === "/lawyer" ? pathname === "/lawyer" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-blue-light text-blue" : "text-text-muted hover:bg-surface-off hover:text-navy"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
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
  );
}
