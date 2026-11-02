import React, { useMemo, useState } from "react";
import type { JobApplication } from "../../applications/api/applications";

interface InsightsPanelProps {
  apps: JobApplication[];
}

function classifyDirection(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("frontend")) return "Frontend";
  if (normalizedTitle.includes("backend")) return "Backend";
  if (normalizedTitle.includes("full")) return "Full Stack";
  if (normalizedTitle.includes("data")) return "Data";
  if (normalizedTitle.includes("product")) return "Product";

  return "Other";
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ apps }) => {
  const [today] = useState(() => Date.now());
  const insights = useMemo(() => {
    if (!apps.length) return [];

    const grouped: Record<string, { total: number; interview: number }> = {};

    apps.forEach((app) => {
      const direction = classifyDirection(app.jobTitle);

      if (!grouped[direction]) {
        grouped[direction] = { total: 0, interview: 0 };
      }

      grouped[direction].total += 1;

      if (app.status === "INTERVIEW" || app.status === "OFFER") {
        grouped[direction].interview += 1;
      }
    });

    const best = Object.entries(grouped).sort(
      (left, right) => right[1].interview / right[1].total - left[1].interview / left[1].total,
    )[0];

    const last7Days = apps.filter((app) => {
      const date = new Date(app.appliedDate || app.createdAt);
      return today - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;

    const result: Array<{ title: string; body: string }> = [];

    if (best) {
      result.push({
        title: "Strongest direction",
        body: `${best[0]} roles are showing the best response pattern in your current data.`,
      });
    }

    if (last7Days < 5) {
      result.push({
        title: "Low recent activity",
        body: "Your application pace over the last week is light. Adding a few targeted submissions could improve signal quality.",
      });
    }

    if (last7Days > 15) {
      result.push({
        title: "High recent momentum",
        body: "Your last 7 days show strong consistency. This is a good point to review conversion quality, not just volume.",
      });
    }

    if (apps.some((app) => app.status === "OFFER")) {
      result.push({
        title: "Offer stage present",
        body: "You already have offer-stage traction. Review what those applications had in common and feed it back into future targeting.",
      });
    }

    return result;
  }, [apps, today]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-muted px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Insights
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          Signals worth acting on
        </h2>
      </div>

      {insights.length === 0 ? (
        <div className="px-5 py-8 text-sm text-muted-foreground">Not enough data yet.</div>
      ) : (
        <div className="space-y-3 px-5 py-5">
          {insights.map((insight, index) => (
            <article
              key={`${insight.title}-${index}`}
              className="rounded-xl border border-border bg-surface-muted p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <div>
                <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{insight.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default InsightsPanel;
