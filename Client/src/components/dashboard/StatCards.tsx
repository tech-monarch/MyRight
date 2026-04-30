import {
  RiFileList3Line,
  RiMessage3Line,
  RiCheckDoubleLine,
} from "react-icons/ri";
import type { DashboardStats } from "../../../types/types";

interface StatCardsProps {
  stats: DashboardStats;
}

const stats_config = [
  {
    key: "totalDisputes" as const,
    label: "Total Disputes",
    icon: RiFileList3Line,
    accent: "border-(--color-primary-navy)",
    iconColor: "text-(--color-primary-navy)",
    bg: "bg-(--color-primary-navy)",
  },
  {
    key: "activeMediations" as const,
    label: "Active Mediations",
    icon: RiMessage3Line,
    accent: "border-(--color-primary-blue)",
    iconColor: "text-(--color-primary-blue)",
    bg: "bg-(--color-primary-blue)",
  },
  {
    key: "resolvedCases" as const,
    label: "Resolved Cases",
    icon: RiCheckDoubleLine,
    accent: "border-emerald-600",
    iconColor: "text-emerald-600",
    bg: "bg-emerald-600",
  },
];

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-text-muted) mb-4">
        Case Overview
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-(--color-border-light) border border-(--color-border-light)">
        {stats_config.map(({ key, label, icon: Icon, bg }) => (
          <div
            key={key}
            className="p-6 flex flex-col gap-4 bg-white hover:bg-(--color-bg-off-white) transition-colors duration-150 group"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider">
                {label}
              </p>
              <div className={`${bg} p-1.5`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-black text-(--color-primary-navy) leading-none tabular-nums">
                {stats[key]}
              </span>
              <span className="text-(--color-text-muted) text-xs mb-1.5 font-medium">
                cases
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
