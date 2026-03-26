import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, saveAuth } from "../services/auth";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await register(email, password);
      saveAuth(data);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          JobTracker System
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Create an account to start tracking your job applications
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required />
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
