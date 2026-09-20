"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartSelect,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const cohorts = {
  "Self-serve": [4800, 1800, 840, 520],
  "Sales-led": [1600, 960, 650, 470],
} as const;
const stages = ["Visited", "Signed up", "Activated", "Paid"];
const config = { people: { label: "People", color: "var(--chart-2)" } } satisfies ChartConfig;
const number = new Intl.NumberFormat("en-US");

export default function Component() {
  const [cohort, setCohort] = useState<keyof typeof cohorts>("Self-serve");
  const counts = cohorts[cohort];
  const data = stages.map((stage, index) => ({ stage, people: counts[index] }));
  const drops = data.slice(1).map((row, index) => ({
    from: stages[index],
    to: row.stage,
    lost: counts[index] - row.people,
  }));
  const largestDrop = drops.reduce((largest, drop) => (drop.lost > largest.lost ? drop : largest));

  return (
    <Card className="h-full min-w-0" data-chart-recipe="conversion">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">02 / Find the friction</p>
        <CardTitle>
          <h3>Signup conversion</h3>
        </CardTitle>
        <CardDescription>
          One sample cohort through four stages. Counts are people, not events.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <ChartSelect
          label="Acquisition cohort"
          value={cohort}
          onValueChange={(value) => setCohort(value as keyof typeof cohorts)}
          options={Object.keys(cohorts).map((value) => ({ value, label: value }))}
        />
        <dl className="grid grid-cols-2 gap-4 border-y-2 border-border py-4" aria-live="polite">
          <div>
            <dt className="text-xs text-foreground/75">Visit to paid</dt>
            <dd className="mt-1 text-2xl font-heading tabular-nums">
              {((counts[3] / counts[0]) * 100).toFixed(1)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground/75">Paid customers</dt>
            <dd className="mt-1 text-2xl font-heading tabular-nums">{number.format(counts[3])}</dd>
          </div>
        </dl>
        <figure className="min-w-0" aria-label="People remaining at each signup stage">
          <ChartContainer config={config} className="h-64 w-full min-w-0 aspect-auto">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                domain={[0, counts[0]]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => number.format(Number(value))}
              />
              <YAxis type="category" dataKey="stage" width={72} tickLine={false} axisLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${number.format(Number(value))} people`}
                  />
                }
              />
              <Bar
                dataKey="people"
                fill="var(--color-people)"
                radius={[0, 3, 3, 0]}
                maxBarSize={36}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          Largest drop: {largestDrop.from} → {largestDrop.to}. {number.format(largestDrop.lost)}{" "}
          people did not reach the next stage.
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View conversion data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left text-foreground/75">
              {cohort}. Step conversion uses the previous stage as its denominator.
            </caption>
            <thead>
              <tr>
                {["Stage", "People", "From previous"].map((label) => (
                  <th key={label} scope="col" className="border-b-2 border-border py-2 pr-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.stage}>
                  <th scope="row" className="py-2 pr-3">
                    {row.stage}
                  </th>
                  <td className="pr-3">{number.format(row.people)}</td>
                  <td>
                    {index === 0 ? "—" : `${((row.people / counts[index - 1]) * 100).toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
