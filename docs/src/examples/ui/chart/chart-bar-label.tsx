"use client";

import { LibraryBig } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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

export const description = "A registry bar chart with value labels";

const chartData = [
  { category: "Forms", registry: 12 },
  { category: "Overlays", registry: 9 },
  { category: "Navigation", registry: 7 },
  { category: "Data", registry: 8 },
  { category: "Feedback", registry: 4 },
  { category: "Layout", registry: 4 },
];

const chartConfig = {
  registry: {
    label: "Registry",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChartBarLabel() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Catalog - Labels</CardTitle>
        <CardDescription>Published components with value labels</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="registry" fill="var(--color-registry)" radius={8}>
              <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          44 components published to the registry <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">Values are labeled across six categories</div>
      </CardFooter>
    </Card>
  );
}
