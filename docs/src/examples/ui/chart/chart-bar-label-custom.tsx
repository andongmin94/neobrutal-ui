"use client";

import { LibraryBig } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

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

export const description = "A registry bar chart with custom labels";

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
  label: {
    color: "var(--main-foreground)",
  },
} satisfies ChartConfig;

export default function ChartBarLabelCustom() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>Registry Catalog - Custom Labels</CardTitle>
        <CardDescription>Published components with category labels</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="registry" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="registry" fill="var(--color-registry)" radius={4}>
              <LabelList
                dataKey="category"
                position="insideLeft"
                offset={8}
                fill="var(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="registry"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          44 components published to the registry <LibraryBig className="h-4 w-4" />
        </div>
        <div className="leading-none">Category and registry values are labeled directly</div>
      </CardFooter>
    </Card>
  );
}
