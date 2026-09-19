"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const builds = [
  { build: "B1", cold: 210, warm: 108 },
  { build: "B2", cold: 195, warm: 102 },
  { build: "B3", cold: 238, warm: 114 },
  { build: "B4", cold: 226, warm: 109 },
  { build: "B5", cold: 204, warm: 96 },
  { build: "B6", cold: 188, warm: 93 },
];
const budget = 220;
const config = {
  cold: { label: "Cold build", color: "var(--foreground)" },
  warm: { label: "Cached build", color: "color-mix(in srgb, var(--chart-2) 50%, var(--foreground))" },
} satisfies ChartConfig;

export default function ChartBuildDuration() {
  const [range, setRange] = useState("6");
  const [series, setSeries] = useState("both");
  const data = builds.slice(-Number(range));
  const coldMean = data.reduce((total, row) => total + row.cold, 0) / data.length;
  const warmMean = data.reduce((total, row) => total + row.warm, 0) / data.length;
  const breaches = data.filter((row) => row.cold > budget).length;

  return (
    <Card className="min-w-0" data-chart-recipe="builds">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">Builds / Make the comparison explicit</p>
        <CardTitle><h3>Build duration</h3></CardTitle>
        <CardDescription>Paired cold and cached runs in seconds. Illustrative measurements of the same builds.</CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="flex flex-wrap gap-4">
          <label className="grid gap-1 text-xs font-heading">
            Build period
            <select value={range} onChange={(event) => setRange(event.target.value)} className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground">
              <option value="6">All 6 builds</option><option value="3">Latest 3 builds</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-heading">
            Visible build series
            <select value={series} onChange={(event) => setSeries(event.target.value)} className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground">
              <option value="both">Both series</option><option value="cold">Cold only</option><option value="warm">Cached only</option>
            </select>
          </label>
        </div>
        <dl className="grid gap-4 border-y-2 border-border py-4 sm:grid-cols-3" aria-live="polite">
          {[["Mean cold run", `${coldMean.toFixed(1)} s`], ["Mean cached run", `${warmMean.toFixed(1)} s`], ["Mean time saved", `${(coldMean - warmMean).toFixed(1)} s`]].map(([label, value]) => <div key={label}><dt className="text-xs">{label}</dt><dd className="mt-1 text-2xl font-heading tabular-nums">{value}</dd></div>)}
        </dl>
        <figure aria-label="Cold and cached build duration in seconds" className="min-w-0">
          <ChartContainer config={config} className="h-72 w-full min-w-0 aspect-auto">
            <LineChart accessibilityLayer data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="build" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis width={48} domain={[0, 300]} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}s`} />
              <ReferenceLine y={budget} stroke="var(--foreground)" strokeDasharray="2 5" />
              <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => `${name === "cold" ? "Cold" : "Cached"}: ${value} s`} />} />
              {series !== "warm" && <Line dataKey="cold" type="linear" stroke="var(--color-cold)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-cold)" }} isAnimationActive={false} />}
              {series !== "cold" && <Line dataKey="warm" type="linear" stroke="var(--color-warm)" strokeWidth={2} strokeDasharray="8 4" dot={{ r: 4, fill: "var(--secondary-background)", strokeWidth: 2 }} isAnimationActive={false} />}
            </LineChart>
          </ChartContainer>
          <figcaption className="mt-3 text-xs leading-5">Solid / filled dots: cold. Dashed / open dots: cached. Dotted horizontal line: 220 s cold-run budget.</figcaption>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">{breaches} of {data.length} cold runs exceeded budget. Summaries and the table compare both runs even when a plotted series is hidden.</output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View build data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left">Paired run durations. Time saved is cold minus cached, in seconds.</caption>
            <thead><tr>{["Build", "Cold (s)", "Cached (s)", "Saved (s)"].map((label) => <th key={label} scope="col" className="border-b-2 border-border py-2 pr-2">{label}</th>)}</tr></thead>
            <tbody>{data.map((row) => <tr key={row.build}><th scope="row" className="py-3 pr-2">{row.build}</th><td>{row.cold}</td><td>{row.warm}</td><td>{row.cold - row.warm}</td></tr>)}</tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
