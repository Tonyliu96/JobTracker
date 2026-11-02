import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login, loginWithGoogle, saveAuth } from "../api/auth";
import AuthThemeToggle from "../components/AuthThemeToggle";

const inputClass = "h-11 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleUnavailable, setGoogleUnavailable] = useState(!import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(400);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => { const handleThemeChange = (event: Event) => setDarkMode((event as CustomEvent<{ darkMode: boolean }>).detail.darkMode); window.addEventListener("jobtracker-theme-change", handleThemeChange); return () => window.removeEventListener("jobtracker-theme-change", handleThemeChange); }, []);
  useEffect(() => {
    const updateGoogleButtonWidth = () => {
      const containerWidth = googleContainerRef.current?.offsetWidth ?? 400;
      setGoogleButtonWidth(Math.max(200, Math.min(400, Math.floor(containerWidth))));
    };
    updateGoogleButtonWidth();
    window.addEventListener("resize", updateGoogleButtonWidth);
    return () => window.removeEventListener("resize", updateGoogleButtonWidth);
  }, [googleUnavailable]);
  const completeLogin = (data: { token: string; userId: number; email: string }) => { saveAuth(data); navigate("/dashboard", { replace: true }); };
  const errorMessage = (err: unknown, fallback: string) => { const message = err instanceof Error ? err.message : fallback; return message.includes("429") || message.toLowerCase().includes("too many") ? "Too many attempts. Please try again in a minute." : message; };
  const handleSubmit = async (event: React.FormEvent) => { event.preventDefault(); setError(null); setLoading(true); try { completeLogin(await login(email, password)); } catch (err: unknown) { setError(errorMessage(err, "Login failed")); } finally { setLoading(false); } };
  const handleGoogleSuccess = async (credential: string) => { setError(null); setLoading(true); try { completeLogin(await loginWithGoogle(credential)); } catch (err: unknown) { setError(errorMessage(err, "Google login failed")); setGoogleUnavailable(true); } finally { setLoading(false); } };

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground sm:py-12" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 8%, transparent), transparent 55%)" }}>
    <div className="absolute right-4 top-4 sm:right-6 sm:top-6"><AuthThemeToggle /></div>
    <section className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl sm:p-8">
      <header><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">JT</span><span className="text-lg font-semibold text-foreground">JobTracker</span></div><h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">Sign in</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Welcome back. Enter your details to continue.</p></header>
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>}
        <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-foreground">Email</label><input autoFocus id="login-email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(error)} className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
        <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium text-foreground">Password</label><div className="relative"><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" aria-invalid={Boolean(error)} className={`${inputClass} pr-11`} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /><button type="button" aria-label={showPassword ? "Hide value" : "Show value"} onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">{showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button></div></div>
        <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{loading ? "Signing in..." : "Login"}</button>
      </form>
      <div className="relative my-6 flex items-center"><div className="w-full border-t border-border" /><span className="absolute left-1/2 -translate-x-1/2 bg-surface px-3 text-xs text-muted-foreground">or</span></div>
      {googleUnavailable ? <button type="button" disabled className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-surface-muted px-4 text-sm font-medium text-muted-foreground">Google sign-in unavailable</button> : <div ref={googleContainerRef} className="flex min-h-11 w-full justify-center overflow-hidden rounded-lg [&>div]:w-full"><GoogleLogin key={`${darkMode}-${googleButtonWidth}`} onSuccess={(response) => { if (response.credential) void handleGoogleSuccess(response.credential); }} onError={() => { setError("Google login was cancelled or failed"); setGoogleUnavailable(true); }} useOneTap={false} theme={darkMode ? "filled_black" : "outline"} size="large" text="continue_with" width={String(googleButtonWidth)} /></div>}
      <p className="mt-6 text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link></p>
    </section>
  </main>;
};

export default LoginPage;
