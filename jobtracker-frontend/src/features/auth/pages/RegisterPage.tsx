import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register, saveAuth } from "../api/auth";
import AuthThemeToggle from "../components/AuthThemeToggle";

const inputClass = "h-11 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (event: React.FormEvent) => { event.preventDefault(); setError(null); if (password.length < 8) { setError("At least 8 characters"); return; } if (password !== confirmPassword) { setError("Passwords do not match"); return; } setLoading(true); try { const data = await register(email, password); saveAuth(data); navigate("/dashboard", { replace: true }); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Register failed"); } finally { setLoading(false); } };

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground sm:py-12" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 8%, transparent), transparent 55%)" }}>
    <div className="absolute right-4 top-4 sm:right-6 sm:top-6"><AuthThemeToggle /></div>
    <section className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl sm:p-8">
      <header><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">JT</span><span className="text-lg font-semibold text-foreground">JobTracker</span></div><h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">Create account</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Start organizing your job search in one place.</p></header>
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>}
        <div><label htmlFor="register-email" className="mb-2 block text-sm font-medium text-foreground">Email</label><input autoFocus id="register-email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(error)} className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
        <div><label htmlFor="register-password" className="mb-2 block text-sm font-medium text-foreground">Password</label><div className="relative"><input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-invalid={Boolean(error)} className={`${inputClass} pr-11`} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" required /><button type="button" aria-label={showPassword ? "Hide value" : "Show value"} onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">{showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button></div><p className="mt-2 text-xs text-muted-foreground">At least 8 characters</p></div>
        <div><label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-foreground">Confirm password</label><div className="relative"><input id="register-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" aria-invalid={Boolean(error)} className={`${inputClass} pr-11`} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" required /><button type="button" aria-label={showConfirmPassword ? "Hide value" : "Show value"} onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">{showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button></div></div>
        <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{loading ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
    </section>
  </main>;
};

export default RegisterPage;
