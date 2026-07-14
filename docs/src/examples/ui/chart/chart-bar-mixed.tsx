"use client";

import { LibraryBig } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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

export const description = "A mixed-color bar chart of registry components";

const chartData = [
  { category: "forms", registry: 12, fill: "var(--color-forms)" },
  { category: "overlays", registry: 9, fill: "var(--color-overlays)" },
  { category: "navigation", registry: 7, fill: "var(--color-navigation)" },
  { category: "data", registry: 8, fill: "var(--color-data)" },
  { category: "feedback", registry: 4, fill: "var(--color-feedback)" },
  { category: "layout", registry: 4, fill: "var(--color-layout)" },
];

const chartConfig = {
  registry: {
    label: "Registry",
  },
  forms: {
    label: "Forms",
    color: "var(--chart-1)",
  },
  overlays: {
    label: "Overlays",
    color: "var(--chart-2)",
  },
  navigation: {
    label: "Navigation",
    color: "var(--chart-3)",
  },
  data: {
    label: "Data",
    color: "var(--chart-4)",
  },
  feedback: {
    label: "Feedback",
    color: "var(--chart-5)",
  },
  layout: {
    label: "Layout",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChartBarMixed() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Catalog - Mixed</CardTitle>
        <CardDescription>Published components with category colors</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
            />
            <XAxis dataKey="registry" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="registry" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Forms has the deepest registry coverage <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">44 components across six catalog categories</div>
      </CardFooter>
    </Card>
  );
}
