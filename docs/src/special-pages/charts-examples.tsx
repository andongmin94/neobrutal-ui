import { Code2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { type ChartExample, charts } from "@/data/charts";
import { Pre } from "@/components/docs/pre";
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
  id: string;
  title: string;
  description: string;
  items: string[];
};

const chartGroups: ChartGroup[] = [
  {
    id: "examples",
    title: "Decision workbench",
    description:
      "Start with a question. Compare a plan, locate a drop-off, or check a performance budget. Controls, summaries, and data tables stay in sync.",
    items: ["ChartRevenueTarget", "ChartSignupConversion", "ChartServiceLatency"],
  },
  {
    id: "area-chart",
    title: "Release activity",
    description:
      "Area patterns for change over time. Use stacked series for totals and normalized stacks for shares.",
    items: [
      "ChartAreaStacked",
      "ChartAreaInteractive",
      "ChartAreaDefault",
      "ChartAreaLinear",
      "ChartAreaStep",
      "ChartAreaStackedExpand",
      "ChartAreaLegend",
      "ChartAreaAxes",
      "ChartAreaIcons",
    ],
  },
  {
    id: "bar-chart",
    title: "Catalog coverage",
    description:
      "Bar patterns for comparing categories. Keep a common baseline and label what each quantity counts.",
    items: [
      "ChartBarMultiple",
      "ChartBarInteractive",
      "ChartBarHorizontal",
      "ChartBarDefault",
      "ChartBarLabel",
      "ChartBarActive",
      "ChartBarNegative",
      "ChartBarStacked",
      "ChartBarLabelCustom",
      "ChartBarMixed",
    ],
  },
  {
    id: "line-chart",
    title: "Build performance",
    description:
      "Line patterns for trends and comparisons. Distinguish series with dash styles as well as color.",
    items: [
      "ChartLineInteractive",
      "ChartLineMultiple",
      "ChartLineDefault",
      "ChartLineLinear",
      "ChartLineStep",
      "ChartLineDots",
      "ChartLineDotsCustom",
      "ChartLineDotsColors",
      "ChartLineLabel",
      "ChartLineLabelCustom",
    ],
  },
  {
    id: "pie-chart",
    title: "Registry composition",
    description:
      "Part-to-whole patterns with a small number of categories. Sample values are not the current registry inventory.",
    items: [
      "ChartPieDonutText",
      "ChartPieStacked",
      "ChartPieSimple",
      "ChartPieLegend",
      "ChartPieDonut",
      "ChartPieLabel",
      "ChartPieLabelCustom",
      "ChartPieLabelList",
      "ChartPieDonutActive",
    ],
  },
  {
    id: "tooltip",
    title: "Install diagnostics",
    description:
      "Tooltip patterns for names, units, and comparisons. Keep important conclusions visible without requiring a hover.",
    items: [
      "ChartTooltipAdvanced",
      "ChartTooltipFormatter",
      "ChartTooltipDefault",
      "ChartTooltipIndicatorLine",
      "ChartTooltipIndicatorNone",
      "ChartTooltipIcons",
      "ChartTooltipLabelCustom",
      "ChartTooltipLabelFormatter",
      "ChartTooltipLabelNone",
    ],
  },
];

export default function Examples() {
  const [activeGroupId, setActiveGroupId] = useState(chartGroups[0].id);
  const activeGroup = chartGroups.find((group) => group.id === activeGroupId) ?? chartGroups[0];

  useEffect(() => {
    const selectHashGroup = () => {
      const hash = window.location.hash.slice(1);
      if (chartGroups.some((group) => group.id === hash)) setActiveGroupId(hash);
    };
    selectHashGroup();
    window.addEventListener("hashchange", selectHashGroup);
    return () => window.removeEventListener("hashchange", selectHashGroup);
  }, []);

  return (
    <div className="pb-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest">
            Charts that answer questions
          </p>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            Three complete analytical recipes, followed by the building blocks to adapt them. All
            data is illustrative, not live business or registry telemetry.
          </p>
        </div>
        <a href="/docs/chart" className="text-sm font-heading underline underline-offset-4">
          Chart setup & API
        </a>
      </div>
      <nav aria-label="Chart series" className="border-y-2 border-border py-4">
        <div className="flex flex-wrap gap-3">
          {chartGroups.map((group, index) => (
            <Button
              key={group.id}
              type="button"
              size="sm"
              variant={group.id === activeGroup.id ? "default" : "neutral"}
              aria-pressed={group.id === activeGroup.id}
              onClick={() => {
                setActiveGroupId(group.id);
                window.history.replaceState(window.history.state, "", `#${group.id}`);
              }}
            >
              <span aria-hidden="true">{String(index).padStart(2, "0")}</span>
              {group.title}
            </Button>
          ))}
        </div>
      </nav>
      <section id={activeGroup.id} key={activeGroup.id} className="mt-8 scroll-mt-24">
        <header className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase">
              {activeGroup.items.length} working examples / Editable source
            </p>
            <h2 className="mt-2 text-2xl font-heading">{activeGroup.title}</h2>
          </div>
          <p className="text-sm leading-6 text-foreground/80">{activeGroup.description}</p>
        </header>
        <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-2">
          {activeGroup.items.map((name, index) => {
            const chart = charts.find((candidate) => candidate.name === name);
            if (!chart) throw new Error(`Missing chart example: ${name}`);
            const wide =
              name.includes("Interactive") || (activeGroup.id === "examples" && index === 0);
            return (
              <div className={wide ? "min-w-0 xl:col-span-2" : "min-w-0"} key={name}>
                <ChartComponent chart={chart}>
                  <chart.component />
                </ChartComponent>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ChartComponent({ children, chart }: { children: ReactNode; chart: ChartExample }) {
  return (
    <div className="flex h-full min-w-0 flex-col [&>[data-slot=card]]:flex-1">
      {children}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4 w-full" variant="outline">
            <Code2 aria-hidden="true" />
            View source
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%_-_2rem)] max-w-5xl">
          <DialogHeader>
            <DialogTitle>{chart.name}</DialogTitle>
            <DialogDescription>
              Complete example with sample data. Install Chart first, then copy and adapt this
              source.
            </DialogDescription>
          </DialogHeader>
          <Pre
            wrapperClassName="w-full max-w-full overflow-x-auto text-white"
            __rawstring__={chart.code}
          >
            {chart.code}
          </Pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
