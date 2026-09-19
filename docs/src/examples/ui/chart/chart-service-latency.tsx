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

const samples = {
  API: [
    [80, 210],
    [76, 195],
    [95, 340],
    [130, 470],
    [100, 330],
    [82, 240],
    [79, 215],
  ],
  Search: [
    [105, 270],
    [112, 290],
    [118, 310],
    [110, 280],
    [108, 260],
    [102, 250],
    [99, 245],
  ],
} as const;
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const budget = 300;
const config = {
  p50: { label: "p50", color: "var(--foreground)" },
  p95: { label: "p95", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function Component() {
  const [service, setService] = useState<keyof typeof samples>("API");
  const data = samples[service].map(([p50, p95], index) => ({ day: days[index], p50, p95 }));
  const breaches = data.filter((row) => row.p95 > budget);
  const worst = Math.max(...data.map((row) => row.p95));

  return (
    <Card className="h-full min-w-0" data-chart-recipe="latency">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">03 / Watch the tail</p>
        <CardTitle>
          <h3>Response-time budget</h3>
        </CardTitle>
        <CardDescription>
          Daily p50 and p95 against a 300 ms p95 budget. Illustrative measurements.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <label className="grid justify-items-start gap-1 text-xs font-heading">
          Service
          <select
            value={service}
            onChange={(event) => setService(event.target.value as keyof typeof samples)}
            className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
          >
            {Object.keys(samples).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <dl className="grid grid-cols-2 gap-4 border-y-2 border-border py-4" aria-live="polite">
          <div>
            <dt className="text-xs text-foreground/75">Worst daily p95</dt>
            <dd className="mt-1 text-2xl font-heading tabular-nums">{worst} ms</dd>
          </div>
          <div>
            <dt className="text-xs text-foreground/75">Days over budget</dt>
            <dd className="mt-1 text-2xl font-heading tabular-nums">
              {breaches.length} / {data.length}
            </dd>
          </div>
        </dl>
        <figure className="min-w-0" aria-label="Daily p50 and p95 response times in milliseconds">
          <ChartContainer config={config} className="h-64 w-full min-w-0 aspect-auto">
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis domain={[0, 600]} tickLine={false} axisLine={false} width={36} />
              <ReferenceLine y={budget} stroke="var(--foreground)" strokeDasharray="3 4" />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={(value, name) => `${name}: ${value} ms`} />
                }
              />
              <Line
                dataKey="p50"
                type="linear"
                stroke="var(--color-p50)"
                strokeDasharray="8 4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="p95"
                type="linear"
                stroke="var(--color-p95)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--color-p95)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </figure>
        <p className="text-xs leading-5 text-foreground/75">
          Solid + dots: p95 / long dash: p50 / dotted horizontal line: 300 ms budget.
        </p>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          {breaches.length
            ? `Daily p95 exceeded budget on ${breaches.map((row) => row.day).join(", ")}.`
            : "Every daily p95 stayed within budget."}
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View latency data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left text-foreground/75">
              {service}, milliseconds. Daily percentiles are not a pooled weekly percentile.
            </caption>
            <thead>
              <tr>
                {["Day", "p50", "p95", "Budget"].map((label) => (
                  <th key={label} scope="col" className="border-b-2 border-border py-2 pr-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.day}>
                  <th scope="row" className="py-2 pr-3">
                    {row.day}
                  </th>
                  <td className="pr-3">{row.p50}</td>
                  <td className="pr-3">{row.p95}</td>
                  <td>{row.p95 > budget ? "Over" : "Within"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
