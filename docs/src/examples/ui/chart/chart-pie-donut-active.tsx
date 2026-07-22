"use client";

import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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

export const description = "A registry composition donut chart with an active sector";

const chartData = [
  { category: "forms", components: 12, fill: "var(--color-forms)" },
  { category: "overlays", components: 9, fill: "var(--color-overlays)" },
  { category: "data", components: 8, fill: "var(--color-data)" },
  { category: "navigation", components: 7, fill: "var(--color-navigation)" },
  { category: "other", components: 11, fill: "var(--color-other)" },
];

const chartConfig = {
  components: {
    label: "Components",
  },
  forms: {
    label: "Forms",
    color: "var(--chart-1)",
  },
  overlays: {
    label: "Overlays",
    color: "var(--chart-2)",
  },
  data: {
    label: "Data",
    color: "var(--chart-3)",
  },
  navigation: {
    label: "Navigation",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function ChartPieDonutActive() {
  return (
    <Card className="flex flex-col bg-secondary-background text-foreground">
      <CardHeader className="items-center pb-0">
        <CardTitle>Composition - Active</CardTitle>
        <CardDescription>Forms highlighted within the 47-component catalog</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              defaultIndex={0}
              active
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="components"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none font-medium">Catalog composition by category</div>
        <div className="leading-none">Source-owned registry components</div>
      </CardFooter>
    </Card>
  );
}
