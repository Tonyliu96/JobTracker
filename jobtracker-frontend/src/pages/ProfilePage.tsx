import React, { useEffect, useState } from "react";
import { changePassword, getEmail } from "../services/auth";

const ProfilePage: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      setMessage("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(135deg,_#ffffff_0%,_#f8fafc_55%,_#e2e8f0_100%)] p-6 shadow-sm">
        <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute left-1/3 top-16 h-28 w-28 rounded-full bg-slate-300/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Profile
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Manage your account settings without leaving the workflow.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review your account identity and keep your password current so the
              rest of your dashboard stays uninterrupted.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Account email
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900 break-all">
                {email ?? "(Email not available)"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Access level
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Standard user</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Security
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Password login</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Account
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Identity summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs text-slate-500">Email address</p>
              <p className="mt-1 text-sm font-medium text-slate-900 break-all">
                {email ?? "(Email not available)"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs text-slate-500">Recommended action</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Update your password periodically and keep your account details
                consistent with the identity you use for applications.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Security
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Change password
            </h2>
            <p className="text-sm text-slate-500">
              Use a strong password that you are not reusing elsewhere.
            </p>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-xl">
            <div>
              <label
                htmlFor="old-password"
                className="block text-xs font-medium text-slate-700 mb-1">
                Old Password
              </label>
              <input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                required/>
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                required/>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
              {loading ? "Changing..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
