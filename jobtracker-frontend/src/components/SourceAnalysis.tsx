import React, { useMemo } from "react";
import type { JobApplication } from "../services/applications";

interface SourceAnalysisProps {
  apps: JobApplication[];
}

function getDomain(url?: string | null) {
  try {
    if (!url) {
      return "";
    }
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function normalizeSource(source?: string | null, jobUrl?: string | null) {
  if (source) {
    const normalizedSource = source.toLowerCase();

    if (normalizedSource.includes("linkedin")) return "LinkedIn";
    if (normalizedSource.includes("seek")) return "Seek";
    if (normalizedSource.includes("indeed")) return "Indeed";
    if (normalizedSource.includes("glassdoor")) return "Glassdoor";
  }

  const domain = getDomain(jobUrl);
  if (domain.includes("linkedin")) return "LinkedIn";
  if (domain.includes("seek")) return "Seek";
  if (domain.includes("indeed")) return "Indeed";
  if (domain.includes("glassdoor")) return "Glassdoor";
  if (domain) return "Company Site";

  return "Unknown";
}

const SourceAnalysis: React.FC<SourceAnalysisProps> = ({ apps }) => {
  const data = useMemo(() => {
    const grouped: Record<string, { total: number; interview: number }> = {};

    apps.forEach((app) => {
      const source = normalizeSource(app.source, app.jobUrl);

      if (!grouped[source]) {
        grouped[source] = { total: 0, interview: 0 };
      }

      grouped[source].total += 1;

      if (app.status === "INTERVIEW" || app.status === "OFFER") {
        grouped[source].interview += 1;
      }
    });

    return Object.entries(grouped)
      .map(([source, stats]) => ({
        source,
        total: stats.total,
        interview: stats.interview,
        rate: stats.total > 0 ? (stats.interview / stats.total) * 100 : 0,
      }))
      .sort((left, right) => right.rate - left.rate || right.total - left.total);
  }, [apps]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Sources
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Which channels are converting best
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="px-5 py-8 text-sm text-slate-500">No source data available yet.</div>
      ) : (
        <div className="px-5 py-5">
          <div className="grid gap-3 md:grid-cols-3">
            {data.slice(0, 3).map((row) => (
              <div key={row.source} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Top source</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{row.source}</p>
                <p className="mt-3 text-sm text-slate-600">
                  {row.interview} responses from {row.total} applications
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {row.rate.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Applications</th>
                  <th className="px-4 py-3 text-left">Responses</th>
                  <th className="px-4 py-3 text-left">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={row.source}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.source}</td>
                    <td className="px-4 py-3 text-slate-600">{row.total}</td>
                    <td className="px-4 py-3 text-slate-600">{row.interview}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-slate-900"
                            style={{ width: `${Math.min(row.rate, 100)}%` }} />
                        </div>
                        <span className="w-12 text-right font-medium text-slate-900">
                          {row.rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default SourceAnalysis;
