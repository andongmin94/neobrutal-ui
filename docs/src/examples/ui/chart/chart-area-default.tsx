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

export const description = "Registry installs across six releases";

const chartData = [
  { release: "v0.4", installs: 148 },
  { release: "v0.5", installs: 232 },
  { release: "v0.6", installs: 196 },
  { release: "v0.7", installs: 284 },
  { release: "v0.8", installs: 341 },
  { release: "v0.9", installs: 378 },
];

const chartConfig = {
  installs: {
    label: "Installs",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChartAreaDefault() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Install Activity</CardTitle>
        <CardDescription>Installs across the recent six releases</CardDescription>
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
              dataKey="installs"
              type="natural"
              fill="var(--color-installs)"
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
              Install momentum rose 10.9% at v0.9 <TrendingUp className="h-4 w-4" />
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
