import type { RegistryItem } from "shadcn/schema";

const definitions = [
  {
    name: "chart-revenue-target",
    title: "Revenue vs target",
    description: "Weekly revenue with period controls, target variance, and an exact data table.",
  },
  {
    name: "chart-signup-conversion",
    title: "Signup conversion",
    description: "Cohort conversion with stage losses, conversion rates, and an exact data table.",
  },
  {
    name: "chart-service-latency",
    title: "Response-time budget",
    description: "Daily p50 and p95 with service controls, budget breaches, and an exact data table.",
  },
  {
    name: "chart-release-activity",
    title: "Release adoption",
    description: "Install and update activity with count/share views, period controls, and exact values.",
  },
  {
    name: "chart-delivery-capacity",
    title: "Delivery capacity",
    description: "Planned and delivered work with team controls, signed variance, and exact values.",
  },
  {
    name: "chart-build-duration",
    title: "Build duration",
    description: "Paired cold and cached builds with series controls, time savings, and a budget.",
  },
  {
    name: "chart-work-allocation",
    title: "Work allocation",
    description: "Planned hours with period controls, a workstream inspector, and part-to-whole values.",
  },
  {
    name: "chart-install-diagnostics",
    title: "Installation trace",
    description: "Sequential install stages with environment controls, duration units, and stage shares.",
  },
];

const CHART_RECIPES = definitions.map((definition) => ({
  ...definition,
  categories: ["data-display", "data-visualization", "recipe"],
  type: "registry:component" as const,
  dependencies: ["recharts"],
  registryDependencies: ["chart", "card"],
  files: [{ path: `src/components/ui/${definition.name}.tsx`, type: "registry:ui" as const }],
})) satisfies RegistryItem[];

export default CHART_RECIPES;
