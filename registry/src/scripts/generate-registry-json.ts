import * as fs from "fs";
import * as path from "path";

import REGISTRY from "@/data/registry";

const DEFAULT_REGISTRY_BASE_URL = "https://neobrutal-ui.andongmin.com";
const registryBaseUrl = (process.env.REGISTRY_BASE_URL || DEFAULT_REGISTRY_BASE_URL).replace(
  /\/$/,
  "",
);

const BASE_UI_COMPONENTS = new Set([
  "accordion",
  "alert-dialog",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "nbutton",
  "checkbox",
  "collapsible",
  "context-menu",
  "dialog",
  "ndialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "ninput",
  "label",
  "nlabel",
  "menubar",
  "navigation-menu",
  "popover",
  "progress",
  "radio-group",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "nsheet",
  "sidebar",
  "slider",
  "switch",
  "tabs",
  "tooltip",
  "ntooltip",
]);

const BASE_ITEM = {
  name: "neobrutal-ui",
  title: "neobrutal-ui",
  type: "registry:base",
  extends: "none",
  author: "andongmin94",
  description: "Base UI powered neobrutalist design-system base.",
  config: {
    style: "neobrutal-ui",
    iconLibrary: "lucide",
    rsc: true,
    tsx: true,
    tailwind: {
      baseColor: "neutral",
      css: "src/index.css",
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
  },
  dependencies: [
    "@base-ui/react",
    "shadcn",
    "tw-animate-css",
    "class-variance-authority",
    "lucide-react",
  ],
  registryDependencies: ["utils"],
  cssVars: {
    light: {
      background: "oklch(96.79% 0.0654 102.26)",
      foreground: "oklch(0% 0 0)",
      card: "oklch(96.79% 0.0654 102.26)",
      "card-foreground": "oklch(0% 0 0)",
      popover: "oklch(96.79% 0.0654 102.26)",
      "popover-foreground": "oklch(0% 0 0)",
      primary: "oklch(86.03% 0.176 92.36)",
      "primary-foreground": "oklch(0% 0 0)",
      secondary: "oklch(23.93% 0 0)",
      "secondary-foreground": "oklch(100% 0 0)",
      muted: "oklch(23.93% 0 0)",
      "muted-foreground": "oklch(100% 0 0)",
      accent: "oklch(86.03% 0.176 92.36)",
      "accent-foreground": "oklch(0% 0 0)",
      destructive: "oklch(63.68% 0.2078 25.33)",
      border: "oklch(0% 0 0)",
      input: "oklch(0% 0 0)",
      ring: "oklch(0% 0 0)",
      main: "oklch(86.03% 0.176 92.36)",
      "main-foreground": "oklch(0% 0 0)",
      "secondary-background": "oklch(23.93% 0 0)",
      overlay: "rgba(0, 0, 0, 0.8)",
      shadow: "4px 4px 0px 0px var(--border)",
      radius: "5px",
      "chart-1": "#FACC00",
      "chart-2": "#7A83FF",
      "chart-3": "#FF4D50",
      "chart-4": "#00D696",
      "chart-5": "#0099FF",
      sidebar: "oklch(96.79% 0.0654 102.26)",
      "sidebar-foreground": "oklch(0% 0 0)",
      "sidebar-primary": "oklch(86.03% 0.176 92.36)",
      "sidebar-primary-foreground": "oklch(0% 0 0)",
      "sidebar-accent": "oklch(23.93% 0 0)",
      "sidebar-accent-foreground": "oklch(100% 0 0)",
      "sidebar-border": "oklch(0% 0 0)",
      "sidebar-ring": "oklch(0% 0 0)",
    },
    dark: {
      background: "oklch(29.28% 0.0373 94.38)",
      foreground: "oklch(92.49% 0 0)",
      card: "oklch(29.28% 0.0373 94.38)",
      "card-foreground": "oklch(92.49% 0 0)",
      popover: "oklch(29.28% 0.0373 94.38)",
      "popover-foreground": "oklch(92.49% 0 0)",
      primary: "oklch(79.36% 0.1624 92.49)",
      "primary-foreground": "oklch(0% 0 0)",
      secondary: "oklch(100% 0 0)",
      "secondary-foreground": "oklch(0% 0 0)",
      muted: "oklch(100% 0 0)",
      "muted-foreground": "oklch(0% 0 0)",
      accent: "oklch(79.36% 0.1624 92.49)",
      "accent-foreground": "oklch(0% 0 0)",
      destructive: "oklch(63.68% 0.2078 25.33)",
      border: "oklch(0% 0 0)",
      input: "oklch(100% 0 0)",
      ring: "oklch(100% 0 0)",
      main: "oklch(79.36% 0.1624 92.49)",
      "main-foreground": "oklch(0% 0 0)",
      "secondary-background": "oklch(100% 0 0)",
      overlay: "rgba(0, 0, 0, 0.8)",
      shadow: "4px 4px 0px 0px var(--border)",
      radius: "5px",
      "chart-1": "#E0B700",
      "chart-2": "#7A83FF",
      "chart-3": "#FF6669",
      "chart-4": "#00BD84",
      "chart-5": "#008AE5",
      sidebar: "oklch(29.28% 0.0373 94.38)",
      "sidebar-foreground": "oklch(92.49% 0 0)",
      "sidebar-primary": "oklch(79.36% 0.1624 92.49)",
      "sidebar-primary-foreground": "oklch(0% 0 0)",
      "sidebar-accent": "oklch(100% 0 0)",
      "sidebar-accent-foreground": "oklch(0% 0 0)",
      "sidebar-border": "oklch(0% 0 0)",
      "sidebar-ring": "oklch(100% 0 0)",
    },
    theme: {
      "color-background": "var(--background)",
      "color-foreground": "var(--foreground)",
      "color-card": "var(--card)",
      "color-card-foreground": "var(--card-foreground)",
      "color-popover": "var(--popover)",
      "color-popover-foreground": "var(--popover-foreground)",
      "color-primary": "var(--primary)",
      "color-primary-foreground": "var(--primary-foreground)",
      "color-secondary": "var(--secondary)",
      "color-secondary-foreground": "var(--secondary-foreground)",
      "color-muted": "var(--muted)",
      "color-muted-foreground": "var(--muted-foreground)",
      "color-accent": "var(--accent)",
      "color-accent-foreground": "var(--accent-foreground)",
      "color-destructive": "var(--destructive)",
      "color-border": "var(--border)",
      "color-input": "var(--input)",
      "color-ring": "var(--ring)",
      "color-main": "var(--main)",
      "color-main-foreground": "var(--main-foreground)",
      "color-secondary-background": "var(--secondary-background)",
      "color-overlay": "var(--overlay)",
      "color-chart-1": "var(--chart-1)",
      "color-chart-2": "var(--chart-2)",
      "color-chart-3": "var(--chart-3)",
      "color-chart-4": "var(--chart-4)",
      "color-chart-5": "var(--chart-5)",
      "color-sidebar": "var(--sidebar)",
      "color-sidebar-foreground": "var(--sidebar-foreground)",
      "color-sidebar-primary": "var(--sidebar-primary)",
      "color-sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
      "color-sidebar-accent": "var(--sidebar-accent)",
      "color-sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
      "color-sidebar-border": "var(--sidebar-border)",
      "color-sidebar-ring": "var(--sidebar-ring)",
      "shadow-shadow": "var(--shadow)",
      "radius-base": "5px",
      "radius-sm": "calc(var(--radius) * 0.6)",
      "radius-md": "calc(var(--radius) * 0.8)",
      "radius-lg": "var(--radius)",
      "radius-xl": "calc(var(--radius) * 1.4)",
      "radius-2xl": "calc(var(--radius) * 1.8)",
      "radius-3xl": "calc(var(--radius) * 2.2)",
      "radius-4xl": "calc(var(--radius) * 2.6)",
      "font-weight-base": "500",
      "font-weight-heading": "700",
    },
  },
  css: {
    '@import "tw-animate-css"': {},
    '@import "shadcn/tailwind.css"': {},
    "@layer base": {
      "*": {
        "@apply border-border outline-ring/50": {},
      },
      body: {
        "@apply bg-background text-foreground": {},
      },
    },
  },
};

type RegistryItem = {
  name: string;
  author?: string;
  dependencies?: string[];
  registryDependencies?: string[];
};

function rewriteRegistryDependency(dependency: string) {
  if (/^https?:\/\//.test(dependency)) {
    return dependency;
  }

  return `${registryBaseUrl}/r/${dependency.replace(/\.json$/, "")}.json`;
}

function rewriteDependencies(item: RegistryItem): string[] | undefined {
  const dependencies = new Set(
    (item.dependencies ?? []).map((dependency) =>
      dependency.startsWith("react-day-picker@") ? "react-day-picker" : dependency,
    ),
  );

  if (BASE_UI_COMPONENTS.has(item.name)) {
    dependencies.add("@base-ui/react");
  }

  return dependencies.size ? [...dependencies] : undefined;
}

function rewriteRegistryItem<T extends RegistryItem>(item: T) {
  return {
    ...item,
    author: item.author ?? "andongmin94",
    dependencies: rewriteDependencies(item),
    registryDependencies: item.registryDependencies?.map(rewriteRegistryDependency),
  };
}

// Read the existing registry.json to preserve metadata
const registryPath = path.join(process.cwd(), "registry.json");
const existingRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

// Update only the items array while preserving other fields
const updatedRegistry = {
  ...existingRegistry,
  name: "neobrutal-ui",
  homepage: registryBaseUrl,
  author: "andongmin94",
  items: [BASE_ITEM, ...REGISTRY.map(rewriteRegistryItem)],
};

// Convert to JSON string with proper formatting
const registryJson = JSON.stringify(updatedRegistry, null, 2);

// Write the updated JSON file
fs.writeFileSync(registryPath, registryJson);

console.log(`Registry JSON file updated at: ${registryPath}`);
