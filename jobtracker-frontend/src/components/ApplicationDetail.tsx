import React, { useEffect, useMemo, useState } from "react";
import type { ApplicationStatus, JobApplication } from "../services/applications";

interface ApplicationDetailProps {
  apps: JobApplication[];
  statusLabels: Record<ApplicationStatus, string>;
}

type SortField = "companyName" | "jobTitle" | "status" | "appliedDate";

const statusPillClasses: Record<ApplicationStatus, string> = {
  SAVED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-sky-100 text-sky-800",
  OA: "bg-violet-100 text-violet-800",
  INTERVIEW: "bg-amber-100 text-amber-800",
  OFFER: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  WITHDRAWN: "bg-slate-200 text-slate-700",
};

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  apps,
  statusLabels,
}) => {
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [sortField, setSortField] = useState<SortField>("appliedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => {
      let left: string | number;
      let right: string | number;

      switch (sortField) {
        case "companyName":
          left = a.companyName.toLowerCase();
          right = b.companyName.toLowerCase();
          break;
        case "jobTitle":
          left = a.jobTitle.toLowerCase();
          right = b.jobTitle.toLowerCase();
          break;
        case "status":
          left = a.status;
          right = b.status;
          break;
        case "appliedDate":
        default:
          left = new Date(a.appliedDate || a.createdAt).getTime();
          right = new Date(b.appliedDate || b.createdAt).getTime();
          break;
      }

      if (left === right) {
        return 0;
      }

      return sortOrder === "asc" ? (left > right ? 1 : -1) : left < right ? 1 : -1;
    });
  }, [apps, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedApps.length / pageSize));

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedApps.slice(startIndex, startIndex + pageSize);
  }, [sortedApps, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
    setSelected(null);
  }, [apps, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("desc");
  };

  const visibleRangeStart = sortedApps.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const visibleRangeEnd = Math.min(currentPage * pageSize, sortedApps.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Explorer
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            Recent applications
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Review recent records, sort by the signal you care about, and inspect
            a selected role in detail.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Visible range</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {visibleRangeStart}-{visibleRangeEnd}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Total records</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{sortedApps.length}</p>
          </div>
        </div>
      </div>

      {sortedApps.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
          No recent application records yet.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["companyName", "Company"],
                ["jobTitle", "Role"],
                ["status", "Stage"],
                ["appliedDate", "Date"],
              ] as Array<[SortField, string]>).map(([field, label]) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => handleSort(field)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${sortField === field
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {label}
                  {sortField === field && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <label htmlFor="rows-per-page">Rows per page</label>
              <select
                id="rows-per-page"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Stage</th>
                      <th className="px-4 py-3 text-left">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApps.map((app, index) => {
                      const isActive = selected?.id === app.id;

                      return (
                        <tr
                          key={app.id} onClick={() => setSelected(app)}
                          className={`border-t border-slate-200 transition ${isActive
                              ? "bg-slate-900 text-white"
                              : index % 2 === 0
                                ? "bg-white hover:bg-slate-50"
                                : "bg-slate-50/60 hover:bg-slate-100/70"}`}>
                          <td className="px-4 py-4">
                            <div className="font-semibold">{app.companyName}</div>
                            {app.location && (
                              <div
                                className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"
                                  }`}
                              >
                                {app.location}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className={`font-medium ${isActive ? "text-white" : "text-slate-900"}`} >
                              {app.jobTitle}
                            </div>

                            {app.source && (
                              <div
                                className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"
                                  }`}
                              >
                                via {app.source}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${isActive
                                  ? "bg-white/15 text-white"
                                  : statusPillClasses[app.status]
                                }`}
                            >
                              {statusLabels[app.status]}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-4 text-xs ${isActive ? "text-slate-300" : "text-slate-500"
                              }`}
                          >
                            {app.appliedDate
                              ? new Date(app.appliedDate).toLocaleDateString()
                              : new Date(app.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 rounded-full border text-sm ${currentPage === page
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Detail
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-slate-900">
                    {selected ? "Selected application" : "No record selected"}
                  </h4>
                </div>
                {selected && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-white"
                  >
                    Close details
                  </button>
                )}
              </div>

              {!selected ? (
                <div className="mt-8 rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
                  Select a role from the table to inspect its details.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[22px] bg-slate-900 px-5 py-5 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      {selected.companyName}
                    </p>
                    <h5 className="mt-2 text-2xl font-semibold">{selected.jobTitle}</h5>
                    <div className="mt-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                      {statusLabels[selected.status]}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Applied Date</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {selected.appliedDate
                          ? new Date(selected.appliedDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Created Date</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Last Updated</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(selected.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {selected.location || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Source</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {selected.source || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Current Stage</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {statusLabels[selected.status]}
                      </p>
                    </div>
                  </div>

                  {selected.jobUrl && (
                    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs text-slate-500">Job Link</p>
                      <a
                        href={selected.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-sm font-medium text-sky-700 hover:underline"
                      >
                        {selected.jobUrl}
                      </a>
                    </div>
                  )}

                  <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selected.notes || "No notes added yet."}
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
};

export default ApplicationDetail;
