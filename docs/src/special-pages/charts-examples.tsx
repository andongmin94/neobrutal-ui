import { Code2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { type ChartExample, charts } from "@/data/charts";
import { Pre } from "@/components/docs/pre";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
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
      "Compare revenue with a plan, find conversion losses, and check a response-time budget.",
    items: ["ChartRevenueTarget", "ChartSignupConversion", "ChartServiceLatency"],
  },
  {
    id: "area-chart",
    title: "Release activity",
    description:
      "Switch between event counts and normalized shares without confusing volume with composition.",
    items: ["ChartReleaseActivity"],
  },
  {
    id: "bar-chart",
    title: "Delivery planning",
    description:
      "Compare planned and completed work, then inspect the signed difference around a real zero baseline.",
    items: ["ChartDeliveryCapacity"],
  },
  {
    id: "line-chart",
    title: "Build performance",
    description:
      "Compare paired cold and cached runs with an explicit duration budget and calculated time savings.",
    items: ["ChartBuildDuration"],
  },
  {
    id: "pie-chart",
    title: "Work allocation",
    description:
      "Inspect a workstream's hours and share while keeping the complete allocation visible.",
    items: ["ChartWorkAllocation"],
  },
  {
    id: "tooltip",
    title: "Install diagnostics",
    description:
      "Locate the slowest sequential stage and switch units consistently across the chart, summary, and data.",
    items: ["ChartInstallDiagnostics"],
  },
];

export default function Examples() {
  const [activeGroupId, setActiveGroupId] = useState(chartGroups[0].id);
  const activeGroup = chartGroups.find((group) => group.id === activeGroupId)!;

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
            Eight installable analytical recipes. Every chart pairs controls with calculated
            summaries and an exact data table. All data is illustrative, not live telemetry.
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
        <header className="mb-6 grid gap-3 md:grid-cols-2 md:items-end">
          <div>
            <p className="font-mono text-xs uppercase">
              {activeGroup.items.length} working recipes / Editable source
            </p>
            <h2 className="mt-2 text-2xl font-heading">{activeGroup.title}</h2>
          </div>
          <p className="text-sm leading-6 text-foreground/80">{activeGroup.description}</p>
        </header>
        <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-2">
          {activeGroup.items.map((name, index) => {
            const chart = charts.find((candidate) => candidate.name === name);
            if (!chart) throw new Error(`Missing chart recipe: ${name}`);
            return (
              <div className={index === 0 ? "min-w-0 xl:col-span-2" : "min-w-0"} key={name}>
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
      <a
        className={buttonVariants({ variant: "neutral", className: "mt-4 w-full" })}
        href={`/docs/${chart.registryName}`}
      >
        Install recipe
      </a>
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
              The same source delivered by the registry. Use Install recipe for setup and usage.
            </DialogDescription>
          </DialogHeader>
          <ChartSource name={chart.registryName} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChartSource({ name }: { name: string }) {
  const [source, setSource] = useState<{ code: string; highlightedCode: string }>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSource(undefined);
    setFailed(false);
    void fetch(`/chart-source/${name}.json`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Source request failed");
        const data = await response.json();
        if (typeof data.code !== "string" || typeof data.highlightedCode !== "string") {
          throw new Error("Invalid source response");
        }
        return data;
      })
      .then(setSource)
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [name, attempt]);

  if (failed) {
    return (
      <div role="alert" className="grid justify-items-start gap-3 py-6">
        <p>Could not load this source. Try again.</p>
        <Button variant="neutral" onClick={() => setAttempt((value) => value + 1)}>
          Retry source
        </Button>
      </div>
    );
  }
  if (!source) {
    return (
      <p role="status" className="py-6">
        Loading source…
      </p>
    );
  }

  return (
    <Pre
      className="shiki"
      wrapperClassName="w-full max-w-full overflow-x-auto"
      __rawstring__={source.code}
      dangerouslySetInnerHTML={{ __html: source.highlightedCode }}
    />
  );
}
