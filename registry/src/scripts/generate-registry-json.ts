import fs from "node:fs";
import path from "node:path";

import colors from "@/data/colors";
import REGISTRY from "@/data/registry";
import { themeCss } from "@/data/theme-styles";
import { createThemeCssVars, defaultColor } from "@/data/theme";

const DEFAULT_REGISTRY_BASE_URL = "https://neobrutal-ui.andongmin.com";
const registryBaseUrl = new URL(process.env.REGISTRY_BASE_URL || DEFAULT_REGISTRY_BASE_URL)
  .toString()
  .replace(/\/$/, "");
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
  files?: { path: string }[];
};

function rewriteRegistryDependency(dependency: string) {
  if (/^https?:\/\//.test(dependency)) return dependency;
  return `${registryBaseUrl}/r/${dependency.replace(/\.json$/, "")}.json`;
}

function rewriteDependencies(item: RegistryItem): string[] | undefined {
  if (
    (item.dependencies ?? []).some((dependency) => getPackageName(dependency) === "@base-ui/react")
  ) {
    throw new Error(`${item.name}: Base UI dependencies are derived from source imports.`);
  }

  const dependencies = new Set((item.dependencies ?? []).map(pinDependency));

  if (itemImportsPackage(item, "@base-ui/react")) {
    dependencies.add(pinDependency("@base-ui/react"));
  }

  return dependencies.size ? [...dependencies] : undefined;
}

function itemImportsPackage(item: RegistryItem, packageName: string) {
  return (item.files ?? []).some((file) => {
    const sourcePath = path.resolve(process.cwd(), file.path);
    const source = fs.readFileSync(sourcePath, "utf8");
    return source.includes(`"${packageName}`) || source.includes(`'${packageName}`);
  });
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

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
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
const registryPath = path.join(process.cwd(), "registry.json");

fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Registry JSON file updated at: ${registryPath}`);
