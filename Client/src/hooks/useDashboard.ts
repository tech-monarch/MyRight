import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  User,
  Dispute,
  Agreement,
  DashboardStats,
} from "../types/types";

// Maps your DB status values → the UI status labels your components expect
function mapStatus(dbStatus: string): Dispute["status"] {
  switch (dbStatus) {
    case "open":
      return "AI Assessment";
    case "pending":
      return "Invited Party";
    case "in-mediation":
      return "In Mediation";
    case "resolved":
    case "closed":
      return "Resolved";
    default:
      return "AI Assessment";
  }
}

interface DashboardData {
  user: User | null;
  stats: DashboardStats;
  activeDisputes: Dispute[];
  recentAgreements: Agreement[];
  loading: boolean;
  error: string | null;
}

export function useDashboard(): DashboardData {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDisputes: 0,
    activeMediations: 0,
    resolvedCases: 0,
  });
  const [activeDisputes, setActiveDisputes] = useState<Dispute[]>([]);
  const [recentAgreements, setRecentAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        // 1. Get authenticated session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const authUser = session.user;

        // 2. Fetch profile + all cases in parallel
        const [profileResult, casesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, name, email, created_at")
            .eq("id", authUser.id)
            .single(),

          supabase
            .from("cases")
            .select("id, title, category, status, created_at")
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: false }),
        ]);

        if (profileResult.error) throw profileResult.error;
        if (casesResult.error) throw casesResult.error;

        const profile = profileResult.data;
        const allCases = casesResult.data ?? [];

        // 3. Build User object
        setUser({
          id: profile.id,
          fullName: profile.name ?? authUser.email ?? "User",
          email: profile.email ?? authUser.email ?? "",
          role: "DISPUTANT",
          isCertified: false,
          createdAt: new Date(profile.created_at),
        });

        // 4. Compute stats
        const activeCases = allCases.filter(
          (c) => c.status !== "resolved" && c.status !== "closed",
        );
        const resolvedCases = allCases.filter(
          (c) => c.status === "resolved" || c.status === "closed",
        );
        const mediationCases = allCases.filter(
          (c) => c.status === "in-mediation",
        );

        setStats({
          totalDisputes: allCases.length,
          activeMediations: mediationCases.length,
          resolvedCases: resolvedCases.length,
        });

        // 5. Build active disputes list (non-resolved, max 10)
        const disputes: Dispute[] = activeCases.slice(0, 10).map((c) => ({
          id: `DSP-${String(c.id).padStart(4, "0")}`,
          title: c.title,
          category: c.category ?? "General",
          status: mapStatus(c.status),
          dateInitiated: new Date(c.created_at).toISOString().split("T")[0],
        }));

        setActiveDisputes(disputes);

        // 6. Build recent agreements from resolved cases (max 5)
        const agreements: Agreement[] = resolvedCases.slice(0, 5).map((c) => ({
          id: `AGR-${String(c.id).padStart(4, "0")}`,
          title: `Settlement Agreement: ${c.title}`,
          dateSigned: new Date(c.created_at).toISOString().split("T")[0],
        }));

        setRecentAgreements(agreements);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(message);
        console.error("[useDashboard]", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();

    // Re-fetch if auth state changes (e.g. user logs in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchDashboard();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, stats, activeDisputes, recentAgreements, loading, error };
}
