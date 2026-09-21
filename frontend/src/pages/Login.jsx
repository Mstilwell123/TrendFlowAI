import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import Logo from "../components/Logo";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const u = await login(email, password);
      nav(u.onboarded ? "/app" : "/onboarding");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="px-5 py-5">
        <Link to="/"><Logo /></Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome back.</h1>
          <p className="text-neutral-400 mb-8">Sign in to your creator workspace.</p>
          <form onSubmit={submit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email-input"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="you@studio.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password-input"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="••••••••"
              />
            </div>
            {err && <div className="text-sm text-red-400" data-testid="login-error">{err}</div>}
            <button
              type="submit" disabled={loading}
              data-testid="login-submit-btn"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-medium py-3 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Sign in
            </button>
          </form>
          <p className="text-sm text-neutral-400 mt-6">
            New here? <Link to="/signup" className="text-yellow-500 hover:text-yellow-400" data-testid="login-signup-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
