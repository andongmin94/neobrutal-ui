import fs from "fs";
import path from "path";

import colors from "@/data/colors";
import { createThemeCssVars } from "@/data/theme";

const DEFAULT_REGISTRY_BASE_URL = "https://neobrutal-ui.andongmin.com";
const registryBaseUrl = (process.env.REGISTRY_BASE_URL || DEFAULT_REGISTRY_BASE_URL).replace(
  /\/$/,
  "",
);
const registryOutputDirectory = path.join(process.cwd(), "public", "r");
const baseItem = JSON.parse(
  fs.readFileSync(path.join(registryOutputDirectory, "neobrutal-ui.json"), "utf8"),
) as {
  dependencies?: string[];
  registryDependencies?: string[];
};

// First create all styles
const STYLES = colors.map((color) => ({
  name: `neobrutal-${color.name}`,
  type: "registry:style",
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  title: `Neobrutal ${color.name.charAt(0).toUpperCase() + color.name.slice(1)}`,
  author: "andongmin94",
  cssVars: createThemeCssVars(color),
  extends: "none",
  description: "A modern neobrutalist style preset for neobrutal-ui.",
  dependencies: baseItem.dependencies,
  registryDependencies: baseItem.registryDependencies,
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
const dir = path.join(registryOutputDirectory, "styling");
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
