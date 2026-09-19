"use client";

import { useState } from "react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const periods = {
  Current: [48, 72, 36, 24],
  Next: [36, 90, 54, 30],
} as const;
const workstreams = ["Design", "Build", "Test", "Operations"];
const config = {
  hours: { label: "Hours" },
  Design: { label: "Design", color: "var(--chart-1)" },
  Build: { label: "Build", color: "var(--chart-2)" },
  Test: { label: "Test", color: "var(--chart-3)" },
  Operations: { label: "Operations", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function ChartWorkAllocation() {
  const [period, setPeriod] = useState<keyof typeof periods>("Current");
  const [selected, setSelected] = useState("Design");
  const data = workstreams.map((work, index) => ({
    work,
    hours: periods[period][index],
    fill: `var(--color-${work})`,
  }));
  const total = data.reduce((sum, row) => sum + row.hours, 0);
  const selectedRow = data.find((row) => row.work === selected)!;

  return (
    <Card className="min-w-0" data-chart-recipe="allocation">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">
          Allocation / Read the whole and its parts
        </p>
        <CardTitle>
          <h3>Work allocation</h3>
        </CardTitle>
        <CardDescription>
          Planned hours across four workstreams. Illustrative planning data, not tracked time.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="flex flex-wrap gap-4">
          <label className="grid gap-1 text-xs font-heading">
            Allocation period
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as keyof typeof periods)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              {Object.keys(periods).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-heading">
            Inspect workstream
            <select
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              {workstreams.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
        <dl className="grid gap-4 border-y-2 border-border py-4 sm:grid-cols-3" aria-live="polite">
          {[
            ["Total planned", `${total} h`],
            [selected, `${selectedRow.hours} h`],
            ["Share of total", `${((selectedRow.hours / total) * 100).toFixed(1)}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs">{label}</dt>
              <dd className="mt-1 text-2xl font-heading tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <figure aria-label="Planned hours by workstream" className="min-w-0">
          <ChartContainer
            config={config}
            className="mx-auto h-72 w-full max-w-md min-w-0 aspect-auto"
          >
            <PieChart accessibilityLayer>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="work"
                    formatter={(value, name) => `${name}: ${value} h`}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="hours"
                nameKey="work"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={3}
                stroke="var(--border)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
          <figcaption className="mt-3 text-xs leading-5">
            Clockwise from the right: Design, Build, Test, Operations. Use the inspector or table
            for exact values without relying on color.
          </figcaption>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          {selected} accounts for {selectedRow.hours} of {total} planned hours. Changing the
          inspector does not remove other workstreams from the total.
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View allocation data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left">
              {period} period. Shares use the total of all four workstreams.
            </caption>
            <thead>
              <tr>
                {["Workstream", "Hours", "Share"].map((label) => (
                  <th key={label} scope="col" className="border-b-2 border-border py-2 pr-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.work} className={selected === row.work ? "bg-background" : undefined}>
                  <th scope="row" className="py-3 pr-2">
                    {row.work}
                    {selected === row.work && <span className="sr-only">, selected</span>}
                  </th>
                  <td>{row.hours}</td>
                  <td>{((row.hours / total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
