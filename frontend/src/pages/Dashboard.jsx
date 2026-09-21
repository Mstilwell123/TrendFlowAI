import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import RecentAnalyses from "../components/dashboard/RecentAnalyses";

const EMPTY_STATS = { study_count: 0, test_count: 0, vault_count: 0, outcomes_count: 0, avg_alignment: 0 };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/analyses?limit=8").then((r) => setRecent(r.data.items || [])).catch(() => {});
  }, []);

  const firstName = user?.name?.split(" ")[0] || "creator";

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-12 max-w-7xl mx-auto" data-testid="dashboard-page">
      {/* Pre-flight lock */}
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Workspace</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Hey {firstName}. <span className="text-neutral-500">Let&apos;s ship one.</span>
        </h1>
      </div>
      <DashboardStats stats={stats} />
      <DashboardQuickActions />
      <RecentAnalyses items={recent} />
    </div>
  );
}
