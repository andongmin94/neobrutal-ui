"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const teams = {
  Product: [[32, 28], [36, 39], [34, 31], [38, 42]],
  Platform: [[24, 26], [28, 23], [26, 29], [30, 30]],
} as const;
const config = {
  planned: { label: "Planned", color: "var(--secondary-background)" },
  delivered: { label: "Delivered", color: "var(--chart-1)" },
  variance: { label: "Delivered minus planned", color: "var(--chart-2)" },
} satisfies ChartConfig;
const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

export default function ChartDeliveryCapacity() {
  const [team, setTeam] = useState<keyof typeof teams>("Product");
  const [view, setView] = useState("compare");
  const data = teams[team].map(([planned, delivered], index) => ({
    sprint: `S${index + 1}`,
    planned,
    delivered,
    variance: delivered - planned,
  }));
  const planned = data.reduce((total, row) => total + row.planned, 0);
  const delivered = data.reduce((total, row) => total + row.delivered, 0);
  const metPlan = data.filter((row) => row.variance >= 0).length;
  const variance = view === "variance";

  return (
    <Card className="min-w-0" data-chart-recipe="capacity">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">Delivery / Compare against a plan</p>
        <CardTitle><h3>Delivery capacity</h3></CardTitle>
        <CardDescription>
          Planned and completed work in illustrative item counts. Not a team productivity score.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="flex flex-wrap gap-4">
          <label className="grid gap-1 text-xs font-heading">
            Delivery team
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value as keyof typeof teams)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              {Object.keys(teams).map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-heading">
            Delivery view
            <select
              value={view}
              onChange={(event) => setView(event.target.value)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              <option value="compare">Planned and delivered</option>
              <option value="variance">Signed variance</option>
            </select>
          </label>
        </div>
        <dl className="grid gap-4 border-y-2 border-border py-4 sm:grid-cols-3" aria-live="polite">
          {[["Planned items", planned], ["Delivered items", delivered], ["Net variance", signed(delivered - planned)]].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs">{label}</dt>
              <dd className="mt-1 text-2xl font-heading tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <figure aria-label={variance ? "Signed delivery variance by sprint" : "Planned and delivered items by sprint"} className="min-w-0">
          <ChartContainer config={config} className="h-72 w-full min-w-0 aspect-auto">
            <BarChart accessibilityLayer data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="sprint" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis width={40} domain={variance ? [-8, 8] : [0, 48]} tickLine={false} axisLine={false} allowDecimals={false} />
              <ReferenceLine y={0} stroke="var(--foreground)" strokeWidth={2} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => `${config[name as keyof typeof config]?.label ?? name}: ${Number(value)} items`} />} />
              {variance ? (
                <Bar dataKey="variance" fill="var(--color-variance)" stroke="var(--foreground)" strokeWidth={2} maxBarSize={48} isAnimationActive={false} />
              ) : (
                <>
                  <Bar dataKey="planned" fill="var(--color-planned)" stroke="var(--foreground)" strokeWidth={2} strokeDasharray="4 3" maxBarSize={40} isAnimationActive={false} />
                  <Bar dataKey="delivered" fill="var(--color-delivered)" stroke="var(--foreground)" strokeWidth={2} maxBarSize={40} isAnimationActive={false} />
                </>
              )}
            </BarChart>
          </ChartContainer>
          <figcaption className="mt-3 text-xs leading-5">
            {variance ? "Above zero: more items delivered than planned. Below zero: fewer." : "Outlined / dashed: planned. Filled / solid: delivered. Both start at zero."}
          </figcaption>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          {metPlan} of {data.length} sprints met or exceeded plan. The variance is delivered minus planned, not a percentage.
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View delivery data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left">{team}. Item counts for the same four sprints.</caption>
            <thead><tr>{["Sprint", "Planned", "Delivered", "Variance"].map((label) => <th key={label} scope="col" className="border-b-2 border-border py-2 pr-2">{label}</th>)}</tr></thead>
            <tbody>{data.map((row) => <tr key={row.sprint}><th scope="row" className="py-3 pr-2">{row.sprint}</th><td>{row.planned}</td><td>{row.delivered}</td><td>{signed(row.variance)}</td></tr>)}</tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
