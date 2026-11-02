import React, { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronDown, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES, createApplication, deleteApplication, fetchApplications, markFollowUpDone, updateApplication } from "../api/applications";
import type { JobApplication, JobApplicationPayload } from "../api/applications";

const emptyPayload: JobApplicationPayload = { companyName: "", jobTitle: "", status: "APPLIED", jobUrl: "", location: "", source: "", appliedDate: null, followUpDate: null, reminderEnabled: true, remindedAt: null, notes: "" };
type SortField = "appliedDate" | "companyName" | "jobTitle" | "status" | "source" | "updatedAt";
type SortOrder = "asc" | "desc";

const statusBadgeClasses: Record<JobApplication["status"], string> = {
  SAVED: "bg-surface-muted text-muted-foreground", APPLIED: "bg-sky-500/15 text-sky-700 dark:text-sky-200", OA: "bg-violet-500/15 text-violet-700 dark:text-violet-200", INTERVIEW: "bg-amber-500/15 text-amber-700 dark:text-amber-200", OFFER: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200", REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-200", WITHDRAWN: "bg-surface-muted text-muted-foreground",
};
const highlightStatuses: JobApplication["status"][] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const inputClass = "w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground";

function BoardCard({ app }: { app: JobApplication }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(app.id), data: { applicationId: app.id } });
  return <article ref={setNodeRef} {...listeners} {...attributes} style={{ transform: CSS.Translate.toString(transform) }} className={`cursor-grab rounded-lg border border-border bg-surface p-4 shadow-sm active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}><p className="font-semibold text-foreground">{app.companyName}</p><p className="mt-1 text-sm text-muted-foreground">{app.jobTitle}</p><p className="mt-3 text-xs text-muted-foreground">{app.source || "Source not set"}</p></article>;
}
function ApplicationBoard({ items, onStatusChange }: { items: JobApplication[]; onStatusChange: (id: number, status: JobApplication["status"]) => void }) {
  const handleDragEnd = ({ active, over }: DragEndEvent) => { if (!over) return; const nextStatus = over.id as JobApplication["status"]; if (APPLICATION_STATUSES.includes(nextStatus)) onStatusChange(Number(active.id), nextStatus); };
  return <DndContext onDragEnd={handleDragEnd}><div className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-4">{APPLICATION_STATUSES.map((status) => <BoardColumn key={status} status={status} items={items.filter((item) => item.status === status)} />)}</div></DndContext>;
}
function BoardColumn({ status, items }: { status: JobApplication["status"]; items: JobApplication[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`min-w-[220px] rounded-lg p-3 ${isOver ? "bg-primary/10" : "bg-surface-muted"}`}><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">{APPLICATION_STATUS_LABELS[status]}</h3><span className="text-xs text-muted-foreground">{items.length}</span></div><div className="space-y-3">{items.map((item) => <BoardCard key={item.id} app={item} />)}</div></section>;
}
function inferSourceFromUrl(jobUrl?: string): string {
  if (!jobUrl?.trim()) return "";
  try { const hostname = new URL(jobUrl).hostname.toLowerCase(); if (hostname.includes("linkedin.com")) return "LinkedIn"; if (hostname.includes("seek.com")) return "Seek"; if (hostname.includes("indeed.com")) return "Indeed"; if (hostname.includes("glassdoor.com")) return "Glassdoor"; return "Company Website"; } catch { return ""; }
}

function TooltipButton({
  label,
  ariaLabel,
  onClick,
  children,
  disabled = false,
  loading = false,
  tone = "default",
}: {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  tone?: "default" | "delete";
}) {
  return <button type="button" title={label} aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground transition hover:bg-surface-muted disabled:cursor-wait disabled:opacity-60 ${tone === "delete" ? "hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300" : "hover:text-primary"}`}>
    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : children}
    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">{label}</span>
  </button>;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return isMobile;
}

const ApplicationsPage: React.FC = () => {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobApplicationPayload>({ ...emptyPayload });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | JobApplication["status"]>("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("appliedDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [markingFollowUpId, setMarkingFollowUpId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();

  const load = async () => { setLoading(true); setError(null); try { setItems(await fetchApplications()); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Loading applications failed"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!drawerOpen) return;
    firstFieldRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setDrawerOpen(false); setEditingId(null); } };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const sourceOptions = useMemo(() => Array.from(new Set(items.map((item) => item.source?.trim()).filter((source): source is string => Boolean(source)))).sort((a, b) => a.localeCompare(b)), [items]);
  const byStatus = useMemo(() => items.reduce<Record<JobApplication["status"], number>>((acc, item) => { acc[item.status] = (acc[item.status] ?? 0) + 1; return acc; }, { SAVED: 0, APPLIED: 0, OA: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0, WITHDRAWN: 0 }), [items]);
  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => { const matchesSearch = !query || [item.companyName, item.jobTitle, item.location ?? "", item.source ?? "", item.notes ?? ""].join(" ").toLowerCase().includes(query); const matchesStatus = statusFilter === "ALL" || item.status === statusFilter; const matchesSource = sourceFilter === "ALL" || (item.source ?? "") === sourceFilter; return matchesSearch && matchesStatus && matchesSource; }).sort((a, b) => {
      const value = (item: JobApplication): number | string => { switch (sortField) { case "companyName": return item.companyName.toLowerCase(); case "jobTitle": return item.jobTitle.toLowerCase(); case "status": return item.status; case "source": return (item.source ?? "").toLowerCase(); case "updatedAt": return new Date(item.updatedAt).getTime(); default: return new Date(item.appliedDate || item.createdAt).getTime(); } };
      const left = value(a); const right = value(b); return left === right ? 0 : sortOrder === "asc" ? (left > right ? 1 : -1) : (left < right ? 1 : -1);
    });
  }, [items, searchQuery, sortField, sortOrder, sourceFilter, statusFilter]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value } = event.target; const nextValue = event.target instanceof HTMLInputElement && event.target.type === "checkbox" ? event.target.checked : value; setForm((previous) => ({ ...previous, [name]: nextValue })); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); setForm({ ...emptyPayload }); };
  const openCreate = () => { setEditingId(null); setForm({ ...emptyPayload }); setError(null); setDrawerOpen(true); };
  const startEdit = (app: JobApplication) => { setEditingId(app.id); setForm({ companyName: app.companyName, jobTitle: app.jobTitle, jobUrl: app.jobUrl, location: app.location, source: app.source, status: app.status, appliedDate: app.appliedDate ?? null, followUpDate: app.followUpDate ?? null, reminderEnabled: app.reminderEnabled ?? true, remindedAt: app.remindedAt ?? null, notes: app.notes ?? "" }); setError(null); setDrawerOpen(true); };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null);
    try { const payload = { ...form, source: form.source?.trim() || inferSourceFromUrl(form.jobUrl), followUpDate: form.reminderEnabled ? form.followUpDate ?? null : null }; if (editingId == null) { const created = await createApplication(payload); setItems((previous) => [created, ...previous]); } else { const updated = await updateApplication(editingId, payload); setItems((previous) => previous.map((item) => item.id === editingId ? updated : item)); } closeDrawer(); toast.success(editingId == null ? "Application added" : "Application updated"); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Application save failed"); } finally { setSaving(false); }
  };
  const handleDelete = async (id: number) => { if (!window.confirm("Delete this application?")) return; try { await deleteApplication(id); setItems((previous) => previous.filter((item) => item.id !== id)); toast.success("Application deleted"); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Deletion failed"); } };
  const handleMarkFollowUpDone = async (id: number) => { setMarkingFollowUpId(id); setError(null); try { const updated = await markFollowUpDone(id); setItems((previous) => previous.map((item) => item.id === id ? updated : item)); toast.success("Marked as followed up"); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to mark follow-up done"); } finally { setMarkingFollowUpId(null); } };
  const handleBoardStatusChange = async (id: number, status: JobApplication["status"]) => { const current = items.find((item) => item.id === id); if (!current || current.status === status) return; try { const updated = await updateApplication(id, { status }); setItems((previous) => previous.map((item) => item.id === id ? updated : item)); toast.success("Application status updated"); } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to update status"); } };
  const clearFilters = () => { setSearchQuery(""); setStatusFilter("ALL"); setSourceFilter("ALL"); setSortField("appliedDate"); setSortOrder("desc"); };
  const getReminderStatus = (app: JobApplication) => { if (app.reminderEnabled === false) return "Off"; if (app.remindedAt) return "Completed"; if (!app.followUpDate) return "Scheduled"; const today = new Date().toISOString().slice(0, 10); if (app.followUpDate < today) return "Overdue"; if (app.followUpDate === today) return "Due today"; return "Scheduled"; };
  const reminderStyles: Record<string, string> = { Off: "text-muted-foreground", Completed: "text-emerald-700 dark:text-emerald-300", Overdue: "text-rose-700 dark:text-rose-300", "Due today": "text-amber-700 dark:text-amber-300", Scheduled: "text-sky-700 dark:text-sky-300" };
  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString() : "Not set";

  return <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-foreground">Applications</h1><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading applications..." : `${items.length} applications`}</p></div><button type="button" onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"><Plus className="h-4 w-4" aria-hidden="true" />Add application</button></header>

    <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <button type="button" onClick={() => setStatusFilter("ALL")} className={`rounded-lg border px-3 py-2 text-left transition ${statusFilter === "ALL" ? "border-primary bg-primary/10" : "border-border bg-surface hover:bg-surface-muted"}`}><span className="block text-lg font-semibold text-foreground">{items.length}</span><span className="text-xs text-muted-foreground">All</span></button>
      {highlightStatuses.map((status) => <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-lg border px-3 py-2 text-left transition ${statusFilter === status ? "border-primary bg-primary/10" : "border-border bg-surface hover:bg-surface-muted"}`}><span className="block text-lg font-semibold text-foreground">{byStatus[status]}</span><span className="text-xs text-muted-foreground">{APPLICATION_STATUS_LABELS[status]}</span></button>)}
    </section>

    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1"><label htmlFor="search-applications" className={labelClass}>Search</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input aria-label="Search Applications" id="search-applications" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Company, title, source..." className={`${inputClass} pl-9`} /></div></div>
        <div className="w-full sm:w-auto"><label htmlFor="status-filter" className={labelClass}>Status</label><select aria-label="Status Filter" id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | JobApplication["status"])} className={inputClass}><option value="ALL">All statuses</option>{APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{APPLICATION_STATUS_LABELS[status]}</option>)}</select></div>
        <div className="w-full sm:w-auto"><label htmlFor="source-filter" className={labelClass}>Source</label><select aria-label="Source Filter" id="source-filter" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className={inputClass}><option value="ALL">All sources</option>{sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}</select></div>
        <div className="w-full sm:w-auto"><label htmlFor="sort-field" className={labelClass}>Sort</label><div className="flex gap-2"><select aria-label="Sort By" id="sort-field" value={sortField} onChange={(event) => setSortField(event.target.value as SortField)} className={inputClass}><option value="appliedDate">Applied date</option><option value="updatedAt">Last updated</option><option value="companyName">Company</option><option value="jobTitle">Job title</option><option value="status">Status</option><option value="source">Source</option></select><button type="button" aria-label={sortOrder === "asc" ? "Asc" : "Desc"} onClick={() => setSortOrder((previous) => previous === "asc" ? "desc" : "asc")} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-muted"><ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} aria-hidden="true" /></button></div></div>
        <div className="ml-auto flex items-center gap-2"><div className="flex rounded-md border border-border p-0.5"><button type="button" onClick={() => setViewMode("table")} className={`rounded px-3 py-1.5 text-xs font-medium ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Table</button><button type="button" onClick={() => setViewMode("board")} className={`rounded px-3 py-1.5 text-xs font-medium ${viewMode === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Board</button></div><button type="button" aria-label="Refresh applications" onClick={() => void load()} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-muted"><RefreshCw className="h-4 w-4" aria-hidden="true" /></button></div>
      </div>
      {(searchQuery || statusFilter !== "ALL" || sourceFilter !== "ALL") && <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>Showing {visibleItems.length} of {items.length}</span><button type="button" onClick={clearFilters} className="font-medium text-primary hover:underline">Clear filters</button></div>}
    </section>

    {error && <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
    {viewMode === "board" ? <ApplicationBoard items={visibleItems} onStatusChange={handleBoardStatusChange} /> : <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {!isMobile && <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup><col className="w-[20%]" /><col className="w-[24%]" /><col className="w-[10%]" /><col className="hidden w-[11%] lg:table-column" /><col className="w-[11%]" /><col className="w-[12%]" /><col className="w-[12%]" /></colgroup>
          <thead><tr className="border-b border-border bg-surface-muted text-left text-xs uppercase tracking-[0.12em] text-muted-foreground"><th className="px-3 py-3">Company</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Stage</th><th className="hidden px-3 py-3 lg:table-cell">Applied</th><th className="px-3 py-3">Follow-up</th><th className="px-3 py-3">Reminder</th><th className="px-3 py-3 text-right">Actions</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading applications...</td></tr> : visibleItems.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No applications match the current filters.</td></tr> : visibleItems.map((app) => { const reminderStatus = getReminderStatus(app); const canFollowUp = reminderStatus === "Due today" || reminderStatus === "Overdue"; return <tr key={app.id} className="border-t border-border transition hover:bg-surface-muted/70"><td className="max-w-0 px-3 py-3"><div title={app.companyName} className="line-clamp-2 break-words font-semibold text-foreground">{app.companyName}</div><div className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">{app.location || "Location not set"}</div></td><td className="max-w-0 px-3 py-3"><div title={app.jobTitle} className="line-clamp-2 break-words font-medium text-foreground">{app.jobTitle}</div><div className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">{app.source ? `via ${app.source}` : "Source not set"}</div></td><td className="whitespace-nowrap px-3 py-3"><span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${statusBadgeClasses[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span></td><td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground lg:table-cell">{formatDate(app.appliedDate || app.createdAt)}</td><td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatDate(app.followUpDate)}</td><td className="whitespace-nowrap px-3 py-3"><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${reminderStyles[reminderStatus]}`}><span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />{reminderStatus}</span></td><td className="px-3 py-3 text-right"><div className="inline-flex items-center justify-end gap-1">{canFollowUp && <TooltipButton label="Mark followed up" ariaLabel={`Mark ${app.companyName} as followed up`} onClick={() => void handleMarkFollowUpDone(app.id)} disabled={markingFollowUpId === app.id} loading={markingFollowUpId === app.id}><Check className="h-4 w-4" aria-hidden="true" /></TooltipButton>}<TooltipButton label="Edit application" ariaLabel={`Edit ${app.companyName}`} onClick={() => startEdit(app)}><Pencil className="h-4 w-4" aria-hidden="true" /></TooltipButton><TooltipButton label="Delete application" ariaLabel={`Delete ${app.companyName}`} onClick={() => void handleDelete(app.id)} tone="delete"><Trash2 className="h-4 w-4" aria-hidden="true" /></TooltipButton></div></td></tr>; })}</tbody>
        </table>
      </div>}
      {isMobile && <div className="divide-y divide-border">{loading ? <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading applications...</p> : visibleItems.length === 0 ? <p className="px-4 py-10 text-center text-sm text-muted-foreground">No applications match the current filters.</p> : visibleItems.map((app) => { const reminderStatus = getReminderStatus(app); const canFollowUp = reminderStatus === "Due today" || reminderStatus === "Overdue"; return <article key={app.id} className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 title={app.companyName} className="line-clamp-2 break-words font-semibold text-foreground">{app.companyName}</h3><p title={app.jobTitle} className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{app.jobTitle}</p></div><span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${statusBadgeClasses[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span></div><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-muted-foreground">Follow-up</dt><dd className="mt-1 text-foreground">{formatDate(app.followUpDate)}</dd></div><div><dt className="text-xs text-muted-foreground">Reminder</dt><dd className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${reminderStyles[reminderStatus]}`}><span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />{reminderStatus}</dd></div></dl><div className="flex justify-end gap-1 border-t border-border pt-3">{canFollowUp && <TooltipButton label="Mark followed up" ariaLabel={`Mark ${app.companyName} as followed up`} onClick={() => void handleMarkFollowUpDone(app.id)} disabled={markingFollowUpId === app.id} loading={markingFollowUpId === app.id}><Check className="h-4 w-4" aria-hidden="true" /></TooltipButton>}<TooltipButton label="Edit application" ariaLabel={`Edit ${app.companyName}`} onClick={() => startEdit(app)}><Pencil className="h-4 w-4" aria-hidden="true" /></TooltipButton><TooltipButton label="Delete application" ariaLabel={`Delete ${app.companyName}`} onClick={() => void handleDelete(app.id)} tone="delete"><Trash2 className="h-4 w-4" aria-hidden="true" /></TooltipButton></div></article>; })}</div>}
    </section>}

    {drawerOpen && <div className="fixed inset-0 z-50"><button type="button" aria-label="Close application editor" onClick={closeDrawer} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" /><aside role="dialog" aria-modal="true" aria-labelledby="application-editor-title" className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl"><div className="flex items-start justify-between border-b border-border px-5 py-4"><div><h2 id="application-editor-title" className="text-xl font-semibold text-foreground">{editingId == null ? "New application" : "Edit application"}</h2><p className="mt-1 text-sm text-muted-foreground">Keep the application details up to date.</p></div><button type="button" aria-label="Close editor" onClick={closeDrawer} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"><X className="h-5 w-5" aria-hidden="true" /></button></div><form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 overflow-y-auto px-5 py-5"><fieldset><legend className="text-sm font-semibold text-foreground">Basic information</legend><div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="companyName" className={labelClass}>Company</label><input ref={firstFieldRef} id="companyName" name="companyName" value={form.companyName} onChange={handleChange} required className={inputClass} /></div><div><label htmlFor="jobTitle" className={labelClass}>Job title</label><input id="jobTitle" name="jobTitle" value={form.jobTitle} onChange={handleChange} required className={inputClass} /></div><div><label htmlFor="jobUrl" className={labelClass}>Job URL</label><input id="jobUrl" name="jobUrl" value={form.jobUrl || ""} onChange={handleChange} className={inputClass} /></div><div><label htmlFor="location" className={labelClass}>Location</label><input id="location" name="location" value={form.location || ""} onChange={handleChange} className={inputClass} /></div></div></fieldset><fieldset className="mt-6"><legend className="text-sm font-semibold text-foreground">Status</legend><div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="source" className={labelClass}>Source</label><input id="source" name="source" value={form.source || ""} onChange={handleChange} list="application-source-options" className={inputClass} /><datalist id="application-source-options">{["LinkedIn", "Seek", "Indeed", "Company site", "Referral", ...sourceOptions].filter((source, index, options) => options.indexOf(source) === index).map((source) => <option key={source} value={source} />)}</datalist></div><div><label htmlFor="application-status" className={labelClass}>Status</label><select id="application-status" name="status" value={form.status || "APPLIED"} onChange={handleChange} className={inputClass}>{APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{APPLICATION_STATUS_LABELS[status]}</option>)}</select></div><div><label htmlFor="appliedDate" className={labelClass}>Applied date</label><input id="appliedDate" type="date" name="appliedDate" max={new Date().toISOString().slice(0, 10)} value={form.appliedDate || ""} onChange={handleChange} className={inputClass} /></div><div><label htmlFor="followUpDate" className={labelClass}>Follow-up date</label><input id="followUpDate" type="date" name="followUpDate" value={form.followUpDate || ""} onChange={handleChange} disabled={form.reminderEnabled === false} className={inputClass} /></div><label className="sm:col-span-2 flex items-start justify-between gap-4 rounded-lg border border-border bg-surface-muted px-3 py-3"><span><span className="block text-sm font-medium text-foreground">Follow-up reminder</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Remind you when this application needs attention.</span></span><input id="reminderEnabled" name="reminderEnabled" type="checkbox" checked={form.reminderEnabled ?? true} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary" /></label></div></fieldset><fieldset className="mt-6"><legend className="text-sm font-semibold text-foreground">Notes</legend><textarea id="notes" name="notes" value={form.notes || ""} onChange={handleChange} rows={5} className={`${inputClass} mt-3 resize-y`} /></fieldset>{error && <p className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}</div><div className="flex shrink-0 justify-end gap-2 border-t border-border bg-surface px-5 py-4"><button type="button" onClick={closeDrawer} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-muted">Cancel</button><button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{saving ? "Saving..." : "Save"}</button></div></form></aside></div>}
  </main>;
};

export default ApplicationsPage;
