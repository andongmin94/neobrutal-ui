import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const command = process.argv[2];
const passthroughArgs = process.argv.slice(3);
const sourceTargets = ["app", "src", "scripts", "tests"];
const formatTargets = [
  "--no-error-on-unmatched-pattern",
  ...sourceTargets,
  "react-router.config.ts",
  "vite.config.ts",
  "tsconfig.json",
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

function generateDocsData() {
  run("tsx", ["src/scripts/generate-stars-ts.ts"]);
  run("tsx", ["src/scripts/generate-charts-ts.ts"]);
}

function getBuildCommit() {
  for (const candidate of [process.env.VERCEL_GIT_COMMIT_SHA, process.env.GITHUB_SHA]) {
    if (candidate && /^[\da-f]{40}$/i.test(candidate)) return candidate.toLowerCase();
  }

  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: path.resolve(root, ".."),
    encoding: "utf8",
  });
  const candidate = result.status === 0 ? result.stdout.trim() : "";
  return /^[\da-f]{40}$/i.test(candidate) ? candidate.toLowerCase() : "local";
}

function writeBuildInfo() {
  const outputPath = path.join(root, "build", "client", "build-info.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ commit: getBuildCommit() }, null, 2)}\n`,
    "utf8",
  );
}

function lintSources() {
  run("oxlint", [
    "--deny-warnings",
    "--format",
    "unix",
    "--no-error-on-unmatched-pattern",
    ...sourceTargets,
  ]);
  run("oxfmt", ["--check", ...formatTargets]);
}

function formatSources() {
  run("oxlint", ["--fix", "--no-error-on-unmatched-pattern", ...sourceTargets]);
  run("oxfmt", ["--write", ...formatTargets]);
}

switch (command) {
  case "dev":
    generateDocsData();
    run("react-router", ["dev", ...passthroughArgs]);
    break;
  case "build":
    generateDocsData();
    run("react-router", ["build", ...passthroughArgs]);
    writeBuildInfo();
    break;
  case "start":
    run("vite", ["preview", "--outDir", "build/client", ...passthroughArgs]);
    break;
  case "format":
    formatSources();
    break;
  case "lint":
    lintSources();
    break;
  case "typecheck":
    generateDocsData();
    run("react-router", ["typegen"]);
    run("tsc", ["--noEmit", ...passthroughArgs]);
    break;
  default:
    console.error(`Unknown task: ${command ?? "(missing)"}`);
    process.exit(1);
}
