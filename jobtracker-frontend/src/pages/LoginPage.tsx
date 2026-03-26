import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { login, loginWithGoogle, saveAuth } from "../services/auth";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeLogin = (token: { token: string; userId: number; email: string }) => {
    saveAuth(token);
    navigate("/dashboard", { replace: true });
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginWithGoogle(credential);
      completeLogin(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      completeLogin(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_480px]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              JobTracker
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight bg-gradient-to-r from-teal-500 to-indigo-900 bg-clip-text text-transparent">
              Run your job search with a cleaner system.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Keep every role, stage update, note, and link in one place so your
              search stays structured and easier to act on.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">
                  Track your full pipeline
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review saved roles, applications, interviews, and offers without
                  losing context.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">
                  Focus on the next action
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use dashboard views to spot active conversations and stale
                  submissions quickly.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">
                  Keep details organized
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Store job links, notes, locations, and sources in one consistent
                  workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="w-full rounded-[28px] border border-slate-200 bg-white/95 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur sm:p-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Sign in to JobTracker
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review your applications, update pipeline stages, and continue
                where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center bg-linear-to-br from-green-400 to-blue-600 
                text transition hover:bg-linear-to-bl focus:ring-4 focus:outline-none
                focus:ring-green-400 dark:focus:ring-green-800 font-medium rounded-2xl text-lg px-4 py-2.5 text-center leading-5
                disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500">or continue with</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="mb-3 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
                  Google account
                </p>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(res) => {
                      if (res.credential) {
                        void handleGoogleSuccess(res.credential);
                      }
                    }}
                    onError={() => setError("Google login was cancelled or failed")}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    text="continue_with" />
                </div>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-violet-600 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
