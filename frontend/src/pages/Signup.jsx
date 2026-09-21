import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import Logo from "../components/Logo";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await signup(email, password, name);
      nav("/onboarding");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Sign up failed");
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Get your unfair edge.</h1>
          <p className="text-neutral-400 mb-8">Free forever tier — no credit card required.</p>
          <form onSubmit={submit} className="space-y-4" data-testid="signup-form">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Name</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                data-testid="signup-name-input"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                data-testid="signup-email-input"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="you@studio.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Password</label>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                data-testid="signup-password-input"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="At least 6 characters"
              />
            </div>
            {err && <div className="text-sm text-red-400" data-testid="signup-error">{err}</div>}
            <button
              type="submit" disabled={loading}
              data-testid="signup-submit-btn"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-medium py-3 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Create account
            </button>
          </form>
          <p className="text-sm text-neutral-400 mt-6">
            Already have an account? <Link to="/login" className="text-yellow-500 hover:text-yellow-400" data-testid="signup-login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
