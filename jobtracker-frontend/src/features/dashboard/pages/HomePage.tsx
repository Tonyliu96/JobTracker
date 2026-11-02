import React, { useEffect, useMemo, useState } from "react";
import {
  APPLICATION_STATUS_LABELS,
  fetchApplications,
  type ApplicationStatus,
  type JobApplication,
} from "../../applications/api/applications";
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
  SAVED: "border-border bg-surface-muted text-muted-foreground",
  APPLIED: "border-border bg-surface-muted text-foreground",
  OA: "border-border bg-surface-muted text-foreground",
  INTERVIEW: "border-border bg-surface-muted text-foreground",
  OFFER: "border-border bg-surface-muted text-foreground",
  REJECTED: "border-border bg-surface-muted text-foreground",
  WITHDRAWN: "border-border bg-surface-muted text-muted-foreground",
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
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-sm">

        <div className="relative grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Keep your search pipeline readable, measurable, and actionable.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Filter by stage, monitor response momentum, and jump straight into
                the applications that need attention.
              </p>
            </div>
          </div>

          <div className="self-end rounded-xl border border-border bg-surface p-5 shadow-lg">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Focus View
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {selectedLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {selectedStatus
                ? `You are currently reviewing applications in the ${selectedLabel.toLowerCase()} stage.`
                : "You are looking at the full pipeline across every stage."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-muted px-4 py-3">
                <p className="text-xs text-muted-foreground">Visible records</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {filteredApps.length}
                </p>
              </div>
              <div className="rounded-lg bg-surface-muted px-4 py-3">
                <p className="text-xs text-muted-foreground">Last 7 days</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.recent7Days}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Pipeline Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Track stage health at a glance
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStatus(null)}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-surface-muted">
            Clear filter
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading dashboard...</p>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <button
              type="button"
              onClick={() => setSelectedStatus(null)}
              className={`group overflow-hidden rounded-[24px] border p-4 text-left transition ${selectedStatus === null
                ? "border-primary bg-primary text-primary-foreground shadow-lg"
                : "border-border bg-surface-muted hover:-translate-y-0.5 hover:bg-surface hover:shadow-sm"
                }`}>
              <p
                className={`text-[11px] uppercase tracking-[0.18em] ${selectedStatus === null ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                All
              </p>
              <p className="mt-3 text-3xl font-semibold">{apps.length}</p>
              <p
                className={`mt-6 text-sm ${selectedStatus === null ? "text-primary-foreground/80" : "text-muted-foreground"
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
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border bg-surface hover:-translate-y-0.5 hover:shadow-sm"}`}>
                  <div
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${isActive
                      ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                      : statusAccentStyles[status]}`}>
                    {APPLICATION_STATUS_LABELS[status]}
                  </div>
                  <p className="mt-4 text-3xl font-semibold">{byStatus[status]}</p>
                  <p
                    className={`mt-6 text-sm ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
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
          <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Recent Activity
                  </p>
                  <h2 className="text-xl font-semibold text-foreground">
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
