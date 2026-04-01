import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import ApplicationsPage from "./pages/ApplicationsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import { clearAuth, getEmail, getToken } from "./services/auth";
import { fetchNotifications, markNotificationAsRead, fetchUnreadCount, type NotificationItem } from "./services/notification";
import { useEffect, useRef, useState } from "react";

function ProtectedRoute() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return <ProtectedLayout />;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  if (getToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedLayout() {
  const navigate = useNavigate();
  const email = getEmail();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingReadIds, setMarkingReadIds] = useState<number[]>([]);
  const notificationsRef = useRef<HTMLDivElement | null>(null);


  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  async function loadUnreadCount() {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }

  async function loadNotifications() {
    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e: unknown) {
      setNotificationsError(
        e instanceof Error ? e.message : "Failed to load notifications",
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  // useEffect(() => {
  //   void loadUnreadCount();
  // }, []);

  useEffect(() => {
    void loadUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleToggleNotifications() {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      await Promise.all([loadNotifications(), loadUnreadCount()]);
    }

  }

  async function handleMarkNotificationRead(id: number) {
    try {
      setMarkingReadIds((prev) => [...prev, id]);

      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              read: true,
              readAt: new Date().toISOString(),
            }
            : item,
        ),
      );

      await loadUnreadCount();
    } catch (e: unknown) {
      setNotificationsError(
        e instanceof Error ? e.message : "Failed to mark notification as read",
      );
    } finally {
      setMarkingReadIds((prev) => prev.filter((i) => i !== id));
    }

  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notificationsRef.current) {
        return;
      }

      if (!notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);


  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                JT
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">JobTracker</p>
                <p className="text-xs text-slate-500">Application dashboard</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:ml-6">
              <NavLink to="/dashboard" className={navLinkClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/applications" className={navLinkClassName}>
                Applications
              </NavLink>
              <NavLink to="/profile" className={navLinkClassName}>
                Profile
              </NavLink>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Signed in
              </p>
              <p className="truncate text-sm font-medium text-slate-900">
                {email ?? "No email"}
              </p>
            </div>

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => void handleToggleNotifications()}
                className="relative inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:bg-slate-100">
                <span className="sr-only">Open notifications</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17H9.143m9.429 0H18a2 2 0 0 1-2-2v-3.586a1 1 0 0 0-.293-.707l-.414-.414A2 2 0 0 1 14.707 8.88V8a2.707 2.707 0 1 0-5.414 0v.88a2 2 0 0 1-.586 1.414l-.414.414A1 1 0 0 0 8 11.414V15a2 2 0 0 1-2 2h-.571m13.142 0H5.429" />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[360px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                      Notifications
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      Recent updates
                    </h3>
                  </div>

                  {notificationsLoading ? (
                    <p className="mt-4 text-sm text-slate-500">Loading notifications...</p>
                  ) : notificationsError ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {notificationsError}
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No notifications yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {notifications.map((item) => (
                        <article
                          key={item.id}
                          className={`rounded-[20px] border px-4 py-4 ${item.read
                            ? "border-slate-200 bg-slate-50"
                            : "border-sky-200 bg-sky-50/50"
                            }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {item.message}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${item.read
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-sky-100 text-sky-800"
                                  }`}>
                                {item.read ? "Read" : "Unread"}
                              </span>

                              {!item.read && (
                                <button
                                  type="button"
                                  onClick={() => void handleMarkNotificationRead(item.id)}
                                  disabled={markingReadIds.includes(item.id)}
                                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                >
                                  {markingReadIds.includes(item.id) ? "Updating..." : "Mark as read"}
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
              Logout
            </button>
          </div>


        </div>
      </nav >

      <Outlet />
    </div >
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={getToken() ? "/dashboard" : "/login"} replace />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>} />
      <Route
        path="/register"
        element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={getToken() ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
