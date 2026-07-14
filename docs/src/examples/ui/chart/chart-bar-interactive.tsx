"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive bar chart of catalog activity";

const chartData = [
  { date: "2026-05-25", publish: 3, install: 24 },
  { date: "2026-05-26", publish: 5, install: 32 },
  { date: "2026-05-27", publish: 4, install: 29 },
  { date: "2026-05-28", publish: 6, install: 41 },
  { date: "2026-05-29", publish: 7, install: 46 },
  { date: "2026-05-30", publish: 2, install: 20 },
  { date: "2026-05-31", publish: 3, install: 23 },
  { date: "2026-06-01", publish: 4, install: 27 },
  { date: "2026-06-02", publish: 6, install: 39 },
  { date: "2026-06-03", publish: 5, install: 35 },
  { date: "2026-06-04", publish: 8, install: 52 },
  { date: "2026-06-05", publish: 7, install: 48 },
  { date: "2026-06-06", publish: 3, install: 25 },
  { date: "2026-06-07", publish: 2, install: 22 },
  { date: "2026-06-08", publish: 5, install: 34 },
  { date: "2026-06-09", publish: 6, install: 43 },
  { date: "2026-06-10", publish: 9, install: 58 },
  { date: "2026-06-11", publish: 7, install: 50 },
  { date: "2026-06-12", publish: 8, install: 55 },
  { date: "2026-06-13", publish: 4, install: 30 },
  { date: "2026-06-14", publish: 3, install: 26 },
  { date: "2026-06-15", publish: 6, install: 42 },
  { date: "2026-06-16", publish: 7, install: 49 },
  { date: "2026-06-17", publish: 5, install: 37 },
  { date: "2026-06-18", publish: 9, install: 61 },
  { date: "2026-06-19", publish: 8, install: 57 },
  { date: "2026-06-20", publish: 4, install: 33 },
  { date: "2026-06-21", publish: 3, install: 28 },
  { date: "2026-06-22", publish: 7, install: 47 },
  { date: "2026-06-23", publish: 10, install: 65 },
  { date: "2026-06-24", publish: 8, install: 59 },
  { date: "2026-06-25", publish: 9, install: 63 },
  { date: "2026-06-26", publish: 11, install: 71 },
  { date: "2026-06-27", publish: 5, install: 38 },
  { date: "2026-06-28", publish: 4, install: 31 },
  { date: "2026-06-29", publish: 8, install: 54 },
  { date: "2026-06-30", publish: 10, install: 68 },
  { date: "2026-07-01", publish: 9, install: 62 },
  { date: "2026-07-02", publish: 12, install: 76 },
  { date: "2026-07-03", publish: 11, install: 73 },
  { date: "2026-07-04", publish: 6, install: 45 },
  { date: "2026-07-05", publish: 5, install: 40 },
];

const chartConfig = {
  publish: {
    label: "Published",
    color: "var(--chart-1)",
  },
  install: {
    label: "Installs",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const metrics = ["publish", "install"] as const;
const timeRanges = ["42d", "21d", "7d"] as const;
const rangeDays = {
  "42d": 42,
  "21d": 21,
  "7d": 7,
} satisfies Record<(typeof timeRanges)[number], number>;

type Metric = (typeof metrics)[number];
type TimeRange = (typeof timeRanges)[number];

export default function ChartBarInteractive() {
  const [activeChart, setActiveChart] = React.useState<Metric>("publish");
  const [timeRange, setTimeRange] = React.useState<TimeRange>("42d");

  const filteredData = React.useMemo(() => chartData.slice(-rangeDays[timeRange]), [timeRange]);

  const total = React.useMemo(
    () => ({
      publish: filteredData.reduce((acc, curr) => acc + curr.publish, 0),
      install: filteredData.reduce((acc, curr) => acc + curr.install, 0),
    }),
    [filteredData],
  );

  return (
    <Card className="bg-secondary-background py-0 text-foreground">
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 gap-0 border-b-2 border-b-border sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 sm:py-0 py-4 px-6">
          <CardTitle>Catalog Activity - Interactive</CardTitle>
          <CardDescription>
            Publish and install activity over the selected catalog range
          </CardDescription>
          <div
            className="mt-2 flex w-fit border-2 border-border"
            role="group"
            aria-label="Catalog activity range"
          >
            {timeRanges.map((range) => (
              <button
                type="button"
                key={range}
                aria-pressed={timeRange === range}
                data-active={timeRange === range}
                className="border-l-2 border-border px-2 py-1 text-xs font-heading first:border-l-0 data-[active=true]:bg-main data-[active=true]:text-main-foreground"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="flex">
          {metrics.map((chart) => (
            <button
              type="button"
              key={chart}
              aria-pressed={activeChart === chart}
              data-active={activeChart === chart}
              className="data-[active=true]:bg-[var(--chart-1)] data-[active=true]:text-main-foreground text-foreground even:data-[active=true]:bg-[var(--chart-2)] relative z-10 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:border-t-0 border-t-border border-t-2 even:border-l-2 sm:border-l-2 border-l-border sm:px-8 sm:py-6"
              onClick={() => setActiveChart(chart)}
            >
              <span className="text-xs">{chartConfig[chart].label}</span>
              <span className="text-lg leading-none font-heading sm:text-3xl">
                {total[chart].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 p-4 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            className="[&_.recharts-layer_path]:![stroke-width:1]"
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={{ fill: "#8080804D" }}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={"var(--color-" + activeChart + ")"} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
