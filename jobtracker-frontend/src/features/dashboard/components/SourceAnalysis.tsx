import React, { useMemo } from "react";
import type { JobApplication } from "../../applications/api/applications";

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
  if (source?.trim()) {
    const normalizedSource = source.trim().toLowerCase();

    if (normalizedSource.includes("linkedin")) return "LinkedIn";
    if (normalizedSource.includes("seek")) return "Seek";
    if (normalizedSource.includes("indeed")) return "Indeed";
    if (normalizedSource.includes("glassdoor")) return "Glassdoor";
    if (normalizedSource.includes("company site") || normalizedSource.includes("company website")) {
      return "Company Site";
    }
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
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-muted px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Sources
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          Which channels are converting best
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="px-5 py-8 text-sm text-muted-foreground">No source data available yet.</div>
      ) : (
        <div className="px-5 py-5">
          <div className="grid gap-3 md:grid-cols-3">
            {data.slice(0, 3).map((row, index) => (
              <div key={row.source} className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs text-muted-foreground">{index === 0 ? "Top source" : "Source"}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{row.source}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {row.interview} {row.interview === 1 ? "response" : "responses"} from {row.total} {row.total === 1 ? "application" : "applications"}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {row.rate.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Applications</th>
                  <th className="px-4 py-3 text-left">Responses</th>
                  <th className="px-4 py-3 text-left">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={row.source}
                    className="bg-surface">
                    <td className="px-4 py-3 font-medium text-foreground">{row.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.total}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.interview}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-border">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${Math.min(row.rate, 100)}%` }} />
                        </div>
                        <span className="w-24 text-right font-medium text-foreground">
                          {row.rate.toFixed(1)}%{row.total < 3 ? " · Low sample" : ""}
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
