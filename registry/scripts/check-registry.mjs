import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registryItemSchema } from "shadcn/schema";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDirectory = path.join(root, "public", "r");
const catalogPath = path.join(outputDirectory, "registry.json");
const errors = [];

if (!fs.existsSync(catalogPath)) {
  throw new Error(`Registry output is missing: ${catalogPath}. Run npm run build first.`);
}

const catalog = readJson(catalogPath);
const catalogItems = Array.isArray(catalog.items) ? catalog.items : [];
const itemNames = new Set(catalogItems.map((item) => item.name));
const items = new Map();

for (const catalogItem of catalogItems) {
  const itemPath = path.join(outputDirectory, `${catalogItem.name}.json`);
  if (!fs.existsSync(itemPath)) {
    errors.push(`${catalogItem.name}: generated item JSON is missing`);
    continue;
  }

  const item = readJson(itemPath);
  items.set(catalogItem.name, item);
  checkItemSchemaAndDependencies(`${catalogItem.name}.json`, item);

  if (typeof catalogItem.description !== "string" || !catalogItem.description.trim()) {
    errors.push(`${catalogItem.name}: description is required for catalog discovery`);
  }
  if (!Array.isArray(catalogItem.categories) || catalogItem.categories.length === 0) {
    errors.push(`${catalogItem.name}: at least one category is required for catalog discovery`);
  }
  if ((catalogItem.files ?? []).some((file) => Object.hasOwn(file, "content"))) {
    errors.push(`${catalogItem.name}: catalog files must omit content for Registry Directory use`);
  }
  for (const dependency of catalogItem.dependencies ?? []) {
    if (!hasVersionRange(dependency)) {
      errors.push(
        `${catalogItem.name}: npm dependency ${dependency} must declare a compatible version`,
      );
    }
  }
}

const duplicateNames = findDuplicates(catalogItems.map((item) => item.name));
for (const name of duplicateNames) {
  errors.push(`${name}: duplicate catalog name`);
}

const ownersByInstalledPath = new Map();
for (const [name, item] of items) {
  for (const file of item.files ?? []) {
    const installedPath = getInstalledPath(file);
    const owners = ownersByInstalledPath.get(installedPath) ?? [];
    owners.push(name);
    ownersByInstalledPath.set(installedPath, owners);
  }
}

checkThemeContract();

for (const [installedPath, owners] of ownersByInstalledPath) {
  const uniqueOwners = [...new Set(owners)];
  if (uniqueOwners.length > 1) {
    errors.push(`${installedPath}: duplicate install target owned by ${uniqueOwners.join(", ")}`);
  }
}

for (const [name, item] of items) {
  checkLocalRegistryDependencies(name, item);
  const closure = resolveLocalClosure(name);
  const installedModules = new Set();

  for (const dependencyName of closure) {
    const dependency = items.get(dependencyName);
    for (const file of dependency?.files ?? []) {
      installedModules.add(toModulePath(getInstalledPath(file)));
    }
  }

  for (const file of item.files ?? []) {
    for (const importedModule of findLocalImports(file.content)) {
      if (isConsumerInfrastructure(importedModule)) continue;

      const modulePath = importedModule.slice(2);
      if (!hasInstalledModule(installedModules, modulePath)) {
        errors.push(
          `${name}: ${getInstalledPath(file)} imports ${importedModule}, but its local dependency closure does not install it`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Registry consistency check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Registry consistency check passed for ${items.size} items and ${ownersByInstalledPath.size} install targets.`,
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function checkThemeContract() {
  const base = items.get("neobrutal-ui");
  const yellowStylePath = path.join(outputDirectory, "styling", "yellow.json");

  if (!base?.cssVars || !fs.existsSync(yellowStylePath)) {
    errors.push("theme: base or yellow style CSS variables are missing");
    return;
  }

  const yellowStyle = readJson(yellowStylePath);
  if (stableJson(base.cssVars) !== stableJson(yellowStyle.cssVars)) {
    errors.push("theme: the base item and yellow style must publish identical CSS variables");
  }

  for (const entry of fs.readdirSync(path.join(outputDirectory, "styling"))) {
    if (!entry.endsWith(".json")) continue;
    const style = readJson(path.join(outputDirectory, "styling", entry));
    checkItemSchemaAndDependencies(`styling/${entry}`, style);
    const cssVars = style.cssVars;

    if (cssVars?.light?.["secondary-background"] !== "oklch(100% 0 0)") {
      errors.push(`${style.name}: light secondary-background must be the light surface`);
    }
    if (cssVars?.dark?.["secondary-background"] !== "oklch(23.93% 0 0)") {
      errors.push(`${style.name}: dark secondary-background must be the dark surface`);
    }
    if (
      cssVars?.theme?.["font-weight-base"] !== "var(--base-font-weight)" ||
      cssVars?.theme?.["font-weight-heading"] !== "var(--heading-font-weight)"
    ) {
      errors.push(`${style.name}: font weight tokens must use the configurable CSS variables`);
    }
    if (!cssVars?.light?.["base-font-weight"] || !cssVars?.light?.["heading-font-weight"]) {
      errors.push(`${style.name}: default font weight CSS variables are missing`);
    }
  }
}

function checkItemSchemaAndDependencies(label, item) {
  const result = registryItemSchema.safeParse(item);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "item"}: ${issue.message}`)
      .join("; ");
    errors.push(`${label}: invalid registry item (${issues})`);
  }

  for (const dependency of item.dependencies ?? []) {
    if (!hasVersionRange(dependency)) {
      errors.push(`${label}: npm dependency ${dependency} must declare a compatible version`);
    }
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

function hasVersionRange(dependency) {
  if (dependency.startsWith("@")) {
    return dependency.indexOf("@", dependency.indexOf("/") + 1) !== -1;
  }
  return dependency.includes("@");
}

function getInstalledPath(file) {
  const source = file.target ?? file.path.replace(/^src[\\/]/, "");
  return source
    .replace(/^~[\\/]/, "")
    .replace(/^@(components|ui|lib|hooks)[\\/]/, (_, alias) =>
      alias === "ui" ? "components/ui/" : `${alias}/`,
    )
    .replaceAll("\\", "/");
}

function toModulePath(filePath) {
  return filePath.replace(/\.(?:[cm]?[jt]sx?|json)$/, "").replace(/\/index$/, "");
}

function findLocalImports(content) {
  if (typeof content !== "string") return [];

  const imports = new Set();
  const pattern = /(?:\bfrom\s*|\b(?:import|require)\s*\(\s*|\bimport\s*)["'](@\/[^"']+)["']/g;
  for (const match of content.matchAll(pattern)) imports.add(match[1]);
  return imports;
}

function isConsumerInfrastructure(importedModule) {
  return importedModule === "@/lib/utils";
}

function hasInstalledModule(installedModules, modulePath) {
  return (
    installedModules.has(modulePath) || installedModules.has(modulePath.replace(/\/index$/, ""))
  );
}

function getLocalDependencyName(dependency) {
  if (typeof dependency !== "string") return undefined;
  if (itemNames.has(dependency)) return dependency;

  try {
    const url = new URL(dependency);
    const registryPath = getLocalRegistryPath(url);
    if (!registryPath || registryPath.includes("/")) return undefined;
    const name = registryPath.replace(/\.json$/, "");
    return itemNames.has(name) ? name : undefined;
  } catch {
    const name = path.posix.basename(dependency.replaceAll("\\", "/")).replace(/\.json$/, "");
    return itemNames.has(name) ? name : undefined;
  }
}

function checkLocalRegistryDependencies(ownerName, item) {
  for (const dependency of item.registryDependencies ?? []) {
    if (typeof dependency !== "string") continue;

    try {
      const url = new URL(dependency);
      const registryPath = getLocalRegistryPath(url);
      if (!registryPath) continue;

      const dependencyPath = path.resolve(outputDirectory, registryPath);
      const isInsideOutput = dependencyPath.startsWith(
        `${path.resolve(outputDirectory)}${path.sep}`,
      );
      if (
        !isInsideOutput ||
        !fs.existsSync(dependencyPath) ||
        !fs.statSync(dependencyPath).isFile()
      ) {
        errors.push(`${ownerName}: local registry dependency ${dependency} does not exist`);
      }
    } catch {
      // Bare names can refer either to this catalog or to the built-in shadcn registry.
    }
  }
}

function getLocalRegistryPath(url) {
  if (typeof catalog.homepage !== "string") return undefined;

  try {
    const homepage = new URL(catalog.homepage);
    const basePath = homepage.pathname.replace(/\/$/, "");
    const registryPathPrefix = `${basePath}/r/`.replace(/\/+/g, "/");
    if (url.origin !== homepage.origin || !url.pathname.startsWith(registryPathPrefix)) {
      return undefined;
    }
    return decodeURIComponent(url.pathname.slice(registryPathPrefix.length));
  } catch {
    return undefined;
  }
}

function resolveLocalClosure(rootName) {
  const resolved = new Set();
  const visiting = new Set();

  function visit(name) {
    if (resolved.has(name)) return;
    if (visiting.has(name)) {
      errors.push(`${rootName}: local registry dependency cycle includes ${name}`);
      return;
    }

    visiting.add(name);
    const item = items.get(name);
    for (const dependency of item?.registryDependencies ?? []) {
      const dependencyName = getLocalDependencyName(dependency);
      if (dependencyName) visit(dependencyName);
    }
    visiting.delete(name);
    resolved.add(name);
  }

  visit(rootName);
  return resolved;
}
