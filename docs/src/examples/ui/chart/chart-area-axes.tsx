"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export const description = "Stacked registry activity with x and y axes";

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

export default function ChartAreaAxes() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Activity with Axes</CardTitle>
        <CardDescription>Install and update counts across recent six releases</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
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
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="updates"
              type="natural"
              fill="var(--color-updates)"
              stroke="var(--color-updates)"
              stackId="a"
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
            />
            <Area
              dataKey="installs"
              type="natural"
              fill="var(--color-installs)"
              stroke="var(--color-installs)"
              stackId="a"
              activeDot={{
                fill: "var(--chart-active-dot)",
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Install and update momentum climbed at v0.9 <TrendingUp className="h-4 w-4" />
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
