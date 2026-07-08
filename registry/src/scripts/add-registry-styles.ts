import fs from "fs";
import path from "path";

import colors from "@/data/colors";

const DEFAULT_REGISTRY_BASE_URL = "https://neobrutal-ui.andongmin.com";
const registryBaseUrl = (process.env.REGISTRY_BASE_URL || DEFAULT_REGISTRY_BASE_URL).replace(
  /\/$/,
  "",
);

function createCssVars(color: (typeof colors)[number]) {
  return {
    dark: {
      background: color.darkBg,
      "secondary-background": "oklch(100% 0 0)",
      main: color.darkMain,
      ring: "oklch(100% 0 0)",
      foreground: "oklch(92.49% 0 0)",
      "main-foreground": "oklch(0% 0 0)",
      border: "oklch(0% 0 0)",
      input: "oklch(100% 0 0)",
      overlay: "rgba(0, 0, 0, 0.8)",
      shadow: "4px 4px 0px 0px var(--border)",
      card: color.darkBg,
      "card-foreground": "oklch(92.49% 0 0)",
      popover: color.darkBg,
      "popover-foreground": "oklch(92.49% 0 0)",
      primary: color.darkMain,
      "primary-foreground": "oklch(0% 0 0)",
      secondary: "oklch(100% 0 0)",
      "secondary-foreground": "oklch(0% 0 0)",
      muted: "oklch(100% 0 0)",
      "muted-foreground": "oklch(0% 0 0)",
      accent: color.darkMain,
      "accent-foreground": "oklch(0% 0 0)",
      destructive: "oklch(63.68% 0.2078 25.33)",
      "chart-1": color.darkMain,
      "chart-2": "oklch(100% 0 0)",
      "chart-3": "oklch(75% 0 0)",
      "chart-4": "oklch(55% 0 0)",
      "chart-5": "oklch(35% 0 0)",
      radius: "5px",
      sidebar: color.darkBg,
      "sidebar-foreground": "oklch(92.49% 0 0)",
      "sidebar-primary": color.darkMain,
      "sidebar-primary-foreground": "oklch(0% 0 0)",
      "sidebar-accent": "oklch(100% 0 0)",
      "sidebar-accent-foreground": "oklch(0% 0 0)",
      "sidebar-border": "oklch(0% 0 0)",
      "sidebar-ring": "oklch(100% 0 0)",
    },
    light: {
      background: color.bg,
      "secondary-background": "oklch(23.93% 0 0)",
      main: color.main,
      ring: "oklch(0% 0 0)",
      foreground: "oklch(0% 0 0)",
      "main-foreground": "oklch(0% 0 0)",
      border: "oklch(0% 0 0)",
      input: "oklch(0% 0 0)",
      overlay: "rgba(0, 0, 0, 0.8)",
      shadow: "4px 4px 0px 0px var(--border)",
      card: color.bg,
      "card-foreground": "oklch(0% 0 0)",
      popover: color.bg,
      "popover-foreground": "oklch(0% 0 0)",
      primary: color.main,
      "primary-foreground": "oklch(0% 0 0)",
      secondary: "oklch(23.93% 0 0)",
      "secondary-foreground": "oklch(100% 0 0)",
      muted: "oklch(23.93% 0 0)",
      "muted-foreground": "oklch(100% 0 0)",
      accent: color.main,
      "accent-foreground": "oklch(0% 0 0)",
      destructive: "oklch(63.68% 0.2078 25.33)",
      "chart-1": color.main,
      "chart-2": "oklch(23.93% 0 0)",
      "chart-3": "oklch(45% 0 0)",
      "chart-4": "oklch(65% 0 0)",
      "chart-5": "oklch(85% 0 0)",
      radius: "5px",
      sidebar: color.bg,
      "sidebar-foreground": "oklch(0% 0 0)",
      "sidebar-primary": color.main,
      "sidebar-primary-foreground": "oklch(0% 0 0)",
      "sidebar-accent": "oklch(23.93% 0 0)",
      "sidebar-accent-foreground": "oklch(100% 0 0)",
      "sidebar-border": "oklch(0% 0 0)",
      "sidebar-ring": "oklch(0% 0 0)",
    },
    theme: {
      "color-main": "var(--main)",
      "color-background": "var(--background)",
      "color-secondary-background": "var(--secondary-background)",
      "color-foreground": "var(--foreground)",
      "color-main-foreground": "var(--main-foreground)",
      "color-border": "var(--border)",
      "color-input": "var(--input)",
      "color-ring": "var(--ring)",
      "color-overlay": "var(--overlay)",
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
      "spacing-boxShadowX": "4px",
      "spacing-boxShadowY": "4px",
      "spacing-reverseBoxShadowX": "-4px",
      "spacing-reverseBoxShadowY": "-4px",
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
      "shadow-shadow": "var(--shadow)",
    },
  };
}

// First create all styles
const STYLES = colors.map((color) => ({
  name: `neobrutal-${color.name}`,
  type: "registry:style",
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  title: `Neobrutal ${color.name.charAt(0).toUpperCase() + color.name.slice(1)}`,
  author: "andongmin94",
  cssVars: createCssVars(color),
  extends: "none",
  description: "A modern neobrutalist style preset for neobrutal-ui.",
  dependencies: [
    "@base-ui/react",
    "shadcn",
    "tw-animate-css",
    "class-variance-authority",
    "lucide-react",
  ],
  registryDependencies: ["utils"],
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
  meta: {
    registryBaseUrl,
  },
}));

// Create directory if it doesn't exist
const dir = path.join(process.cwd(), "public", "r", "styling");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write all styles to files
STYLES.forEach((style) => {
  fs.writeFileSync(
    path.join(dir, `${style.name.replace("neobrutal-", "")}.json`),
    JSON.stringify(style, null, 2),
  );
});
