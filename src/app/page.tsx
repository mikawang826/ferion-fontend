"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [enterpriseName, setEnterpriseName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data?.error ?? "Login failed, please try again");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed, please try again");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          enterpriseName,
          captcha: "inline", // 占位符，后端未校验
        }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data?.error ?? "Registration failed, please try again");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Registration failed, please try again");
      setLoading(false);
    }
  };

  const isLogin = mode === "login";
  const cardMotionClass = isLogin ? "auth-flip-login" : "auth-flip-register";
  const jellyClass = isLogin ? "auth-jelly-login" : "auth-jelly-register";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6">
      <div
        className={`w-full max-w-4xl rounded-3xl border border-white/50 bg-white/50 p-10 shadow-2xl shadow-orange-100/50 backdrop-blur-2xl ${jellyClass}`}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-orange-400 to-orange-200 p-6 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Ferion TaaS Platform
            </p>
            <h1 className="mt-3 text-3xl font-bold">Welcome to Ferion</h1>
            <p className="mt-3 text-orange-50/90">
            Log in to enter the console and create/manage your RWA projects.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <div className="rounded-2xl bg-white/15 px-4 py-3">
              Create structured project drafts.
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3">
              Invite Legal / Admin & Ops / Auditor to collaborate.
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3">
              View progress and assets in a single console.
              </div>
            </div>
          </div>

          <div className="auth-perspective">
            <div
              className={`auth-card rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl ${cardMotionClass}`}
            >
            <div className="flex gap-2 rounded-2xl bg-orange-50 p-1 text-sm font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 rounded-xl px-3 py-2 transition ${
                  isLogin
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-slate-600"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`flex-1 rounded-xl px-3 py-2 transition ${
                  !isLogin
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-slate-600"
                }`}
              >
                Register
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={isLogin ? handleLogin : handleRegister}
            >
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-700">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 shadow-inner outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-700">
                      Enterprise name
                    </label>
                    <input
                      type="text"
                      value={enterpriseName}
                      onChange={(e) => setEnterpriseName(e.target.value)}
                      className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 shadow-inner outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Your company/institution name"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="block text-sm text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 shadow-inner outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 shadow-inner outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Register and enter the console"}
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
