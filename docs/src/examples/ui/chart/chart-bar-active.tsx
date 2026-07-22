"use client";

import { LibraryBig } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";

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

export const description = "A registry bar chart with an active category";

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

export default function ChartBarActive() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Catalog - Active</CardTitle>
        <CardDescription>Active category inspection for published components</CardDescription>
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
              tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={2}
              active
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="registry"
              strokeWidth={2}
              radius={8}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    className="!stroke-4"
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Navigation is selected for comparison <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">44 components across six catalog categories</div>
      </CardFooter>
    </Card>
  );
}
