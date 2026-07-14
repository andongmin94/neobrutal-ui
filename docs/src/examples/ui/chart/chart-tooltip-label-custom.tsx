"use client";

import { Bar, BarChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Install pipeline timings with a custom label";

const chartData = [
  { stage: "Resolve", cached: 118, network: 310 },
  { stage: "Fetch", cached: 92, network: 420 },
  { stage: "Write", cached: 148, network: 265 },
  { stage: "Merge", cached: 76, network: 188 },
  { stage: "Format", cached: 104, network: 236 },
  { stage: "Verify", cached: 84, network: 172 },
];

const chartConfig = {
  pipeline: {
    label: "Install pipeline",
  },
  cached: {
    label: "Cached",
    color: "var(--chart-1)",
  },
  network: {
    label: "Network",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ChartTooltipLabelCustom() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Install Timing - Named</CardTitle>
        <CardDescription>The tooltip label comes from the pipeline config.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
            <Bar dataKey="cached" stackId="a" fill="var(--color-cached)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="network" stackId="a" fill="var(--color-network)" radius={[4, 4, 0, 0]} />
            <ChartTooltip
              content={<ChartTooltipContent labelKey="pipeline" indicator="line" />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
