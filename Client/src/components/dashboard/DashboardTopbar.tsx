"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { getUnreadCount } from "@/lib/notifications-client";
import { useMobileMenu } from "@/lib/MobileMenuContext";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardTopbar({ title }: { title?: string }) {
  const { data: user } = useCurrentUser();
  const { toggle } = useMobileMenu();

  // Only disputants and lawyers have a notifications page. Poll cheaply (count only) once a minute.
  const bellHref = user?.role === "LAWYER" ? "/lawyer/notifications" : user?.role === "DISPUTANT" ? "/dashboard/notifications" : null;
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!bellHref) return;
    let cancelled = false;
    const load = () =>
      getUnreadCount()
        .then((r) => !cancelled && setUnread(r.unreadCount))
        .catch(() => undefined);
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [bellHref]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-navy hover:bg-surface-off md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {title && <h1 className="text-lg font-bold text-navy">{title}</h1>}
      </div>
      <div className="flex items-center gap-4">
        {bellHref && (
          <Link
            href={bellHref}
            className="relative rounded-full p-2 text-navy hover:bg-surface-off"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
          {user ? initials(user.name) : "..."}
        </div>
      </div>
    </header>
  );
}
