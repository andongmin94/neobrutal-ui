"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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

export const description = "Interactive registry activity by channel";

const chartData = [
  { date: "2026-05-25", cli: 90, copy: 35 },
  { date: "2026-05-26", cli: 99, copy: 41 },
  { date: "2026-05-27", cli: 82, copy: 32 },
  { date: "2026-05-28", cli: 98, copy: 40 },
  { date: "2026-05-29", cli: 112, copy: 48 },
  { date: "2026-05-30", cli: 123, copy: 54 },
  { date: "2026-05-31", cli: 86, copy: 33 },
  { date: "2026-06-01", cli: 102, copy: 42 },
  { date: "2026-06-02", cli: 112, copy: 48 },
  { date: "2026-06-03", cli: 95, copy: 39 },
  { date: "2026-06-04", cli: 139, copy: 61 },
  { date: "2026-06-05", cli: 124, copy: 56 },
  { date: "2026-06-06", cli: 135, copy: 62 },
  { date: "2026-06-07", cli: 99, copy: 41 },
  { date: "2026-06-08", cli: 115, copy: 50 },
  { date: "2026-06-09", cli: 125, copy: 56 },
  { date: "2026-06-10", cli: 107, copy: 47 },
  { date: "2026-06-11", cli: 123, copy: 55 },
  { date: "2026-06-12", cli: 137, copy: 63 },
  { date: "2026-06-13", cli: 148, copy: 69 },
  { date: "2026-06-14", cli: 112, copy: 49 },
  { date: "2026-06-15", cli: 127, copy: 58 },
  { date: "2026-06-16", cli: 137, copy: 64 },
  { date: "2026-06-17", cli: 120, copy: 55 },
  { date: "2026-06-18", cli: 172, copy: 81 },
  { date: "2026-06-19", cli: 150, copy: 71 },
  { date: "2026-06-20", cli: 160, copy: 77 },
  { date: "2026-06-21", cli: 124, copy: 56 },
  { date: "2026-06-22", cli: 140, copy: 65 },
  { date: "2026-06-23", cli: 150, copy: 71 },
  { date: "2026-06-24", cli: 133, copy: 63 },
  { date: "2026-06-25", cli: 148, copy: 71 },
  { date: "2026-06-26", cli: 162, copy: 79 },
  { date: "2026-06-27", cli: 173, copy: 85 },
  { date: "2026-06-28", cli: 137, copy: 64 },
  { date: "2026-06-29", cli: 153, copy: 73 },
  { date: "2026-06-30", cli: 162, copy: 79 },
  { date: "2026-07-01", cli: 145, copy: 70 },
  { date: "2026-07-02", cli: 209, copy: 102 },
  { date: "2026-07-03", cli: 175, copy: 86 },
  { date: "2026-07-04", cli: 186, copy: 93 },
  { date: "2026-07-05", cli: 149, copy: 72 },
];

const chartConfig = {
  activity: {
    label: "Registry activity",
  },
  cli: {
    label: "CLI",
    color: "var(--chart-1)",
  },
  copy: {
    label: "Copy",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("42d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2026-07-05");
    let daysToSubtract = 41;
    if (timeRange === "21d") {
      daysToSubtract = 20;
    } else if (timeRange === "7d") {
      daysToSubtract = 6;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader className="flex items-center sm:gap-2 gap-4 space-y-0 sm:flex-row flex-col">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Registry Channel Activity</CardTitle>
          <CardDescription>CLI and copy activity across the recent 42 days</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] sm:ml-auto" aria-label="Select activity range">
            <SelectValue placeholder="Last 42 days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="42d">Last 42 days</SelectItem>
            <SelectItem value="21d">Last 21 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
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
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="copy"
              type="natural"
              fill="var(--color-copy)"
              stroke="var(--color-copy)"
              stackId="a"
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
            />
            <Area
              dataKey="cli"
              type="natural"
              fill="var(--color-cli)"
              stroke="var(--color-cli)"
              stackId="a"
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
