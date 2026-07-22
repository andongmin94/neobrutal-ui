"use client";

import { CloudDownload, HardDrive } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Install pipeline timings with source icons";

const chartData = [
  { stage: "Resolve", cached: 118, network: 310 },
  { stage: "Fetch", cached: 92, network: 420 },
  { stage: "Write", cached: 148, network: 265 },
  { stage: "Merge", cached: 76, network: 188 },
  { stage: "Format", cached: 104, network: 236 },
  { stage: "Verify", cached: 84, network: 172 },
];

const chartConfig = {
  cached: {
    label: "Cached",
    color: "var(--chart-1)",
    icon: HardDrive,
  },
  network: {
    label: "Network",
    color: "var(--chart-2)",
    icon: CloudDownload,
  },
} satisfies ChartConfig;

export default function ChartTooltipIcons() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Install Timing - Sources</CardTitle>
        <CardDescription>Icons distinguish cached and network work.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
            <Bar dataKey="cached" stackId="a" fill="var(--color-cached)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="network" stackId="a" fill="var(--color-network)" radius={[4, 4, 0, 0]} />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
