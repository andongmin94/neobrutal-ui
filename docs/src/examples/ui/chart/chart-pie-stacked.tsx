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

export const description = "A stacked pie chart comparing registry composition";

const registryData = [
  { category: "forms", registry: 12, fill: "var(--color-forms)" },
  { category: "overlays", registry: 9, fill: "var(--color-overlays)" },
  { category: "data", registry: 8, fill: "var(--color-data)" },
  { category: "navigation", registry: 7, fill: "var(--color-navigation)" },
  { category: "other", registry: 11, fill: "var(--color-other)" },
];

const recipesData = [
  { category: "forms", recipes: 8, fill: "var(--color-forms)" },
  { category: "overlays", recipes: 7, fill: "var(--color-overlays)" },
  { category: "data", recipes: 6, fill: "var(--color-data)" },
  { category: "navigation", recipes: 5, fill: "var(--color-navigation)" },
  { category: "other", recipes: 7, fill: "var(--color-other)" },
];

const chartConfig = {
  components: {
    label: "Components",
  },
  registry: {
    label: "Registry",
  },
  recipes: {
    label: "Recipes",
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

export default function ChartPieStacked() {
  return (
    <Card className="flex flex-col bg-secondary-background text-foreground">
      <CardHeader className="items-center pb-0">
        <CardTitle>Registry vs. Recipes</CardTitle>
        <CardDescription>Catalog coverage compared across two rings</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="components"
                  nameKey="category"
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    return chartConfig[payload?.[0].dataKey as keyof typeof chartConfig].label;
                  }}
                />
              }
            />
            <Pie data={registryData} dataKey="registry" outerRadius={60} />
            <Pie data={recipesData} dataKey="recipes" innerRadius={70} outerRadius={90} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none font-medium">Registry and recipe catalog composition</div>
        <div className="leading-none">The same categories compared across both rings</div>
      </CardFooter>
    </Card>
  );
}
