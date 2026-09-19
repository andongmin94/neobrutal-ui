import REGISTRY from "@/data/registry";
import { serializeThemeVariables } from "@/data/theme-styles";
import fs from "node:fs";
import path from "node:path";

const sourceDir = path.resolve(process.cwd(), "public", "r");
const sourceUiDir = path.resolve(process.cwd(), "src", "components", "ui");
const docsRootDir = path.resolve(process.cwd(), "..", "docs");
const docsPublicDir = path.join(docsRootDir, "public");
const docsSourceDir = path.join(docsRootDir, "src");
const docsTemplatesDir = path.join(docsSourceDir, "components", "templates");
const docsUiDir = path.join(docsSourceDir, "components", "ui");
const syncManifestPath = path.join(docsRootDir, ".registry-sync-manifest.json");
const targetDir = path.join(docsPublicDir, "r");
const sharedFiles = [
  ...["theme.ts", "theme-styles.ts"].map((name) => ({
    source: path.join(process.cwd(), "src", "data", name),
    target: path.join(docsSourceDir, "data", name),
  })),
  {
    source: path.join(process.cwd(), "src", "lib", "blog-posts.ts"),
    target: path.join(docsSourceDir, "lib", "blog-posts.ts"),
  },
  {
    source: path.join(process.cwd(), "src", "lib", "utils.ts"),
    target: path.join(docsSourceDir, "lib", "utils.ts"),
  },
  {
    source: path.join(process.cwd(), "src", "hooks", "use-mobile.ts"),
    target: path.join(docsSourceDir, "hooks", "use-mobile.ts"),
  },
  {
    source: path.join(process.cwd(), "src", "data", "colors.ts"),
    target: path.join(docsSourceDir, "data", "colors.ts"),
  },
];

type SyncManifest = {
  version: 1;
  ui: string[];
};

type RegistryFile = {
  path: string;
  target?: string;
};

function getRegistryUiFiles() {
  const files: string[] = [];

  function visit(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.isFile()) {
        files.push(path.relative(sourceUiDir, absolutePath).replaceAll("\\", "/"));
      }
    }
  }

  visit(sourceUiDir);

  return files.sort();
}

function getTemplateFiles() {
  const targets = new Map<string, string>();

  for (const item of REGISTRY.filter((entry) => entry.categories.includes("template"))) {
    for (const file of item.files as RegistryFile[]) {
      if (!file.target?.startsWith("@components/templates/")) continue;

      const source = path.resolve(process.cwd(), file.path);
      const target = path.join(docsSourceDir, file.target.replace(/^@components\//, "components/"));
      const existing = targets.get(target);

      if (existing && existing !== source) {
        throw new Error(`Multiple registry files target the same docs path: ${file.target}`);
      }

      targets.set(target, source);
    }
  }

  return [...targets.entries()]
    .map(([target, source]) => ({ source, target }))
    .sort((a, b) => a.target.localeCompare(b.target));
}

function readSyncManifest(): SyncManifest {
  if (!fs.existsSync(syncManifestPath)) {
    return { version: 1, ui: [] };
  }

  const value = JSON.parse(fs.readFileSync(syncManifestPath, "utf8")) as Partial<SyncManifest>;

  if (
    value.version !== 1 ||
    !Array.isArray(value.ui) ||
    !value.ui.every((filePath) => typeof filePath === "string")
  ) {
    throw new Error(`Invalid registry sync manifest: ${syncManifestPath}`);
  }

  return { version: 1, ui: Array.from(new Set(value.ui)).sort() };
}

function resolveManagedPath(root: string, relativePath: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(root, relativePath);

  if (!resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Managed path escapes its root: ${relativePath}`);
  }

  return resolvedPath;
}

function syncFile(source: string, target: string) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source file does not exist: ${source}`);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function syncRegistryUiFiles() {
  const registryUiFiles = getRegistryUiFiles();
  const currentFiles = new Set(registryUiFiles);
  const previousManifest = readSyncManifest();

  for (const relativePath of previousManifest.ui) {
    if (!currentFiles.has(relativePath)) {
      fs.rmSync(resolveManagedPath(docsUiDir, relativePath), { force: true });
    }
  }

  for (const relativePath of registryUiFiles) {
    syncFile(
      resolveManagedPath(sourceUiDir, relativePath),
      resolveManagedPath(docsUiDir, relativePath),
    );
  }

  const nextManifest: SyncManifest = {
    version: 1,
    ui: registryUiFiles,
  };
  fs.writeFileSync(syncManifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");

  return registryUiFiles.length;
}

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Registry output does not exist: ${sourceDir}`);
}

fs.mkdirSync(docsPublicDir, { recursive: true });
fs.rmSync(targetDir, { force: true, recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Synced registry output to: ${targetDir}`);

const syncedUiFileCount = syncRegistryUiFiles();
console.log(`Synced ${syncedUiFileCount} registry UI components to: ${docsUiDir}`);

const templateFiles = getTemplateFiles();
const expectedTemplateTargets = new Set(templateFiles.map(({ target }) => path.resolve(target)));
fs.mkdirSync(docsTemplatesDir, { recursive: true });

for (const entry of fs.readdirSync(docsTemplatesDir, { withFileTypes: true })) {
  const target = path.resolve(docsTemplatesDir, entry.name);
  if (
    entry.isFile() &&
    entry.name.endsWith("-template.tsx") &&
    !expectedTemplateTargets.has(target)
  ) {
    fs.rmSync(target);
  }
}

for (const file of templateFiles) syncFile(file.source, file.target);
console.log(`Synced ${templateFiles.length} template components to: ${docsTemplatesDir}`);

for (const file of sharedFiles) syncFile(file.source, file.target);
console.log(`Synced shared registry files to: ${docsSourceDir}`);

const catalog = JSON.parse(fs.readFileSync(path.join(sourceDir, "registry.json"), "utf8")) as {
  items: { name: string; description: string }[];
};
const descriptions = Object.fromEntries(catalog.items.map((item) => [item.name, item.description]));
Object.assign(descriptions, {
  combobox: "A searchable option picker composed from a popover and command list.",
  "date-picker": "A calendar in a popover for choosing a single date or date range.",
});
fs.writeFileSync(
  path.join(docsSourceDir, "data", "component-descriptions.json"),
  `${JSON.stringify(descriptions, null, 2)}\n`,
);

fs.writeFileSync(path.join(docsSourceDir, "styling", "theme.css"), serializeThemeVariables());
