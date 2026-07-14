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

export const description = "A registry composition pie chart with custom labels";

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

export default function ChartPieLabelCustom() {
  return (
    <Card className="flex flex-col bg-secondary-background text-foreground">
      <CardHeader className="items-center pb-0">
        <CardTitle>Composition - Values</CardTitle>
        <CardDescription>Direct component counts without leader lines</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] px-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="components" hideLabel />} />
            <Pie
              data={chartData}
              dataKey="components"
              labelLine={false}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="hsla(var(--foreground))"
                  >
                    {payload.components}
                  </text>
                );
              }}
              nameKey="category"
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
