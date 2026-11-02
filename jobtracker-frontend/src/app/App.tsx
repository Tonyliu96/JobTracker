import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { Toaster } from "sonner";
import ApplicationsPage from "../features/applications/pages/ApplicationsPage";
import HomePage from "../features/dashboard/pages/HomePage";
import LoginPage from "../features/auth/pages/LoginPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import { clearAuth, getEmail, getToken } from "../features/auth/api/auth";
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead, type NotificationItem } from "../features/notifications/api/notification";

function ProtectedRoute() { return getToken() ? <ProtectedLayout /> : <Navigate to="/login" replace />; }
function PublicOnlyRoute({ children }: { children: JSX.Element }) { return getToken() ? <Navigate to="/dashboard" replace /> : children; }

function ProtectedLayout() {
  const navigate = useNavigate();
  const email = getEmail();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingReadIds, setMarkingReadIds] = useState<number[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("jobtracker_theme") === "dark");
  const [accountOpen, setAccountOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const emailInitial = (email?.trim().charAt(0) || "U").toUpperCase();

  const handleLogout = () => { clearAuth(); navigate("/login", { replace: true }); };
  async function loadUnreadCount() { try { setUnreadCount(await fetchUnreadCount()); } catch { setUnreadCount(0); } }
  async function loadNotifications() {
    setNotificationsLoading(true); setNotificationsError(null);
    try { setNotifications(await fetchNotifications()); }
    catch (error: unknown) { setNotificationsError(error instanceof Error ? error.message : "Failed to load notifications"); }
    finally { setNotificationsLoading(false); }
  }

  useEffect(() => { document.documentElement.classList.toggle("dark", darkMode); localStorage.setItem("jobtracker_theme", darkMode ? "dark" : "light"); }, [darkMode]);
  useEffect(() => {
    void loadUnreadCount();
    const intervalId = window.setInterval(() => void loadUnreadCount(), 30000);
    return () => window.clearInterval(intervalId);
  }, []);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setNotificationsOpen(false); setAccountOpen(false); } };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationRef.current?.contains(target)) setNotificationsOpen(false);
      if (!accountRef.current?.contains(target)) setAccountOpen(false);
    };
    document.addEventListener("keydown", handleEscape); document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("keydown", handleEscape); document.removeEventListener("mousedown", handleClickOutside); };
  }, []);
  async function handleToggleNotifications() {
    const nextOpen = !notificationsOpen; setNotificationsOpen(nextOpen); setAccountOpen(false);
    if (nextOpen) await Promise.all([loadNotifications(), loadUnreadCount()]);
  }
  async function handleMarkNotificationRead(id: number) {
    try {
      setMarkingReadIds((previous) => [...previous, id]); await markNotificationAsRead(id);
      setNotifications((previous) => previous.map((item) => item.id === id ? { ...item, read: true, readAt: new Date().toISOString() } : item));
      await loadUnreadCount();
    } catch (error: unknown) { setNotificationsError(error instanceof Error ? error.message : "Failed to mark notification as read"); }
    finally { setMarkingReadIds((previous) => previous.filter((item) => item !== id)); }
  }
  const navLinkClassName = ({ isActive }: { isActive: boolean }) => `inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"}`;

  return <div className="min-h-screen bg-background text-foreground">
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <NavLink to="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">JT</span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">JobTracker</span><span className="block truncate text-xs text-muted-foreground">Application dashboard</span></span>
          </NavLink>
          <div className="flex flex-wrap items-center gap-1"><NavLink to="/dashboard" className={navLinkClassName}>Dashboard</NavLink><NavLink to="/applications" className={navLinkClassName}>Applications</NavLink><NavLink to="/profile" className={navLinkClassName}>Profile</NavLink></div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className="relative" ref={notificationRef}>
            <button type="button" aria-label="Open notifications" onClick={() => void handleToggleNotifications()} className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted"><Bell className="h-4 w-4" aria-hidden="true" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>
            {notificationsOpen && <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 text-foreground shadow-xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Notifications</p><h3 className="mt-1 text-lg font-semibold">Recent updates</h3>{notificationsLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading notifications...</p> : notificationsError ? <p className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{notificationsError}</p> : notifications.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No notifications yet.</p> : <div className="mt-4 space-y-2">{notifications.map((item) => <article key={item.id} className={`rounded-lg border px-3 py-3 ${item.read ? "border-border bg-surface-muted" : "border-primary/40 bg-primary/10"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{item.message}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.read && <button type="button" onClick={() => void handleMarkNotificationRead(item.id)} disabled={markingReadIds.includes(item.id)} className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-surface disabled:opacity-60">{markingReadIds.includes(item.id) ? "..." : "Read"}</button>}</div></article>)}</div>}</div>}
          </div>
          <button type="button" aria-label={darkMode ? "Use light mode" : "Use dark mode"} onClick={() => setDarkMode((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted">{darkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}</button>
          <div className="relative" ref={accountRef}><button type="button" aria-label="Open account menu" aria-expanded={accountOpen} onClick={() => { setAccountOpen((value) => !value); setNotificationsOpen(false); }} className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-2 text-foreground transition hover:bg-surface-muted"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{emailInitial}</span><ChevronDown className={`h-4 w-4 transition-transform ${accountOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button>{accountOpen && <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl"><p className="truncate px-3 py-2 text-sm text-muted-foreground">{email ?? "No email"}</p><button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted"><LogOut className="h-4 w-4" aria-hidden="true" />Logout</button></div>}</div>
        </div>
      </div>
    </nav>
    <Outlet />
  </div>;
}

function App() { return <><Toaster position="top-right" richColors /><Routes><Route path="/" element={<Navigate to={getToken() ? "/dashboard" : "/login"} replace />} /><Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} /><Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<HomePage />} /><Route path="/applications" element={<ApplicationsPage />} /><Route path="/profile" element={<ProfilePage />} /></Route><Route path="*" element={<Navigate to={getToken() ? "/dashboard" : "/login"} replace />} /></Routes></>; }
export default App;
