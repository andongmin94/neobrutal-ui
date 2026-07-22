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

export const description = "Registry pipeline cold build time";

const chartData = [
  { stage: "Resolve", cold: 820 },
  { stage: "Fetch", cold: 710 },
  { stage: "Write", cold: 640 },
  { stage: "Format", cold: 590 },
  { stage: "Verify", cold: 520 },
  { stage: "Ready", cold: 470 },
];

const chartConfig = {
  cold: {
    label: "Cold build (ms)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChartLineDefault() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Build Time</CardTitle>
        <CardDescription>Cold build by pipeline stage (ms)</CardDescription>
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
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey="cold"
              type="natural"
              stroke="var(--color-cold)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          350 ms less from Resolve to Ready <TrendingDown className="h-4 w-4" />
        </div>
        <div className="leading-none">Lower build time means better pipeline performance.</div>
      </CardFooter>
    </Card>
  );
}
