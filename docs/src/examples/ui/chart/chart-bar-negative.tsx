"use client";

import { LibraryBig } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts";

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

export const description = "A bar chart of components added and removed by release";

const chartData = [
  { release: "v0.8", change: 6 },
  { release: "v0.9", change: 4 },
  { release: "v0.10", change: -2 },
  { release: "v0.11", change: 5 },
  { release: "v0.12", change: -1 },
  { release: "v0.13", change: 3 },
];

const chartConfig = {
  change: {
    label: "Added / Removed",
  },
} satisfies ChartConfig;

export default function ChartBarNegative() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Churn by Release</CardTitle>
        <CardDescription>Components added and removed in recent releases</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar className="[&_.recharts-text]:fill-foreground" dataKey="change">
              <LabelList position="top" dataKey="release" fillOpacity={1} />
              {chartData.map((item) => (
                <Cell
                  key={item.release}
                  fill={item.change > 0 ? "var(--chart-1)" : "var(--chart-2)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Net catalog growth: 15 components <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">18 added and 3 removed across six releases</div>
      </CardFooter>
    </Card>
  );
}
