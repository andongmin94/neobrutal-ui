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

function formatPackageJson() {
  const packagePath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  fs.writeFileSync(packagePath, `${stringifyPackage(pkg)}\n`, "utf8");
}

function generateDocsData() {
  run("tsx", ["src/scripts/generate-stars-ts.ts"]);
  run("tsx", ["src/scripts/generate-charts-ts.ts"]);
  run("oxfmt", ["--write", "src/data/stars.ts", "src/data/charts.ts"]);
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
  run("oxlint", [
    "--fix",
    "--no-error-on-unmatched-pattern",
    "src",
    "scripts",
    "next.config.mjs",
    "velite.config.ts",
  ]);
  run("oxfmt", [
    "--write",
    "--no-error-on-unmatched-pattern",
    "src",
    "scripts",
    "next.config.mjs",
    "velite.config.ts",
    "postcss.config.js",
    "tsconfig.json",
    ".oxlintrc.json",
    ".oxfmtrc.json",
    "package.json",
  ]);
  formatPackageJson();
}

switch (command) {
  case "dev":
    generateDocsData();
    run("next", ["dev", ...passthroughArgs]);
    break;
  case "build":
    generateDocsData();
    run("next", ["build", ...passthroughArgs]);
    break;
  case "start":
    run("next", ["start", ...passthroughArgs]);
    break;
  case "lint":
    lint();
    break;
  default:
    console.error(`Unknown task: ${command ?? "(missing)"}`);
    process.exit(1);
}
