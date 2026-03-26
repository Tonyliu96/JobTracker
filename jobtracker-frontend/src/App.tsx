import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import ApplicationsPage from "./pages/ApplicationsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import { clearAuth, getEmail, getToken } from "./services/auth";

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

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

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
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
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
