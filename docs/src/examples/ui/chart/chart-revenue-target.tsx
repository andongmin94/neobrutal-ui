"use client";

import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const weeks = [
  { week: "W1", revenue: 12400, target: 14000 },
  { week: "W2", revenue: 15100, target: 14000 },
  { week: "W3", revenue: 13800, target: 15000 },
  { week: "W4", revenue: 17200, target: 15000 },
  { week: "W5", revenue: 16400, target: 16000 },
  { week: "W6", revenue: 18900, target: 16000 },
  { week: "W7", revenue: 17600, target: 17000 },
  { week: "W8", revenue: 21400, target: 17000 },
];
const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--foreground)" },
} satisfies ChartConfig;
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Component() {
  const [range, setRange] = useState("4");
  const data = weeks.slice(-Number(range));
  const revenue = data.reduce((total, row) => total + row.revenue, 0);
  const target = data.reduce((total, row) => total + row.target, 0);
  const gap = revenue - target;
  const belowTarget = data.filter((row) => row.revenue < row.target).length;

  return (
    <Card className="h-full min-w-0" data-chart-recipe="revenue">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">01 / Plan and compare</p>
        <CardTitle>
          <h3>Revenue vs target</h3>
        </CardTitle>
        <CardDescription>
          Weekly revenue against an explicit plan. Sample data in USD.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="grid gap-1 text-xs font-heading">
            Revenue period
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              <option value="4">Last 4 weeks</option>
              <option value="8">All 8 weeks</option>
            </select>
          </label>
          <p className="text-xs leading-5 text-foreground/75">
            Bars: revenue / dashed line: target
          </p>
        </div>
        <dl className="grid gap-4 border-y-2 border-border py-4 sm:grid-cols-3" aria-live="polite">
          {[
            ["Revenue", money.format(revenue)],
            ["Target", money.format(target)],
            ["Variance", `${gap >= 0 ? "+" : "−"}${money.format(Math.abs(gap))}`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-foreground/75">{label}</dt>
              <dd className="mt-1 text-2xl font-heading tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <figure className="min-w-0" aria-label="Weekly revenue and target">
          <ChartContainer config={config} className="h-64 w-full min-w-0 aspect-auto">
            <ComposedChart
              accessibilityLayer
              data={data}
              margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                domain={[0, "auto"]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) =>
                      `${name === "revenue" ? "Revenue" : "Target"}: ${money.format(Number(value))}`
                    }
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                maxBarSize={48}
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                dataKey="target"
                type="linear"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          {((revenue / target) * 100).toFixed(1)}% of target achieved. {belowTarget} of{" "}
          {data.length} weeks below plan.
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View revenue data</summary>
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard access to the data-table scroll area. */}
          <section tabIndex={0} aria-label="Revenue values" className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <caption className="pb-3 text-left text-foreground/75">
                The same {data.length} weeks shown in the chart. USD.
              </caption>
              <thead>
                <tr>
                  {["Week", "Revenue", "Target", "Variance"].map((label) => (
                    <th key={label} scope="col" className="border-b-2 border-border py-2 pr-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.week}>
                    <th scope="row" className="py-2 pr-3">
                      {row.week}
                    </th>
                    <td className="pr-3">{money.format(row.revenue)}</td>
                    <td className="pr-3">{money.format(row.target)}</td>
                    <td>{money.format(row.revenue - row.target)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </details>
      </CardContent>
    </Card>
  );
}
