"use client";

import { TrendingDown } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart } from "recharts";

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

export const description = "Registry pipeline build time with custom stage labels";

const chartData = [
  { stage: "resolve", cold: 820 },
  { stage: "fetch", cold: 710 },
  { stage: "write", cold: 640 },
  { stage: "format", cold: 590 },
  { stage: "verify", cold: 520 },
  { stage: "ready", cold: 470 },
];

const chartConfig = {
  cold: {
    label: "Cold build (ms)",
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

export default function ChartLineLabelCustom() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Build Time - Custom Labels</CardTitle>
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
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" nameKey="cold" hideLabel />}
            />
            <Line
              dataKey="cold"
              type="natural"
              stroke="var(--color-cold)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-cold)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="stage"
                formatter={(value) =>
                  typeof value === "string" &&
                  value in chartConfig &&
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Cold builds improved by 350 ms <TrendingDown className="h-4 w-4" />
        </div>
        <div className="leading-none">Lower build time means better pipeline performance.</div>
      </CardFooter>
    </Card>
  );
}
