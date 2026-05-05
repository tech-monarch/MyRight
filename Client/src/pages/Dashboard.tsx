import { useEffect, useState } from "react";
import { api } from "../lib/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import TrustIndicator from "../components/dashboard/TrustIndicator";
import StatCards from "../components/dashboard/StatCards";
import ActiveDisputesList from "../components/dashboard/ActiveDisputesList";
import EducationalSidebar from "../components/dashboard/EducationalSidebar";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";
import type { DashboardStats, Dispute } from "../types/types";

// ── Skeleton shimmer for loading state ──────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-label="Loading dashboard…">
      {/* Header skeleton */}
      <div className="border-b-2 border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-12 w-40" />
      </div>

      {/* Trust indicator skeleton */}
      <Skeleton className="h-8 w-full max-w-lg" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border border-gray-200">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-6 flex flex-col gap-4 bg-white">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-14 w-16" />
          </div>
        ))}
      </div>

      {/* Dispute list skeleton */}
      <div className="border border-gray-200 divide-y divide-gray-200">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-5 flex gap-4">
            <Skeleton className="h-4 w-6" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border border-red-200 bg-red-50 px-5 py-4 rounded-md flex items-start gap-3"
    >
      <span className="text-red-500 font-black text-base leading-none mt-0.5">
        !
      </span>
      <div>
        <p className="text-sm font-bold text-red-700 mb-0.5">
          Failed to load dashboard
        </p>
        <p className="text-xs text-red-600">{message}</p>
      </div>
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDisputes: 0,
    activeMediations: 0,
    resolvedCases: 0,
  });
  const [activeDisputes, setActiveDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // You can also fetch user info from your auth hook; we'll keep a placeholder.
  const user = null; // replace with your actual user data if needed

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, disputesData] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getDisputes(),
        ]);
        setStats(statsData);
        setActiveDisputes(disputesData.disputes);
      } catch (err: unknown) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-(--color-bg-off-white) font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="pt-10 pb-16 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* ── Main column ── */}
            <div className="flex-1 flex flex-col gap-10">
              {loading ? (
                <DashboardSkeleton />
              ) : error ? (
                <>
                  <DashboardHeader user={null} />
                  <ErrorBanner message={error} />
                </>
              ) : (
                <>
                  <DashboardHeader user={user} />
                  <TrustIndicator />
                  <StatCards stats={stats} />
                  <ActiveDisputesList disputes={activeDisputes} />
                </>
              )}
            </div>

            {/* ── Sidebar ── */}
            <EducationalSidebar recentAgreements={loading ? [] : []} />
          </div>
        </div>
      </div>
    </div>
  );
}
