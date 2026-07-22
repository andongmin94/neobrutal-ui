"use client";

import { LibraryBig } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A stacked catalog coverage chart with a legend";

const chartData = [
  { category: "Forms", registry: 12, recipes: 8 },
  { category: "Overlays", registry: 9, recipes: 7 },
  { category: "Navigation", registry: 7, recipes: 5 },
  { category: "Data", registry: 8, recipes: 6 },
  { category: "Feedback", registry: 4, recipes: 3 },
  { category: "Layout", registry: 4, recipes: 2 },
];

const chartConfig = {
  registry: {
    label: "Registry",
    color: "var(--chart-1)",
  },
  recipes: {
    label: "Recipes",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ChartBarStacked() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Catalog Coverage - Stacked + Legend</CardTitle>
        <CardDescription>Combined registry and recipe coverage by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={{ fill: "#8080804D" }}
              content={<ChartTooltipContent hideLabel />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="registry"
              stackId="a"
              fill="var(--color-registry)"
              radius={[0, 0, 4, 4]}
            />
            <Bar dataKey="recipes" stackId="a" fill="var(--color-recipes)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          75 entries across both catalog collections <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">44 registry components and 31 recipes</div>
      </CardFooter>
    </Card>
  );
}
