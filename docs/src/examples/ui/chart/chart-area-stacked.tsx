"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Stacked install and update activity by release";

const chartData = [
  { release: "v0.4", installs: 148, updates: 62 },
  { release: "v0.5", installs: 232, updates: 104 },
  { release: "v0.6", installs: 196, updates: 88 },
  { release: "v0.7", installs: 284, updates: 132 },
  { release: "v0.8", installs: 341, updates: 176 },
  { release: "v0.9", installs: 378, updates: 209 },
];

const chartConfig = {
  installs: {
    label: "Installs",
    color: "var(--chart-1)",
  },
  updates: {
    label: "Updates",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ChartAreaStacked() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Combined Registry Momentum</CardTitle>
        <CardDescription>Stacked installs and updates across recent six releases</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="release"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="updates"
              type="natural"
              fill="var(--color-updates)"
              stroke="var(--color-updates)"
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
              stackId="a"
            />
            <Area
              dataKey="installs"
              type="natural"
              fill="var(--color-installs)"
              stroke="var(--color-installs)"
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Combined activity reached 587 at v0.9 <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none">
              Recent six releases: v0.4 to v0.9
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
