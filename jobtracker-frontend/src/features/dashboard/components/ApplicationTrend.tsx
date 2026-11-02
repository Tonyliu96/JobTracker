import React, { useMemo, useState } from "react";
import type { JobApplication } from "../../applications/api/applications";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ApplicationTrendProps {
  apps: JobApplication[];
}

const ApplicationTrend: React.FC<ApplicationTrendProps> = ({ apps }) => {
  const [range, setRange] = useState<7 | 30>(7);

  const trendData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: range }, (_, index) => {
      const offset = range - 1 - index;
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      const key = date.toISOString().slice(0, 10);
      const count = apps.filter((app) => {
        const rawDate = app.appliedDate || app.createdAt;
        return new Date(rawDate).toISOString().slice(0, 10) === key;
      }).length;

      return {
        date: key.slice(5),
        count,
      };
    });
  }, [apps, range]);

  const totalInRange = trendData.reduce((sum, item) => sum + item.count, 0);
  const busiestDay = trendData.reduce(
    (best, item) => (item.count > best.count ? item : best),
    trendData[0] ?? { date: "--", count: 0 },
  );

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-muted px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Trend
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              Application momentum
            </h2>
          </div>

          <div className="inline-flex rounded-md border border-border bg-surface p-1">
            {[7, 30].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as 7 | 30)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  range === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-surface-muted"}`}>
                {value} days
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
        <div className="rounded-lg bg-surface-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Applications in range</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{totalInRange}</p>
        </div>
        <div className="rounded-lg bg-surface-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Busiest day</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalInRange === 0 ? "—" : busiestDay.date}</p>
        </div>
        <div className="rounded-lg bg-surface-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Peak submissions</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{busiestDay.count}</p>
        </div>
      </div>

      <div className="px-3 pb-4 md:px-5 md:pb-5">
        <div className="rounded-xl bg-surface-muted p-3 md:p-4">
          {totalInRange === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No applications in this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}/>
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}/>
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",}}
                cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}/>
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0f172a"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0f172a", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};

export default ApplicationTrend;
