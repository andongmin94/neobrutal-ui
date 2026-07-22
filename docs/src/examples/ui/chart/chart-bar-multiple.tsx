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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple bar chart of catalog coverage";

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

export default function ChartBarMultiple() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Catalog Coverage - Multiple</CardTitle>
        <CardDescription>Registry and recipe coverage by category</CardDescription>
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="registry" fill="var(--color-registry)" radius={4} />
            <Bar dataKey="recipes" fill="var(--color-recipes)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Registry leads recipes by 13 entries <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">44 registry components and 31 recipes</div>
      </CardFooter>
    </Card>
  );
}
