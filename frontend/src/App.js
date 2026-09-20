import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import PlatformAnalyze from "@/pages/PlatformAnalyze";
import StudyMode from "@/pages/StudyMode";
import TestMode from "@/pages/TestMode";
import AnalysisView from "@/pages/AnalysisView";
import Vault from "@/pages/Vault";
import Settings from "@/pages/Settings";
import PublicReport from "@/pages/PublicReport";
import EmbedReport from "@/pages/EmbedReport";
import Pricing from "@/pages/Pricing";

function RequireAuth({ children, requireOnboarded = true }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-500 flex items-center justify-center">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster theme="dark" position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/r/:slug" element={<PublicReport />} />
            <Route path="/embed/:slug" element={<EmbedReport />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={
              <RequireAuth requireOnboarded={false}><Onboarding /></RequireAuth>
            } />
            <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              {/* Desktop platform menu: TikTok | YouTube | Instagram | Facebook */}
              <Route path=":platform/:mode" element={<PlatformAnalyze />} />
              <Route path="analyze" element={<Navigate to="/app/tiktok/study" replace />} />
              {/* Legacy redirects */}
              <Route path="study" element={<Navigate to="/app/tiktok/study" replace />} />
              <Route path="test" element={<Navigate to="/app/tiktok/test" replace />} />
              <Route path="vault" element={<Vault />} />
              <Route path="settings" element={<Settings />} />
              <Route path="analysis/:id" element={<AnalysisView />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
