import { Code2 } from "lucide-react";

import { type ChartExample, charts } from "@/data/charts";

import { Pre } from "@/components/app/pre";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ChartGroup = {
  index: string;
  id: string;
  title: string;
  description: string;
  canvasClassName: string;
  items: {
    name: string;
    className?: string;
  }[];
};

const chartGroups: ChartGroup[] = [
  {
    index: "00",
    id: "examples",
    title: "Registry pulse",
    description:
      "A quick read on release activity, catalog coverage, and the current component mix.",
    canvasClassName: "md:grid-cols-2 xl:grid-cols-12",
    items: [
      {
        name: "ChartAreaStacked",
        className: "md:col-span-2 xl:col-span-12",
      },
      { name: "ChartBarMultiple", className: "xl:col-span-7" },
      { name: "ChartPieDonutText", className: "xl:col-span-5" },
    ],
  },
  {
    index: "01",
    id: "area-chart",
    title: "Release activity",
    description:
      "Install and update momentum across recent releases, from single series to interactive ranges.",
    canvasClassName: "md:grid-cols-2 xl:grid-cols-3",
    items: [
      {
        name: "ChartAreaInteractive",
        className: "md:col-span-2 xl:col-span-3",
      },
      { name: "ChartAreaDefault" },
      { name: "ChartAreaLinear" },
      { name: "ChartAreaStep" },
      {
        name: "ChartAreaStackedExpand",
        className: "md:col-span-2 xl:col-span-2",
      },
      { name: "ChartAreaLegend" },
      { name: "ChartAreaAxes", className: "md:col-span-2 xl:col-span-2" },
      { name: "ChartAreaIcons", className: "md:col-span-2 xl:col-span-1" },
    ],
  },
  {
    index: "02",
    id: "bar-chart",
    title: "Catalog coverage",
    description:
      "Compare source-owned components, recipes, additions, and removals across the registry catalog.",
    canvasClassName: "md:grid-cols-2 2xl:grid-cols-4",
    items: [
      {
        name: "ChartBarInteractive",
        className: "md:col-span-2 2xl:col-span-4",
      },
      { name: "ChartBarHorizontal", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartBarDefault" },
      { name: "ChartBarLabel" },
      { name: "ChartBarActive" },
      { name: "ChartBarNegative" },
      { name: "ChartBarStacked", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartBarLabelCustom", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartBarMixed", className: "md:col-span-2 2xl:col-span-2" },
    ],
  },
  {
    index: "03",
    id: "line-chart",
    title: "Build performance",
    description:
      "Track cold and cached build times through the registry pipeline and over recent daily runs.",
    canvasClassName: "md:grid-cols-2 xl:grid-cols-3",
    items: [
      {
        name: "ChartLineInteractive",
        className: "md:col-span-2 xl:col-span-3",
      },
      { name: "ChartLineMultiple", className: "md:col-span-2 xl:col-span-2" },
      { name: "ChartLineDefault" },
      { name: "ChartLineLinear" },
      { name: "ChartLineStep" },
      { name: "ChartLineDots" },
      { name: "ChartLineDotsCustom", className: "md:col-span-2 xl:col-span-2" },
      { name: "ChartLineDotsColors" },
      { name: "ChartLineLabel" },
      { name: "ChartLineLabelCustom", className: "md:col-span-2 xl:col-span-2" },
    ],
  },
  {
    index: "04",
    id: "pie-chart",
    title: "Registry composition",
    description:
      "Inspect how the 47 source-owned components are distributed across practical UI categories.",
    canvasClassName: "md:grid-cols-2 2xl:grid-cols-4",
    items: [
      { name: "ChartPieStacked", className: "md:col-span-2 2xl:col-span-4" },
      { name: "ChartPieSimple", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartPieLegend", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartPieDonut", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartPieLabel" },
      { name: "ChartPieLabelCustom" },
      { name: "ChartPieLabelList", className: "md:col-span-2 2xl:col-span-2" },
      { name: "ChartPieDonutActive", className: "md:col-span-2 2xl:col-span-2" },
    ],
  },
  {
    index: "05",
    id: "tooltip",
    title: "Install diagnostics",
    description:
      "Different tooltip treatments for cached and network work at each install pipeline stage.",
    canvasClassName: "md:grid-cols-2 xl:grid-cols-3",
    items: [
      {
        name: "ChartTooltipAdvanced",
        className: "md:col-span-2 xl:col-span-3",
      },
      { name: "ChartTooltipFormatter", className: "md:col-span-2 xl:col-span-2" },
      { name: "ChartTooltipDefault" },
      { name: "ChartTooltipIndicatorLine" },
      { name: "ChartTooltipIndicatorNone" },
      { name: "ChartTooltipIcons" },
      { name: "ChartTooltipLabelCustom" },
      { name: "ChartTooltipLabelFormatter" },
      { name: "ChartTooltipLabelNone", className: "md:col-span-2 xl:col-span-1" },
    ],
  },
];

export default function Examples() {
  return (
    <div className="space-y-20 pb-8 sm:space-y-24">
      {chartGroups.map((group) => (
        <section
          id={group.id}
          className="grid scroll-mt-24 gap-8 border-t-2 border-border pt-7 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:gap-10 lg:pt-9 xl:gap-14"
          key={group.id}
        >
          <header className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-xs font-bold uppercase">
              Series {group.index} / {String(group.items.length).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-heading text-2xl sm:text-3xl">{group.title}</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-foreground/80">
              {group.description}
            </p>
          </header>

          <div
            className={`grid min-w-0 grid-flow-dense items-stretch gap-6 ${group.canvasClassName}`}
          >
            {group.items.map((item) => {
              const chart = charts.find((candidate) => candidate.name === item.name);
              if (!chart) return null;

              return (
                <div
                  className={item.className ? `h-full min-w-0 ${item.className}` : "h-full min-w-0"}
                  key={item.name}
                >
                  <ChartComponent chart={chart}>
                    <chart.component />
                  </ChartComponent>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function ChartComponent({ children, chart }: { children: React.ReactNode; chart: ChartExample }) {
  const { code, name } = chart;

  return (
    <div className="flex h-full min-w-0 flex-col [&>[data-slot=card]]:flex-1">
      {children}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-5 w-full" variant="outline">
            <Code2 />
            View source
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%_-_2rem)] max-w-5xl">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>
              Self-contained example using the neobrutal-ui chart primitive.
            </DialogDescription>
          </DialogHeader>
          <Pre wrapperClassName="w-full max-w-full overflow-x-auto text-white" __rawstring__={code}>
            {code}
          </Pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
