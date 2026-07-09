import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const command = process.argv[2];
const passthroughArgs = process.argv.slice(3);

const alignSections = new Set(["scripts", "dependencies", "devDependencies"]);

function bin(name) {
  const executable = process.platform === "win32" ? `${name}.cmd` : name;
  const localBin = path.join(root, "node_modules", ".bin", executable);
  return fs.existsSync(localBin) ? localBin : name;
}

function run(name, args = []) {
  const executable = bin(name);
  const [spawnCommand, spawnCommandArgs, spawnOptions] = spawnArgs(executable, args);
  const result = spawnSync(spawnCommand, spawnCommandArgs, {
    cwd: root,
    stdio: "inherit",
    ...spawnOptions,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function spawnArgs(executable, args) {
  if (process.platform !== "win32") {
    return [executable, args, {}];
  }

  return [[executable, ...args].map(quoteCmdArg).join(" "), [], { shell: true }];
}

function quoteCmdArg(value) {
  if (/^[\w./:\\-]+$/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function generateRegistry() {
  run("tsx", ["src/scripts/generate-registry-json.ts", ...passthroughArgs]);
}

function buildRegistry() {
  run("shadcn", ["build", "--output", "public/r"]);
  run("tsx", ["src/scripts/add-registry-styles.ts"]);
}

function syncDocsPublic() {
  run("tsx", ["src/scripts/sync-docs-public.ts"]);
}

function formatPackageJson() {
  const packagePath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  fs.writeFileSync(packagePath, `${stringifyPackage(pkg)}\n`, "utf8");
}

function stringifyPackage(value) {
  return formatJsonValue(value, 0);
}

function formatJsonValue(value, indent, sectionName) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  const indentation = " ".repeat(indent);
  const childIndentation = " ".repeat(indent + 2);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    const items = value.map((item) => `${childIndentation}${formatJsonValue(item, indent + 2)}`);

    return `[\n${items.join(",\n")}\n${indentation}]`;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";

  const shouldAlign = alignSections.has(sectionName);
  const maxKeyLength = shouldAlign
    ? Math.max(...entries.map(([key]) => JSON.stringify(key).length))
    : 0;

  const lines = entries.map(([key, childValue]) => {
    const keyText = JSON.stringify(key);
    const padding = shouldAlign ? " ".repeat(maxKeyLength - keyText.length) : "";

    return `${childIndentation}${keyText}${padding}: ${formatJsonValue(
      childValue,
      indent + 2,
      key,
    )}`;
  });

  return `{\n${lines.join(",\n")}\n${indentation}}`;
}

function lint() {
  run("oxlint", ["--fix", "--no-error-on-unmatched-pattern", "src", "scripts"]);
  run("oxfmt", [
    "--write",
    "--no-error-on-unmatched-pattern",
    "src",
    "scripts",
    "tsconfig.json",
    ".oxlintrc.json",
    ".oxfmtrc.json",
    "package.json",
  ]);
  formatPackageJson();
}

switch (command) {
  case "dev":
    run("vite", ["--host", "127.0.0.1", ...passthroughArgs]);
    break;
  case "build":
    generateRegistry();
    buildRegistry();
    syncDocsPublic();
    break;
  case "lint":
    lint();
    break;
  case "registry:generate":
    generateRegistry();
    break;
  case "registry:build":
    buildRegistry();
    break;
  case "registry:sync-docs":
    syncDocsPublic();
    break;
  case "list":
    run("shadcn", [
      "list",
      "https://neobrutal-ui.andongmin.com/r/registry.json",
      ...passthroughArgs,
    ]);
    break;
  case "list:local":
    run("shadcn", ["list", "http://127.0.0.1:5177/r/registry.json", ...passthroughArgs]);
    break;
  default:
    console.error(`Unknown task: ${command ?? "(missing)"}`);
    process.exit(1);
}
