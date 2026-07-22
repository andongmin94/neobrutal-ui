"use client";

import { Pie, PieChart } from "recharts";

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

export const description = "A registry composition pie chart with labels";

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

export default function ChartPieLabel() {
  return (
    <Card className="flex flex-col bg-secondary-background text-foreground">
      <CardHeader className="items-center pb-0">
        <CardTitle>Composition - Labels</CardTitle>
        <CardDescription>Category totals shown on every sector</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="components" label nameKey="category" />
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
