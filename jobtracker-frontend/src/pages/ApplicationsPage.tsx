import React, { useEffect, useMemo, useState } from "react";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  createApplication,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from "../services/applications";
import type { JobApplication, JobApplicationPayload } from "../services/applications";

const emptyPayload: JobApplicationPayload = {
  companyName: "",
  jobTitle: "",
  status: "APPLIED",
  jobUrl: "",
  location: "",
  source: "",
  appliedDate: null,
  notes: "",
};

type SortField =
  | "appliedDate"
  | "companyName"
  | "jobTitle"
  | "status"
  | "source"
  | "updatedAt";
type SortOrder = "asc" | "desc";

const statusBadgeClasses: Record<JobApplication["status"], string> = {
  SAVED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-sky-100 text-sky-800",
  OA: "bg-violet-100 text-violet-800",
  INTERVIEW: "bg-amber-100 text-amber-800",
  OFFER: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  WITHDRAWN: "bg-slate-200 text-slate-700",
};

const highlightStatuses: JobApplication["status"][] = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

function inferSourceFromUrl(jobUrl?: string): string {
  if (!jobUrl?.trim()) return "";

  try {
    const hostname = new URL(jobUrl).hostname.toLowerCase();

    if (hostname.includes("linkedin.com")) return "LinkedIn";
    if (hostname.includes("seek.com")) return "Seek";
    if (hostname.includes("indeed.com")) return "Indeed";
    if (hostname.includes("glassdoor.com")) return "Glassdoor";

    return "Company Website";
  } catch {
    return "";
  }
}


const ApplicationsPage: React.FC = () => {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobApplicationPayload>(emptyPayload);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | JobApplication["status"]>("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("appliedDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications();
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Loading applications failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sourceOptions = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => item.source?.trim())
          .filter((source): source is string => Boolean(source)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const byStatus = useMemo(() => {
    return items.reduce<Record<JobApplication["status"], number>>(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      {
        SAVED: 0,
        APPLIED: 0,
        OA: 0,
        INTERVIEW: 0,
        OFFER: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      },
    );
  }, [items]);

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items
      .filter((item) => {
        const matchesSearch =
          !query ||
          [
            item.companyName,
            item.jobTitle,
            item.location ?? "",
            item.source ?? "",
            item.notes ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        const matchesSource = sourceFilter === "ALL" || (item.source ?? "") === sourceFilter;

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((a, b) => {
        const toComparableValue = (item: JobApplication): number | string => {
          switch (sortField) {
            case "companyName":
              return item.companyName.toLowerCase();
            case "jobTitle":
              return item.jobTitle.toLowerCase();
            case "status":
              return item.status;
            case "source":
              return (item.source ?? "").toLowerCase();
            case "updatedAt":
              return new Date(item.updatedAt).getTime();
            case "appliedDate":
            default:
              return new Date(item.appliedDate || item.createdAt).getTime();
          }
        };

        const left = toComparableValue(a);
        const right = toComparableValue(b);

        if (left === right) {
          return 0;
        }

        return sortOrder === "asc" ? (left > right ? 1 : -1) : left < right ? 1 : -1;
      });
  }, [items, searchQuery, sortField, sortOrder, sourceFilter, statusFilter]);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyPayload);
    setEditingId(null);
  };

  const payload = {
    ...form,
    source: form.source?.trim() || inferSourceFromUrl(form.jobUrl),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {

      const payload = {
        ...form,
        source: form.source?.trim() || inferSourceFromUrl(form.jobUrl),
      };

      if (editingId == null) {
        const created = await createApplication(payload);
        setItems((prev) => [created, ...prev]);
      } else {
        const updated = await updateApplication(editingId, payload);
        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
      }

      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Application save failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (app: JobApplication) => {
    setEditingId(app.id);
    setForm({
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      jobUrl: app.jobUrl,
      location: app.location,
      source: app.source,
      status: app.status,
      appliedDate: app.appliedDate ?? null,
      notes: app.notes ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      await deleteApplication(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deletion failed");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSourceFilter("ALL");
    setSortField("appliedDate");
    setSortOrder("desc");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(135deg,_#ffffff_0%,_#f8fafc_55%,_#e2e8f0_100%)] p-6 shadow-sm">
        <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute left-1/3 top-20 h-32 w-32 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Applications
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Keep your pipeline current and easy to act on.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Capture new roles, update outcomes, and review your search with a
              cleaner operations view.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total records
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{items.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Visible after filters
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {visibleItems.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Interviews + offers
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {byStatus.INTERVIEW + byStatus.OFFER}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Current focus
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {statusFilter === "ALL"
                  ? "All statuses"
                  : APPLICATION_STATUS_LABELS[statusFilter]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Pipeline snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Check stage balance before diving into the list
            </h2>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
            Reset filters
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-[24px] border p-4 text-left transition ${statusFilter === "ALL"
              ? "border-slate-900 bg-slate-900 text-white shadow-lg"
              : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
              }`}>
            <p className={`text-[11px] uppercase tracking-[0.18em] ${statusFilter === "ALL" ? "text-slate-300" : "text-slate-500"}`}>
              All
            </p>
            <p className="mt-3 text-3xl font-semibold">{items.length}</p>
            <p className={`mt-6 text-sm ${statusFilter === "ALL" ? "text-slate-200" : "text-slate-600"}`}>
              Full application inventory
            </p>
          </button>

          {highlightStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-[24px] border p-4 text-left transition ${statusFilter === status
                ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                }`}>
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${statusFilter === status
                  ? "bg-white/10 text-white"
                  : statusBadgeClasses[status]
                  }`}>
                {APPLICATION_STATUS_LABELS[status]}
              </div>
              <p className="mt-4 text-3xl font-semibold">{byStatus[status]}</p>
              <p className={`mt-6 text-sm ${statusFilter === status ? "text-slate-200" : "text-slate-600"}`}>
                {status === "APPLIED" && "Fresh submissions waiting for a response"}
                {status === "INTERVIEW" && "Conversations that need close tracking"}
                {status === "OFFER" && "Strong outcomes ready for decision making"}
                {status === "REJECTED" && "Closed loops to review for patterns"}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Editor
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {editingItem ? "Update selected application" : "Add a new application"}
            </h2>
            <p className="text-sm text-slate-500">
              {editingItem
                ? `${editingItem.companyName} · ${editingItem.jobTitle}`
                : "Capture the essentials first, then add source, notes, and links as needed."}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-xs font-medium text-slate-700 mb-1">
                Job Title
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
            </div>
            <div>
              <label htmlFor="jobUrl" className="block text-xs font-medium text-slate-700 mb-1">
                Job URL
              </label>
              <input
                id="jobUrl"
                name="jobUrl"
                value={form.jobUrl || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label htmlFor="location" className="block text-xs font-medium text-slate-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                value={form.location || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label htmlFor="source" className="block text-xs font-medium text-slate-700 mb-1">
                Source
              </label>
              <input
                id="source"
                name="source"
                value={form.source || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="application-status" className="block text-xs font-medium text-slate-700 mb-1">
                Application Status
              </label>
              <select
                id="application-status"
                name="status"
                value={form.status || "APPLIED"}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {APPLICATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="appliedDate" className="block text-xs font-medium text-slate-700 mb-1">
                Applied Date
              </label>
              <input
                id="appliedDate"
                type="date"
                name="appliedDate"
                max={new Date().toISOString().slice(0, 10)}
                value={form.appliedDate || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-xs font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            </div>
            <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Application"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Browser
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Search, filter, and act quickly
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {loading
                  ? "Loading records..."
                  : `Showing ${visibleItems.length} of ${items.length} applications`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Refresh
            </button>
          </div>

          <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4 items-end">
            <div className="grid gap-3 md:grid-cols-5">
              <div className="md:col-span-2">
                <label htmlFor="search-applications" className="block text-xs font-medium text-slate-700 mb-2">
                  Search Applications
                </label>
                <input
                  id="search-applications"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Company, title, source, notes..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label htmlFor="status-filter" className="block text-xs font-medium text-slate-700 mb-2">
                  Status Filter
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "ALL" | JobApplication["status"])
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="ALL">All statuses</option>
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {APPLICATION_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="source-filter" className="block text-xs font-medium text-slate-700 mb-2">
                  Source Filter
                </label>
                <select
                  id="source-filter"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="ALL">All sources</option>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <label htmlFor="sort-field" className="block text-xs font-medium text-slate-700 mb-2">
                    Sort By
                  </label>
                  <select
                    id="sort-field"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                    <option value="appliedDate">Applied Date</option>
                    <option value="updatedAt">Last Updated</option>
                    <option value="companyName">Company</option>
                    <option value="jobTitle">Job Title</option>
                    <option value="status">Status</option>
                    <option value="source">Source</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`size-4 transition-transform ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`}>
                      <path fillRule="evenodd" d="M13.78 10.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l.97.97V5.75a.75.75 0 0 1 1.5 0v5.69l.97-.97a.75.75 0 0 1 1.06 0ZM2.22 5.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v5.69a.75.75 0 0 1-1.5 0V4.56l-.97.97a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
            {loading ? (
              <div className="px-5 py-8 text-sm text-slate-500">Loading...</div>
            ) : visibleItems.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500">
                No applications match the current filters.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Stage</th>
                    <th className="px-4 py-3 text-left">Applied</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((app, index) => (
                    <tr
                      key={app.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{app.companyName}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {app.location || "Location not set"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{app.jobTitle}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {app.source ? `via ${app.source}` : "Source not set"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${statusBadgeClasses[app.status]
                            }`}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(app)}
                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(app.id)}
                            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ApplicationsPage;
