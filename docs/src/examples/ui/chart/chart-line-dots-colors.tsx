"use client";

import { TrendingDown } from "lucide-react";
import { CartesianGrid, Dot, Line, LineChart } from "recharts";

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

export const description = "Registry pipeline cached build time with colored dots";

const chartData = [
  { stage: "resolve", cached: 310, fill: "var(--color-resolve)" },
  { stage: "fetch", cached: 265, fill: "var(--color-fetch)" },
  { stage: "write", cached: 228, fill: "var(--color-write)" },
  { stage: "format", cached: 204, fill: "var(--color-format)" },
  { stage: "verify", cached: 176, fill: "var(--color-verify)" },
  { stage: "ready", cached: 148, fill: "var(--color-ready)" },
];

const chartConfig = {
  cached: {
    label: "Cached build (ms)",
    color: "var(--chart-2)",
  },
  resolve: {
    label: "Resolve",
    color: "var(--chart-1)",
  },
  fetch: {
    label: "Fetch",
    color: "var(--chart-2)",
  },
  write: {
    label: "Write",
    color: "var(--chart-3)",
  },
  format: {
    label: "Format",
    color: "var(--chart-4)",
  },
  verify: {
    label: "Verify",
    color: "var(--chart-5)",
  },
  ready: {
    label: "Ready",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChartLineDotsColors() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Build Time - Dot Colors</CardTitle>
        <CardDescription>Cached build by pipeline stage (ms)</CardDescription>
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
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" nameKey="cached" hideLabel />}
            />
            <Line
              dataKey="cached"
              type="natural"
              stroke="var(--color-cached)"
              strokeWidth={2}
              dot={({ payload, ...props }) => {
                return (
                  <Dot
                    key={payload.stage}
                    r={5}
                    cx={props.cx}
                    cy={props.cy}
                    fill={payload.fill}
                    stroke={payload.fill}
                  />
                );
              }}
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
