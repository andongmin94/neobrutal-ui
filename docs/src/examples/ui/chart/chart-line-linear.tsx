"use client";

import { TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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

export const description = "Registry pipeline cached build time with a linear line";

const chartData = [
  { release: "v0.4", cached: 310 },
  { release: "v0.5", cached: 265 },
  { release: "v0.6", cached: 228 },
  { release: "v0.7", cached: 204 },
  { release: "v0.8", cached: 176 },
  { release: "v0.9", cached: 148 },
];

const chartConfig = {
  cached: {
    label: "Cached build (ms)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChartLineLinear() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Build Time - Linear</CardTitle>
        <CardDescription>Cached build from v0.4 to v0.9 (ms)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="[&_.recharts-layer_path]:stroke-black [&_.recharts-layer_path]:dark:stroke-white"
          config={chartConfig}
        >
          <LineChart
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey="cached"
              type="linear"
              stroke="var(--color-cached)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Cached builds improved by 162 ms <TrendingDown className="h-4 w-4" />
        </div>
        <div className="leading-none">Lower build time means better pipeline performance.</div>
      </CardFooter>
    </Card>
  );
}
