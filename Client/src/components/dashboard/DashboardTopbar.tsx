"use client";

import { Bell, Menu } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-navy hover:bg-surface-off md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {title && <h1 className="text-lg font-bold text-navy">{title}</h1>}
      </div>
      <div className="flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-navy hover:bg-surface-off"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
          {user ? initials(user.name) : "..."}
        </div>
      </div>
    </header>
  );
}
