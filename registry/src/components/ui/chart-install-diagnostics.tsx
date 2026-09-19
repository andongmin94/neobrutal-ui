"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const traces = {
  Local: { resolve: 120, download: 840, transform: 210, write: 90 },
  CI: { resolve: 180, download: 1480, transform: 240, write: 110 },
};
const stages = ["resolve", "download", "transform", "write"] as const;
const config = {
  resolve: { label: "Resolve", color: "var(--chart-1)" },
  download: { label: "Download", color: "var(--chart-2)" },
  transform: { label: "Transform", color: "var(--chart-3)" },
  write: { label: "Write", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function ChartInstallDiagnostics() {
  const [profile, setProfile] = useState<keyof typeof traces>("Local");
  const [unit, setUnit] = useState("ms");
  const trace = traces[profile];
  const total = stages.reduce((sum, key) => sum + trace[key], 0);
  const largest = stages.reduce((key, next) => (trace[next] > trace[key] ? next : key));
  const formatDuration = (milliseconds: number) =>
    unit === "ms" ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(2)} s`;
  const data = [{ profile, ...trace }];

  return (
    <Card className="min-w-0" data-chart-recipe="diagnostics">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">
          Diagnostics / Locate the bottleneck
        </p>
        <CardTitle>
          <h3>Installation trace</h3>
        </CardTitle>
        <CardDescription>
          A sample sequential installation split into four stages. Not live CLI telemetry.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="flex flex-wrap gap-4">
          <label className="grid gap-1 text-xs font-heading">
            Install environment
            <select
              value={profile}
              onChange={(event) => setProfile(event.target.value as keyof typeof traces)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              {Object.keys(traces).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-heading">
            Duration unit
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              <option value="ms">Milliseconds</option>
              <option value="s">Seconds</option>
            </select>
          </label>
        </div>
        <dl className="grid gap-4 border-y-2 border-border py-4 sm:grid-cols-3" aria-live="polite">
          {[
            ["Total duration", formatDuration(total)],
            ["Longest stage", config[largest].label],
            ["Longest-stage share", `${((trace[largest] / total) * 100).toFixed(1)}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs">{label}</dt>
              <dd className="mt-1 text-2xl font-heading tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <figure aria-label="Sequential installation stage durations" className="min-w-0">
          <ChartContainer config={config} className="h-48 w-full min-w-0 aspect-auto">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ top: 12, right: 12, bottom: 8, left: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 2200]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatDuration(Number(value))}
                minTickGap={32}
              />
              <YAxis
                type="category"
                dataKey="profile"
                width={40}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) =>
                      `${config[name as keyof typeof config]?.label ?? name}: ${formatDuration(Number(value))}`
                    }
                  />
                }
              />
              {stages.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="trace"
                  fill={`var(--color-${key})`}
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  maxBarSize={56}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ChartContainer>
          <figcaption className="mt-3 text-xs leading-5">
            Left to right: Resolve, Download, Transform, Write. These sequential stages add up to
            the total; parallel work cannot be interpreted this way.
          </figcaption>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          {config[largest].label} takes {formatDuration(trace[largest])} of {formatDuration(total)}.
          Unit changes only affect formatting, not the underlying measurements.
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View installation data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left">
              {profile} trace. All durations displayed in{" "}
              {unit === "ms" ? "milliseconds" : "seconds"}.
            </caption>
            <thead>
              <tr>
                {["Stage", "Duration", "Share"].map((label) => (
                  <th key={label} scope="col" className="border-b-2 border-border py-2 pr-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stages.map((key) => (
                <tr key={key}>
                  <th scope="row" className="py-3 pr-2">
                    {config[key].label}
                  </th>
                  <td>{formatDuration(trace[key])}</td>
                  <td>{((trace[key] / total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
