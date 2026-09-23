import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { run } from "./consumer-command.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const entry = JSON.parse(fs.readFileSync(path.join(root, "directory-entry.json"), "utf8"));
const ownPackage = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const head = JSON.parse(
  await download("https://api.github.com/repos/shadcn-ui/ui/git/ref/heads/main"),
);
const revision = head.object.sha;
assert.match(revision, /^[a-f0-9]{40}$/);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-directory-"));

try {
  // Keep the upstream validator, schema and TypeScript configuration unchanged.
  for (const relative of [
    "registry/directory.json",
    "lib/registry-directory.ts",
    "scripts/validate-registries.mts",
    "tsconfig.scripts.json",
    "tsconfig.json",
    "package.json",
  ]) {
    const source = await download(
      `https://raw.githubusercontent.com/shadcn-ui/ui/${revision}/apps/v4/${relative}`,
    );
    const destination = path.join(temporary, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, source);
    console.log(`${relative}: sha256:${createHash("sha256").update(source).digest("hex")}`);
  }
  const directoryPath = path.join(temporary, "registry/directory.json");
  const directory = JSON.parse(fs.readFileSync(directoryPath, "utf8"));
  const name = entry.name.toLowerCase();
  const registered = directory.find((item) => item.name.toLowerCase() === name);
  if (registered) {
    assert.deepEqual(registered, entry, "The upstream namespace already has a different entry");
  } else {
    directory.push(entry);
  }
  directory.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(directoryPath, `${JSON.stringify(directory, null, 2)}\n`);

  const packagePath = path.join(temporary, "package.json");
  const upstream = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  assert.equal(typeof upstream.scripts["validate:registries"], "string");
  // Install only the validator's runtime dependencies, not the upstream website.
  fs.writeFileSync(
    packagePath,
    JSON.stringify({
      private: true,
      type: "module",
      scripts: { "validate:registries": upstream.scripts["validate:registries"] },
      dependencies: { zod: upstream.dependencies.zod, tsx: ownPackage.devDependencies.tsx },
    }),
  );
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  await run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund"], temporary);
  await run(npm, ["run", "validate:registries"], temporary);
  console.log(
    `Official directory validator passed: ${entry.name}; upstream ${revision}; ${directory.length} entries.`,
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

async function download(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "neobrutal-ui-directory-verification" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Could not read ${url}: HTTP ${response.status}`);
  return response.text();
}
