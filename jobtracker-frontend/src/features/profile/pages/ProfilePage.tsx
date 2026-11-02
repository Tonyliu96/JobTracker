import React, { useEffect, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { changePassword, getEmail, getProfile, type UserProfile } from "../../auth/api/auth";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
};

function PasswordField({ id, label, value, onChange, visible, onToggle }: PasswordFieldProps) {
  return <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
    <div className="relative">
      <input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-border bg-surface-muted px-3 py-2.5 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25" required />
      <button type="button" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} onClick={onToggle} className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-surface hover:text-foreground">
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  </div>;
}

const ProfilePage: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(getEmail());
    void getProfile().then(setProfile).catch(() => undefined);
  }, []);

  const toggleField = (id: string) => setVisibleFields((previous) => ({ ...previous, [id]: !previous[id] }));
  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (newPassword !== confirmPassword) throw new Error("New passwords do not match");
      if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
      await changePassword(oldPassword, newPassword);
      toast.success("Password updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const initial = (email?.trim().charAt(0) || "U").toUpperCase();
  const isGoogleAccount = profile?.authProvider === "GOOGLE";

  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 lg:px-8">
    <header><h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile</h1><p className="mt-1 text-sm text-muted-foreground">Manage your account and security</p></header>

    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">Account</h2>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">{initial}</div>
        <div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Email</p><p className="mt-1 break-all text-base font-medium text-foreground">{email ?? "Email not available"}</p></div>
        <div className="sm:text-right"><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Sign-in method</p><span className="mt-2 inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground">{isGoogleAccount ? "Google" : "Password"}</span></div>
      </div>
    </section>

    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">Change password</h2>
      {isGoogleAccount ? <p className="mt-4 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-muted-foreground">You sign in with Google, so there is no password to change.</p> : <form onSubmit={handleChangePassword} className="mt-5 space-y-4"><PasswordField id="old-password" label="Old password" value={oldPassword} onChange={setOldPassword} visible={Boolean(visibleFields["old-password"])} onToggle={() => toggleField("old-password")} /><PasswordField id="new-password" label="New password" value={newPassword} onChange={setNewPassword} visible={Boolean(visibleFields["new-password"])} onToggle={() => toggleField("new-password")} /><PasswordField id="confirm-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} visible={Boolean(visibleFields["confirm-password"])} onToggle={() => toggleField("confirm-password")} /><p className="text-xs text-muted-foreground">Use at least 8 characters. A longer password is stronger.</p><div className="flex justify-end pt-2"><button type="submit" disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{loading ? "Updating..." : "Update password"}</button></div></form>}
    </section>
  </main>;
};

export default ProfilePage;
