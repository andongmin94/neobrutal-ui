import * as fs from "fs";
import * as path from "path";

import REGISTRY from "@/data/registry";
import colors from "@/data/colors";
import { themeCss } from "@/data/theme-styles";
import { createThemeCssVars, defaultColor } from "@/data/theme";

const DEFAULT_REGISTRY_BASE_URL = "https://neobrutal-ui.andongmin.com";
const registryBaseUrl = (process.env.REGISTRY_BASE_URL || DEFAULT_REGISTRY_BASE_URL).replace(
  /\/$/,
  "",
);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const dependencyVersions = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const BASE_UI_COMPONENTS = new Set([
  "accordion",
  "alert-dialog",
  "avatar",
  "breadcrumb",
  "button",
  "checkbox",
  "collapsible",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "menubar",
  "navigation-menu",
  "popover",
  "progress",
  "radio-group",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "slider",
  "switch",
  "tabs",
  "tooltip",
]);

const BASE_ITEM = {
  name: "neobrutal-ui",
  title: "neobrutal-ui",
  type: "registry:base",
  extends: "none",
  author: "andongmin94",
  description: "Base UI powered neobrutalist design-system base.",
  categories: ["design-system", "theme"],
  config: {
    style: "neobrutal-ui",
    iconLibrary: "lucide",
    rsc: true,
    tsx: true,
    tailwind: {
      baseColor: "neutral",
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
  ].map(pinDependency),
  registryDependencies: ["utils"],
  cssVars: createThemeCssVars(defaultColor),
  css: themeCss,
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
  const dependencies = new Set((item.dependencies ?? []).map(pinDependency));

  if (BASE_UI_COMPONENTS.has(item.name)) {
    dependencies.add(pinDependency("@base-ui/react"));
  }

  return dependencies.size ? [...dependencies] : undefined;
}

function pinDependency(dependency: string) {
  const packageName = getPackageName(dependency);
  const version = dependencyVersions[packageName];

  if (!version) {
    throw new Error(
      `Registry dependency ${packageName} must be declared in registry/package.json to pin its compatible version.`,
    );
  }

  return `${packageName}@${version}`;
}

function getPackageName(dependency: string) {
  if (dependency.startsWith("@")) {
    const versionSeparator = dependency.indexOf("@", dependency.indexOf("/") + 1);
    return versionSeparator === -1 ? dependency : dependency.slice(0, versionSeparator);
  }

  const versionSeparator = dependency.indexOf("@");
  return versionSeparator === -1 ? dependency : dependency.slice(0, versionSeparator);
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
  items: [
    BASE_ITEM,
    ...REGISTRY.map(rewriteRegistryItem),
    ...colors.map((color) => ({
      name: `theme-${color.name}`,
      title: `Neobrutal ${color.name.charAt(0).toUpperCase() + color.name.slice(1)}`,
      type: "registry:style",
      author: "andongmin94",
      description: `The ${color.name} light and dark theme for neobrutal-ui.`,
      categories: ["design-system", "theme"],
      extends: "none",
      dependencies: BASE_ITEM.dependencies,
      registryDependencies: BASE_ITEM.registryDependencies,
      cssVars: createThemeCssVars(color),
      css: BASE_ITEM.css,
    })),
  ],
};

// Convert to JSON string with proper formatting
const registryJson = JSON.stringify(updatedRegistry, null, 2);

// Write the updated JSON file
fs.writeFileSync(registryPath, registryJson);

console.log(`Registry JSON file updated at: ${registryPath}`);
