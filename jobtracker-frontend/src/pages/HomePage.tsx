import React, { useEffect, useMemo, useState } from "react";
import {
  APPLICATION_STATUS_LABELS,
  fetchApplications,
  type ApplicationStatus,
  type JobApplication,
} from "../services/applications";
import ApplicationDetail from "../components/ApplicationDetail";
import ApplicationTrend from "../components/ApplicationTrend";
import InsightsPanel from "../components/InsightsPanel";
import SourceAnalysis from "../components/SourceAnalysis";

const PIPELINE_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

const statusAccentStyles: Record<ApplicationStatus, string> = {
  SAVED: "from-slate-200 to-slate-100 border-slate-200 text-slate-700",
  APPLIED: "from-sky-500 to-cyan-400 border-sky-200 text-sky-950",
  OA: "from-violet-500 to-indigo-400 border-violet-200 text-violet-950",
  INTERVIEW: "from-amber-400 to-orange-300 border-amber-200 text-amber-950",
  OFFER: "from-emerald-500 to-lime-400 border-emerald-200 text-emerald-950",
  REJECTED: "from-rose-400 to-red-300 border-rose-200 text-rose-950",
  WITHDRAWN: "from-slate-400 to-slate-300 border-slate-200 text-slate-800",
};

const HomePage: React.FC = () => {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | null>(null);
  

  const byStatus = useMemo(() => {
    const base: Record<ApplicationStatus, number> = {
      SAVED: 0,
      APPLIED: 0,
      OA: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    return apps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    }, base);
  }, [apps]);

  const filteredApps = selectedStatus
    ? apps.filter((app) => app.status === selectedStatus)
    : apps;

  const summary = useMemo(() => {
    const recent7Days = apps.filter((app) => {
      const date = new Date(app.appliedDate || app.createdAt);
      return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;

    const activePipelineCount =
      byStatus.APPLIED + byStatus.OA + byStatus.INTERVIEW;
    const responseCount = byStatus.INTERVIEW + byStatus.OFFER;
    const conversionRate =
      apps.length > 0 ? Math.round((responseCount / apps.length) * 100) : 0;

    return {
      recent7Days,
      activePipelineCount,
      conversionRate,
    };
  }, [apps, byStatus]);

  const selectedLabel = selectedStatus
    ? APPLICATION_STATUS_LABELS[selectedStatus]
    : "All applications";

    async function loadApplications() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchApplications();
        setApps(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
  // async function loadFollowUps() {
  //   setFollowUpLoading(true);
  //   setFollowUpError(null);

  //   try {
  //     const data = await fetchDueFollowUps();
  //     setDueFollowUps(data);
  //   } catch (e: unknown) {
  //     setFollowUpError(e instanceof Error ? e.message : "An unknown error occurred");
  //   } finally {
  //     setFollowUpLoading(false);
  //   }
  // }

  useEffect(() => {
    const initData = async () => {
      await Promise.all([loadApplications()]);
    };

    void initData();
  }, []);

  
  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_52%,_#f8fafc_52%,_#ffffff_100%)] p-6 shadow-sm">
        <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute left-1/3 top-20 h-32 w-32 rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Keep your search pipeline readable, measurable, and actionable.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Filter by stage, monitor response momentum, and jump straight into
                the applications that need attention.
              </p>
            </div>
          </div>

          <div className="self-end rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Focus View
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {selectedLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedStatus
                ? `You are currently reviewing applications in the ${selectedLabel.toLowerCase()} stage.`
                : "You are looking at the full pipeline across every stage."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500">Visible records</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {filteredApps.length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500">Last 7 days</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {summary.recent7Days}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Pipeline Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Track stage health at a glance
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStatus(null)}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
            Clear filter
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading dashboard...</p>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <button
              type="button"
              onClick={() => setSelectedStatus(null)}
              className={`group overflow-hidden rounded-[24px] border p-4 text-left transition ${selectedStatus === null
                ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                }`}>
              <p
                className={`text-[11px] uppercase tracking-[0.18em] ${selectedStatus === null ? "text-slate-300" : "text-slate-500"
                  }`}>
                All
              </p>
              <p className="mt-3 text-3xl font-semibold">{apps.length}</p>
              <p
                className={`mt-6 text-sm ${selectedStatus === null ? "text-slate-200" : "text-slate-600"
                  }`}>
                Full application inventory
              </p>
            </button>

            {PIPELINE_STATUSES.map((status) => {
              const isActive = selectedStatus === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(isActive ? null : status)}
                  className={`group overflow-hidden rounded-[24px] border p-4 text-left transition ${isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm"}`}>
                  <div
                    className={`inline-flex rounded-full border bg-gradient-to-r px-3 py-1 text-[11px] font-medium ${isActive
                      ? "border-white/10 from-white/20 to-white/10 text-white"
                      : statusAccentStyles[status]}`}>
                    {APPLICATION_STATUS_LABELS[status]}
                  </div>
                  <p className="mt-4 text-3xl font-semibold">{byStatus[status]}</p>
                  <p
                    className={`mt-6 text-sm ${isActive ? "text-slate-200" : "text-slate-600"}`}>
                    {status === "APPLIED" && "Fresh submissions waiting for first response"}
                    {status === "INTERVIEW" && "Live conversations that need close tracking"}
                    {status === "OFFER" && "Positive outcomes ready for decision making"}
                    {status === "REJECTED" && "Closed loops for pattern review"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {!loading && !error && (
        <>
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Recent Activity
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Browse the most relevant records first
                  </h2>
                </div>
              </div>
            </div>

            <ApplicationDetail
              key={selectedStatus ?? "all"}
              apps={filteredApps}
              statusLabels={APPLICATION_STATUS_LABELS} />

          </section >

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="space-y-6">
              <section>
                <ApplicationTrend apps={filteredApps} />
              </section>

              <section>
                <SourceAnalysis apps={filteredApps} />
              </section>
            </div>

            <section className="self-start">
              <InsightsPanel apps={filteredApps} />
            </section>
          </div>
        </>
      )}
    </main >
  );
};

export default HomePage;
