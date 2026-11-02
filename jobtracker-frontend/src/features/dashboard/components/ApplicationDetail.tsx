import React, { useMemo, useState } from "react";
import type { ApplicationStatus, JobApplication } from "../../applications/api/applications";

interface ApplicationDetailProps {
  apps: JobApplication[];
  statusLabels: Record<ApplicationStatus, string>;
}

type SortField = "companyName" | "jobTitle" | "status" | "appliedDate";

const statusPillClasses: Record<ApplicationStatus, string> = {
  SAVED: "bg-surface-muted text-muted-foreground",
  APPLIED: "bg-surface-muted text-foreground",
  OA: "bg-surface-muted text-foreground",
  INTERVIEW: "bg-surface-muted text-foreground",
  OFFER: "bg-surface-muted text-foreground",
  REJECTED: "bg-surface-muted text-foreground",
  WITHDRAWN: "bg-surface-muted text-muted-foreground",
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
  const activePage = Math.min(currentPage, totalPages);

  const paginatedApps = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return sortedApps.slice(startIndex, startIndex + pageSize);
  }, [sortedApps, activePage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("desc");
  };

  const visibleRangeStart = sortedApps.length === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const visibleRangeEnd = Math.min(activePage * pageSize, sortedApps.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Explorer
          </p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Recent applications
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Review recent records, sort by the signal you care about, and inspect
            a selected role in detail.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Visible range</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {visibleRangeStart}-{visibleRangeEnd}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Total records</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{sortedApps.length}</p>
          </div>
        </div>
      </div>

      {sortedApps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted px-6 py-12 text-center text-sm text-muted-foreground">
          No recent application records yet.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
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
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground hover:bg-surface-muted"
                    }`}
                >
                  {label}
                  {sortField === field && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <label htmlFor="rows-per-page">Rows per page</label>
              <select
                id="rows-per-page"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-surface-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
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
                          className={`border-t border-border transition ${isActive
                              ? "bg-primary text-primary-foreground"
                              : index % 2 === 0
                                ? "bg-surface hover:bg-surface-muted"
                                : "bg-surface-muted/60 hover:bg-surface-muted"}`}>
                          <td className="px-4 py-4">
                            <div className="font-semibold">{app.companyName}</div>
                            {app.location && (
                              <div
                                className={`mt-1 text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                                  }`}
                              >
                                {app.location}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className={`font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`} >
                              {app.jobTitle}
                            </div>

                            {app.source && (
                              <div
                                className={`mt-1 text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                                  }`}
                              >
                                via {app.source}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${isActive
                                  ? "bg-primary-foreground/15 text-primary-foreground"
                                  : statusPillClasses[app.status]
                                }`}
                            >
                              {statusLabels[app.status]}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-4 text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"
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
                <div className="flex flex-col gap-3 border-t border-border bg-surface-muted px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {activePage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
                          className={`h-9 w-9 rounded-full border text-sm ${activePage === page
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-surface text-foreground hover:bg-surface-muted"
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Detail
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-foreground">
                    {selected ? "Selected application" : "No record selected"}
                  </h4>
                </div>
                {selected && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-surface-muted"
                  >
                    Close details
                  </button>
                )}
              </div>

              {!selected ? (
                <div className="mt-8 rounded-xl border border-dashed border-border bg-surface-muted px-5 py-10 text-center text-sm text-muted-foreground">
                  Select a role from the table to inspect its details.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl bg-primary px-5 py-5 text-primary-foreground">
                    <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                      {selected.companyName}
                    </p>
                    <h5 className="mt-2 text-2xl font-semibold">{selected.jobTitle}</h5>
                    <div className="mt-4 inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
                      {statusLabels[selected.status]}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                      <p className="text-xs text-muted-foreground">Applied Date</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selected.appliedDate
                          ? new Date(selected.appliedDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                      <p className="text-xs text-muted-foreground">Created Date</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {new Date(selected.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selected.location || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                      <p className="text-xs text-muted-foreground">Source</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selected.source || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                      <p className="text-xs text-muted-foreground">Current Stage</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {statusLabels[selected.status]}
                      </p>
                    </div>
                  </div>

                  {selected.jobUrl && (
                    <div className="rounded-lg border border-border bg-surface-muted px-4 py-4">
                      <p className="text-xs text-muted-foreground">Job Link</p>
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

                  <div className="rounded-lg border border-border bg-surface-muted px-4 py-4">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
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
