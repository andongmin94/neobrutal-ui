"use client";

import { Bar, BarChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Install pipeline timings with a calculated total";

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
  },
  network: {
    label: "Network",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ChartTooltipAdvanced() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Install Timing - Total</CardTitle>
        <CardDescription>Detailed stage timing with a calculated total.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
            <Bar dataKey="cached" stackId="a" fill="var(--color-cached)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="network" stackId="a" fill="var(--color-network)" radius={[4, 4, 0, 0]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[180px]"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 border border-border rounded-[2px] bg-(--color-bg)"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label || name}
                      <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                        {value}
                        <span className="font-normal">ms</span>
                      </div>
                      {/* Show the stage total after the final series. */}
                      {index === 1 && (
                        <div className="text-foreground mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium">
                          Total
                          <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                            {item.payload.cached + item.payload.network}
                            <span className="font-normal">ms</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                />
              }
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
