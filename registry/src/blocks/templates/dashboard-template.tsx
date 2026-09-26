"use client";

import { CheckCheck, Layers, RotateCcw, Search } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

type Task = {
  id: string;
  title: string;
  project: string;
  owner: string;
  done: boolean;
};

type StatusFilter = "all" | "open" | "done";

const INITIAL_TASKS: Task[] = [
  {
    id: "brief",
    title: "Finalize the product brief",
    project: "Website refresh",
    owner: "You",
    done: true,
  },
  {
    id: "pages",
    title: "Build the core pages",
    project: "Website refresh",
    owner: "You",
    done: false,
  },
  {
    id: "content",
    title: "Review launch content",
    project: "Website refresh",
    owner: "Maya",
    done: false,
  },
  {
    id: "audit",
    title: "Audit existing components",
    project: "Design system",
    owner: "Leo",
    done: true,
  },
  {
    id: "forms",
    title: "Document form patterns",
    project: "Design system",
    owner: "You",
    done: false,
  },
  {
    id: "interviews",
    title: "Complete customer interviews",
    project: "Customer research",
    owner: "Maya",
    done: true,
  },
  {
    id: "findings",
    title: "Share research findings",
    project: "Customer research",
    owner: "Leo",
    done: false,
  },
];

const PROJECTS = ["Website refresh", "Design system", "Customer research"];
const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Done", value: "done" },
];

export default function DashboardTemplate() {
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [feedback, setFeedback] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const fieldId = React.useId();

  const completeCount = tasks.filter((task) => task.done).length;
  const openCount = tasks.length - completeCount;
  const completion = Math.round((completeCount / tasks.length) * 100);
  const activeProjects = PROJECTS.filter((project) =>
    tasks.some((task) => task.project === project && !task.done),
  ).length;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.done === (statusFilter === "done");
    return (
      matchesStatus &&
      `${task.title} ${task.project} ${task.owner}`.toLowerCase().includes(normalizedQuery)
    );
  });

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    searchRef.current?.focus();
  };

  const resetDemo = () => {
    setTasks(INITIAL_TASKS);
    clearFilters();
    setFeedback("Sample tasks restored. All filters cleared.");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex min-h-16 max-w-screen-xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 font-heading">
            <span className="grid size-8 place-items-center rounded-base border-2 border-border bg-main text-main-foreground">
              <Layers aria-hidden="true" className="size-4" />
            </span>
            Workroom
          </div>
          <Badge variant="neutral">Demo workspace</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl space-y-7 px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-xs font-heading uppercase tracking-widest text-foreground/70">
              Workspace overview
            </p>
            <h1 className="mt-2 text-3xl font-heading tracking-tight sm:text-4xl">
              Make room for good work.
            </h1>
            <p className="mt-3 text-sm leading-6 text-foreground/70">
              Your projects, priorities, and progress in one place. Check off a task to see the
              whole workspace update.
            </p>
          </div>
          <Button type="button" variant="neutral" onClick={resetDemo}>
            <RotateCcw aria-hidden="true" />
            Reset demo
          </Button>
        </div>

        <dl className="grid overflow-hidden rounded-base border-2 border-border bg-secondary-background sm:grid-cols-3">
          {[
            {
              label: "Active projects",
              value: activeProjects,
              detail: `${PROJECTS.length} projects in this workspace`,
            },
            {
              label: "Open tasks",
              value: openCount,
              detail: `${completeCount} of ${tasks.length} tasks complete`,
            },
            { label: "Completion", value: `${completion}%`, detail: "Across all projects" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="border-b-2 border-border p-5 last:border-b-0 sm:border-r-2 sm:border-b-0 sm:last:border-r-0"
            >
              <dt className="text-sm text-foreground/70">{metric.label}</dt>
              <dd className="mt-2 text-4xl font-heading tabular-nums">{metric.value}</dd>
              <dd className="mt-2 text-xs text-foreground/60">{metric.detail}</dd>
            </div>
          ))}
        </dl>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <section
            aria-labelledby={`${fieldId}-work-heading`}
            className="min-w-0 overflow-hidden rounded-base border-2 border-border bg-secondary-background"
          >
            <div className="space-y-4 border-b-2 border-border p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id={`${fieldId}-work-heading`} className="text-lg font-heading">
                  Your work
                </h2>
                <p className="text-xs text-foreground/70" role="status">
                  {filteredTasks.length} of {tasks.length} tasks
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${fieldId}-search`} className="block text-sm font-heading">
                  Find a task
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/60"
                  />
                  <Input
                    ref={searchRef}
                    id={`${fieldId}-search`}
                    type="search"
                    className="pl-9"
                    placeholder="Task, project, or person"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </div>

              <div
                role="group"
                aria-label="Filter tasks by status"
                className="grid grid-cols-3 overflow-hidden rounded-base border-2 border-border"
              >
                {FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={statusFilter === filter.value}
                    className={`relative min-h-10 border-r-2 border-border px-2 text-sm font-heading outline-none last:border-r-0 focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring ${statusFilter === filter.value ? "bg-main text-main-foreground" : "bg-secondary-background text-foreground hover:bg-background"}`}
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length ? (
              <ul>
                {filteredTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start gap-3 border-b-2 border-border px-4 py-4 last:border-b-0 sm:px-5"
                  >
                    <Checkbox
                      id={`${fieldId}-${task.id}`}
                      checked={task.done}
                      className="mt-1 size-5"
                      onCheckedChange={(done) => {
                        setTasks((current) =>
                          current.map((item) => (item.id === task.id ? { ...item, done } : item)),
                        );
                        setFeedback(`${task.title} marked ${done ? "done" : "open"}.`);
                        if (statusFilter !== "all") searchRef.current?.focus();
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`${fieldId}-${task.id}`}
                        className={`block cursor-pointer text-sm font-heading leading-6 ${task.done ? "text-foreground/60 line-through" : ""}`}
                      >
                        {task.title}
                      </label>
                      <p className="mt-1 text-xs leading-5 text-foreground/60">
                        {task.project} <span aria-hidden="true">/</span> {task.owner}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid justify-items-center gap-3 px-5 py-12 text-center">
                <Search aria-hidden="true" className="size-6 text-foreground/60" />
                <h3 className="font-heading">No matching tasks</h3>
                <p className="max-w-xs text-sm leading-6 text-foreground/70">
                  Try a different search or clear the filters to see all your work.
                </p>
                <Button type="button" variant="neutral" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section
              aria-labelledby={`${fieldId}-projects-heading`}
              className="rounded-base border-2 border-border bg-secondary-background"
            >
              <div className="border-b-2 border-border p-5">
                <h2 id={`${fieldId}-projects-heading`} className="text-lg font-heading">
                  Project progress
                </h2>
                <p className="mt-1 text-xs leading-5 text-foreground/60">
                  All tasks, regardless of the current filters.
                </p>
              </div>
              <div className="divide-y-2 divide-border">
                {PROJECTS.map((project) => {
                  const projectTasks = tasks.filter((task) => task.project === project);
                  const doneCount = projectTasks.filter((task) => task.done).length;
                  return (
                    <div key={project} className="space-y-2 p-5">
                      <Progress value={Math.round((doneCount / projectTasks.length) * 100)}>
                        <ProgressLabel>{project}</ProgressLabel>
                        <ProgressValue />
                      </Progress>
                      <p className="text-xs text-foreground/60">
                        {doneCount} of {projectTasks.length} tasks complete
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="border-l-4 border-main py-1 pl-4">
              <CheckCheck aria-hidden="true" className="mb-2 size-5" />
              <h2 className="text-sm font-heading">
                {openCount ? "One task at a time." : "Everything is wrapped up."}
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                {openCount
                  ? `${openCount} tasks left across ${activeProjects} projects. A small next step moves the whole team forward.`
                  : "Every project is complete. Reset the demo to explore the workflow again."}
              </p>
            </div>
          </aside>
        </div>

        <footer className="space-y-2 border-t-2 border-border pt-4 text-xs leading-5 text-foreground/70">
          <p>Sample workspace. Changes stay on this page and reset when you refresh.</p>
          <p role="status" className="min-h-5 text-foreground">
            {feedback}
          </p>
        </footer>
      </main>
    </div>
  );
}
