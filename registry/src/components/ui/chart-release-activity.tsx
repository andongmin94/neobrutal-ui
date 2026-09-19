"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const releases = [
  { release: "R1", installs: 148, updates: 62 },
  { release: "R2", installs: 232, updates: 104 },
  { release: "R3", installs: 196, updates: 88 },
  { release: "R4", installs: 284, updates: 132 },
  { release: "R5", installs: 341, updates: 176 },
  { release: "R6", installs: 378, updates: 209 },
];
const config = {
  installs: { label: "New installs", color: "var(--chart-1)" },
  updates: {
    label: "Updates",
    color: "color-mix(in srgb, var(--chart-2) 65%, var(--foreground))",
  },
} satisfies ChartConfig;
const number = new Intl.NumberFormat("en-US");

export default function ChartReleaseActivity() {
  const [view, setView] = useState("count");
  const [range, setRange] = useState("6");
  const data = releases.slice(-Number(range));
  const installs = data.reduce((total, row) => total + row.installs, 0);
  const updates = data.reduce((total, row) => total + row.updates, 0);
  const total = installs + updates;
  const share = view === "share";

  return (
    <Card className="min-w-0" data-chart-recipe="activity">
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-widest">
          Activity / Volume or composition?
        </p>
        <CardTitle>
          <h3>Release adoption</h3>
        </CardTitle>
        <CardDescription>
          Separate new adoption from repeat use. Illustrative event counts, not unique users.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="flex flex-wrap gap-4">
          <label className="grid gap-1 text-xs font-heading">
            Activity measure
            <select
              value={view}
              onChange={(event) => setView(event.target.value)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              <option value="count">Event counts</option>
              <option value="share">Share of each release</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-heading">
            Release period
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
            >
              <option value="6">All 6 releases</option>
              <option value="3">Latest 3 releases</option>
            </select>
          </label>
        </div>
        <dl className="grid gap-4 border-y-2 border-border py-4 sm:grid-cols-3" aria-live="polite">
          {[
            ["Total activity", number.format(total)],
            ["New installs", number.format(installs)],
            ["Update share", `${((updates / total) * 100).toFixed(1)}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs">{label}</dt>
              <dd className="mt-1 text-2xl font-heading tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <figure
          aria-label={
            share ? "Install and update share by release" : "Install and update events by release"
          }
          className="min-w-0"
        >
          <ChartContainer config={config} className="h-72 w-full min-w-0 aspect-auto">
            <AreaChart
              accessibilityLayer
              data={data}
              stackOffset={share ? "expand" : "none"}
              margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="release" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                width={48}
                domain={share ? [0, 1] : [0, "auto"]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  share ? `${Math.round(Number(value) * 100)}%` : number.format(Number(value))
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) =>
                      `${name === "installs" ? "New installs" : "Updates"}: ${number.format(Number(value))} events`
                    }
                  />
                }
              />
              <Area
                dataKey="installs"
                type="linear"
                stackId="events"
                fill="var(--color-installs)"
                fillOpacity={0.7}
                stroke="var(--foreground)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                dataKey="updates"
                type="linear"
                stackId="events"
                fill="var(--color-updates)"
                fillOpacity={0.6}
                stroke="var(--foreground)"
                strokeWidth={2}
                strokeDasharray="6 4"
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
          <figcaption className="mt-3 text-xs leading-5">
            Lower area / solid boundary: new installs. Upper area / dashed boundary: updates.
          </figcaption>
        </figure>
        <output className="border-l-4 border-main pl-3 text-sm leading-6">
          {share
            ? "Every release totals 100%. A larger share does not necessarily mean more events."
            : "Stack height is total activity. The solid and dashed boundaries separate installs and updates."}
        </output>
        <details className="min-w-0 border-t-2 border-border pt-4">
          <summary className="cursor-pointer text-sm font-heading">View activity data</summary>
          <table className="mt-3 w-full text-left text-xs tabular-nums">
            <caption className="pb-3 text-left">
              The same {data.length} releases. Update share uses each release&apos;s total.
            </caption>
            <thead>
              <tr>
                {["Release", "Installs", "Updates", "Update share"].map((label) => (
                  <th key={label} scope="col" className="border-b-2 border-border py-2 pr-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.release}>
                  <th scope="row" className="py-3 pr-2">
                    {row.release}
                  </th>
                  <td>{row.installs}</td>
                  <td>{row.updates}</td>
                  <td>{((row.updates / (row.installs + row.updates)) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
