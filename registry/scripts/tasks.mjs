import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const command = process.argv[2];
const passthroughArgs = process.argv.slice(3);
const sourceTargets = ["src", "scripts"];
const formatTargets = [
  "--no-error-on-unmatched-pattern",
  ...sourceTargets,
  "tsconfig.json",
  "tsconfig.consumer.json",
  "package.json",
  ".oxlintrc.json",
  ".oxfmtrc.json",
];

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

  if (result.status !== 0) process.exit(result.status ?? 1);
}

function spawnArgs(executable, args) {
  if (process.platform !== "win32") return [executable, args, {}];
  return [[executable, ...args].map(quoteCmdArg).join(" "), [], { shell: true }];
}

function quoteCmdArg(value) {
  if (/^[\w./:\\-]+$/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function generateRegistry(args = []) {
  run("tsx", ["src/scripts/generate-registry-json.ts", ...args]);
}

function normalizeRegistryOutput(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      normalizeRegistryOutput(filePath);
      continue;
    }

    if (!entry.isFile() || path.extname(entry.name) !== ".json") continue;

    const normalized = fs
      .readFileSync(filePath, "utf8")
      .replaceAll("\\r\\n", "\\n")
      .replaceAll("\r\n", "\n");
    fs.writeFileSync(filePath, normalized.trimEnd(), "utf8");
  }
}

function buildRegistry() {
  const publicDirectory = path.join(root, "public");
  const outputDirectory = path.join(publicDirectory, "r");

  fs.rmSync(outputDirectory, { force: true, recursive: true });
  run("shadcn", ["build", "--output", "public/r"]);
  normalizeRegistryOutput(outputDirectory);
  fs.mkdirSync(publicDirectory, { recursive: true });
  fs.copyFileSync(path.join(root, "index.html"), path.join(publicDirectory, "index.html"));
}

function syncDocsPublic() {
  run("tsx", ["src/scripts/sync-docs-public.ts"]);
}

function lintSources() {
  run("oxlint", ["--no-error-on-unmatched-pattern", ...sourceTargets]);
  run("oxfmt", ["--check", ...formatTargets]);
}

function formatSources() {
  run("oxlint", ["--fix", "--no-error-on-unmatched-pattern", ...sourceTargets]);
  run("oxfmt", ["--write", ...formatTargets]);
}

switch (command) {
  case "dev":
    run("vite", ["--host", "127.0.0.1", ...passthroughArgs]);
    break;
  case "build":
    generateRegistry(passthroughArgs);
    buildRegistry();
    syncDocsPublic();
    break;
  case "format":
    formatSources();
    break;
  case "lint":
    lintSources();
    break;
  case "registry:validate":
    run("shadcn", ["registry", "validate", "./registry.json", ...passthroughArgs]);
    break;
  case "registry:check":
    run("node", ["scripts/check-source-ownership.mjs"]);
    run("node", ["scripts/check-registry.mjs", ...passthroughArgs]);
    break;
  case "consumer:verify":
    run("node", ["scripts/verify-consumer.mjs", ...passthroughArgs]);
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
  case "typecheck":
    run("tsc", ["--project", "tsconfig.json", ...passthroughArgs]);
    run("tsc", ["--project", "tsconfig.consumer.json", ...passthroughArgs]);
    break;
  default:
    console.error(`Unknown task: ${command ?? "(missing)"}`);
    process.exit(1);
}
