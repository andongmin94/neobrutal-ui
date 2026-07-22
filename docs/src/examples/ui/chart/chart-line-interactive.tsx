"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

export const description = "Interactive registry pipeline build time";

const chartData = [
  { date: "2026-05-25", cold: 842, cached: 322 },
  { date: "2026-05-26", cold: 831, cached: 315 },
  { date: "2026-05-27", cold: 846, cached: 326 },
  { date: "2026-05-28", cold: 819, cached: 309 },
  { date: "2026-05-29", cold: 826, cached: 314 },
  { date: "2026-05-30", cold: 806, cached: 301 },
  { date: "2026-05-31", cold: 811, cached: 305 },
  { date: "2026-06-01", cold: 794, cached: 294 },
  { date: "2026-06-02", cold: 801, cached: 298 },
  { date: "2026-06-03", cold: 781, cached: 287 },
  { date: "2026-06-04", cold: 789, cached: 291 },
  { date: "2026-06-05", cold: 770, cached: 281 },
  { date: "2026-06-06", cold: 777, cached: 285 },
  { date: "2026-06-07", cold: 756, cached: 273 },
  { date: "2026-06-08", cold: 764, cached: 278 },
  { date: "2026-06-09", cold: 744, cached: 267 },
  { date: "2026-06-10", cold: 751, cached: 271 },
  { date: "2026-06-11", cold: 730, cached: 259 },
  { date: "2026-06-12", cold: 739, cached: 264 },
  { date: "2026-06-13", cold: 716, cached: 252 },
  { date: "2026-06-14", cold: 725, cached: 256 },
  { date: "2026-06-15", cold: 704, cached: 244 },
  { date: "2026-06-16", cold: 712, cached: 249 },
  { date: "2026-06-17", cold: 690, cached: 236 },
  { date: "2026-06-18", cold: 698, cached: 240 },
  { date: "2026-06-19", cold: 677, cached: 228 },
  { date: "2026-06-20", cold: 685, cached: 233 },
  { date: "2026-06-21", cold: 663, cached: 221 },
  { date: "2026-06-22", cold: 672, cached: 225 },
  { date: "2026-06-23", cold: 649, cached: 213 },
  { date: "2026-06-24", cold: 658, cached: 217 },
  { date: "2026-06-25", cold: 636, cached: 205 },
  { date: "2026-06-26", cold: 644, cached: 210 },
  { date: "2026-06-27", cold: 621, cached: 198 },
  { date: "2026-06-28", cold: 630, cached: 202 },
  { date: "2026-06-29", cold: 608, cached: 190 },
  { date: "2026-06-30", cold: 615, cached: 194 },
  { date: "2026-07-01", cold: 588, cached: 182 },
  { date: "2026-07-02", cold: 563, cached: 174 },
  { date: "2026-07-03", cold: 535, cached: 165 },
  { date: "2026-07-04", cold: 501, cached: 156 },
  { date: "2026-07-05", cold: 470, cached: 148 },
];

const chartConfig = {
  buildTime: {
    label: "Build time (ms)",
  },
  cold: {
    label: "Cold build",
    color: "var(--chart-1)",
  },
  cached: {
    label: "Cached build",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const rangeDays = {
  "42d": 42,
  "21d": 21,
  "7d": 7,
} as const;

type BuildMode = "cold" | "cached";
type TimeRange = keyof typeof rangeDays;

export default function ChartLineInteractive() {
  const [activeChart, setActiveChart] = React.useState<BuildMode>("cold");
  const [timeRange, setTimeRange] = React.useState<TimeRange>("42d");

  const filteredData = React.useMemo(() => chartData.slice(-rangeDays[timeRange]), [timeRange]);

  const average = React.useMemo(
    () => ({
      cold: Math.round(
        filteredData.reduce((total, item) => total + item.cold, 0) / filteredData.length,
      ),
      cached: Math.round(
        filteredData.reduce((total, item) => total + item.cached, 0) / filteredData.length,
      ),
    }),
    [filteredData],
  );

  return (
    <Card className="bg-secondary-background py-0 text-foreground">
      <CardHeader className="flex flex-col items-stretch gap-0 space-y-0 border-b-2 border-b-border p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-6">
          <CardTitle>Registry Build Time - Interactive</CardTitle>
          <CardDescription>Daily registry builds in ms. Lower is better.</CardDescription>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="mt-2 w-[150px]" aria-label="Select build range">
              <SelectValue placeholder="Last 42 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="42d">Last 42 days</SelectItem>
              <SelectItem value="21d">Last 21 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex">
          {(["cold", "cached"] as const).map((chart) => (
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
                {average[chart].toLocaleString()} ms
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 p-4 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className={cn(
            "aspect-auto h-[250px] w-full",
            activeChart === "cached" && "[&_.recharts-layer_path]:stroke-[var(--color-cached)]",
            activeChart === "cold" && "[&_.recharts-layer_path]:stroke-[var(--color-cold)]",
          )}
        >
          <LineChart
            accessibilityLayer
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
                const date = new Date(`${value}T00:00:00`);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="buildTime"
                  labelFormatter={(value) => {
                    return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              strokeWidth={2}
              dot={false}
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
