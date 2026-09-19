import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalogPath = path.join(root, "registry.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const managedDirectories = ["src/components/ui", "src/blocks/templates"];
const managedFiles = new Set(["src/hooks/use-mobile.ts", "src/lib/blog-posts.ts"]);
const ownersBySourcePath = new Map();
const errors = [];

for (const item of catalog.items ?? []) {
  for (const file of item.files ?? []) {
    if (typeof file.path !== "string") continue;

    const sourcePath = normalizeSourcePath(file.path);
    if (!isManagedSource(sourcePath)) continue;

    const owners = ownersBySourcePath.get(sourcePath) ?? [];
    owners.push(item.name);
    ownersBySourcePath.set(sourcePath, owners);
  }
}

const installableSources = new Set(managedFiles);
for (const directory of managedDirectories) {
  const absoluteDirectory = path.join(root, directory);
  if (!fs.existsSync(absoluteDirectory)) {
    errors.push(`${directory}: managed source directory is missing`);
    continue;
  }
  collectFiles(absoluteDirectory, installableSources);
}

for (const sourcePath of installableSources) {
  const absolutePath = path.join(root, sourcePath);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    errors.push(`${sourcePath}: managed installable source is missing`);
    continue;
  }

  const owners = [...new Set(ownersBySourcePath.get(sourcePath) ?? [])];
  if (owners.length === 0) {
    errors.push(`${sourcePath}: installable source is not owned by a registry item`);
  } else if (owners.length > 1) {
    errors.push(`${sourcePath}: installable source is owned by ${owners.join(", ")}`);
  }
}

for (const [sourcePath, owners] of ownersBySourcePath) {
  if (!installableSources.has(sourcePath)) {
    errors.push(
      `${sourcePath}: registry item ${owners.join(", ")} references a missing managed source`,
    );
  }
}

if (errors.length > 0) {
  console.error(`Installable source ownership check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Installable source ownership check passed for ${installableSources.size} source files.`,
);

function normalizeSourcePath(sourcePath) {
  return path.posix.normalize(sourcePath.replaceAll("\\", "/"));
}

function isManagedSource(sourcePath) {
  return (
    managedFiles.has(sourcePath) ||
    managedDirectories.some(
      (directory) => sourcePath === directory || sourcePath.startsWith(`${directory}/`),
    )
  );
}

function collectFiles(directory, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(absolutePath, files);
    } else if (entry.isFile()) {
      files.add(path.relative(root, absolutePath).replaceAll("\\", "/"));
    }
  }
}
