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

export const description = "Registry pipeline cold and cached build times";

const chartData = [
  { release: "v0.4", cold: 820, cached: 310 },
  { release: "v0.5", cold: 710, cached: 265 },
  { release: "v0.6", cold: 640, cached: 228 },
  { release: "v0.7", cold: 590, cached: 204 },
  { release: "v0.8", cold: 520, cached: 176 },
  { release: "v0.9", cold: 470, cached: 148 },
];

const chartConfig = {
  cold: {
    label: "Cold build (ms)",
    color: "var(--chart-1)",
  },
  cached: {
    label: "Cached build (ms)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ChartLineMultiple() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Build Time - Multiple</CardTitle>
        <CardDescription>Cold and cached builds from v0.4 to v0.9 (ms)</CardDescription>
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="cold"
              type="monotone"
              stroke="var(--color-cold)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="cached"
              type="monotone"
              stroke="var(--color-cached)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Cold builds improved by 350 ms <TrendingDown className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none">
              Lower build time means better pipeline performance.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
