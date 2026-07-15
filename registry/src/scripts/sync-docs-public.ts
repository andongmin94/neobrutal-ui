import fs from "fs";
import path from "path";

const sourceDir = path.resolve(process.cwd(), "public", "r");
const sourceUiDir = path.resolve(process.cwd(), "src", "components", "ui");
const sourceTemplatesDir = path.resolve(process.cwd(), "src", "blocks", "templates");
const docsRootDir = path.resolve(process.cwd(), "..", "docs");
const docsPublicDir = path.resolve(process.cwd(), "..", "docs", "public");
const docsSourceDir = path.resolve(process.cwd(), "..", "docs", "src");
const docsTemplatesDir = path.join(docsSourceDir, "components", "templates");
const docsUiDir = path.join(docsSourceDir, "components", "ui");
const syncManifestPath = path.join(docsRootDir, ".registry-sync-manifest.json");
const targetDir = path.join(docsPublicDir, "r");
const templateFiles = [
  "blog-post-template.tsx",
  "blog-template.tsx",
  "cms-template.tsx",
  "link-hub-template.tsx",
  "portfolio-template.tsx",
];
const sharedFiles = [
  {
    source: path.resolve(process.cwd(), "src", "lib", "blog-posts.ts"),
    target: path.join(docsSourceDir, "lib", "blog-posts.ts"),
  },
  {
    source: path.resolve(process.cwd(), "src", "lib", "utils.ts"),
    target: path.join(docsSourceDir, "lib", "utils.ts"),
  },
  {
    source: path.resolve(process.cwd(), "src", "hooks", "use-mobile.ts"),
    target: path.join(docsSourceDir, "hooks", "use-mobile.ts"),
  },
  {
    source: path.resolve(process.cwd(), "src", "data", "colors.ts"),
    target: path.join(docsSourceDir, "data", "colors.ts"),
  },
];

type SyncManifest = {
  version: 1;
  ui: string[];
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

if (!fs.existsSync(docsPublicDir)) {
  throw new Error(`Docs public directory does not exist: ${docsPublicDir}`);
}

fs.rmSync(targetDir, { force: true, recursive: true });
fs.mkdirSync(docsPublicDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Synced registry output to: ${targetDir}`);

const syncedUiFileCount = syncRegistryUiFiles();

console.log(`Synced ${syncedUiFileCount} registry UI components to: ${docsUiDir}`);

fs.mkdirSync(docsTemplatesDir, { recursive: true });

const expectedTemplateFiles = new Set(templateFiles);

for (const entry of fs.readdirSync(docsTemplatesDir, { withFileTypes: true })) {
  if (
    entry.isFile() &&
    entry.name.endsWith("-template.tsx") &&
    !expectedTemplateFiles.has(entry.name)
  ) {
    fs.rmSync(path.join(docsTemplatesDir, entry.name));
  }
}

for (const fileName of templateFiles) {
  const sourceFile = path.join(sourceTemplatesDir, fileName);
  syncFile(sourceFile, path.join(docsTemplatesDir, fileName));
}

console.log(`Synced template components to: ${docsTemplatesDir}`);

for (const file of sharedFiles) {
  syncFile(file.source, file.target);
}

console.log(`Synced shared registry files to: ${docsSourceDir}`);
