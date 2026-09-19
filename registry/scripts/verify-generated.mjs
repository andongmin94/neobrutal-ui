import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const generatedPaths = [
  "registry/registry.json",
  "registry/public",
  "docs/public/r",
  "docs/.registry-sync-manifest.json",
  "docs/src/components/ui",
  "docs/src/components/templates",
  "docs/src/data/colors.ts",
  "docs/src/data/theme.ts",
  "docs/src/data/theme-styles.ts",
  "docs/src/data/component-descriptions.json",
  "docs/src/hooks/use-mobile.ts",
  "docs/src/lib/blog-posts.ts",
  "docs/src/lib/utils.ts",
  "docs/src/styling/theme.css",
];

// Only disposable build outputs are removed. Refuse to touch tracked source files.
const tracked = execFileSync("git", ["ls-files", "--", ...generatedPaths], {
  cwd: root,
  encoding: "utf8",
});
assert.equal(tracked.trim(), "", "Generated outputs must not contain tracked source files.");

function snapshot() {
  const hashes = {};

  function visit(relativePath) {
    const absolutePath = path.join(root, relativePath);
    const entry = fs.lstatSync(absolutePath);
    if (entry.isDirectory()) {
      for (const name of fs.readdirSync(absolutePath).sort()) {
        visit(`${relativePath}/${name}`);
      }
    } else {
      assert.ok(entry.isFile(), `${relativePath}: expected a regular generated file`);
      hashes[relativePath] = createHash("sha256")
        .update(fs.readFileSync(absolutePath))
        .digest("hex");
    }
  }

  for (const relativePath of generatedPaths) visit(relativePath);
  assert.ok(Object.keys(hashes).length > 0, "Generated output is empty.");
  const registry = Object.entries(hashes)
    .filter(([name]) => name.startsWith("registry/public/r/"))
    .map(([name, hash]) => [name.slice("registry/public/r/".length), hash]);
  const docs = Object.entries(hashes)
    .filter(([name]) => name.startsWith("docs/public/r/"))
    .map(([name, hash]) => [name.slice("docs/public/r/".length), hash]);
  assert.deepEqual(docs, registry, "Docs must publish byte-identical registry files.");
  return hashes;
}

const before = snapshot();
for (const relativePath of generatedPaths) {
  fs.rmSync(path.join(root, relativePath), { recursive: true, force: true });
}
console.log("Rebuilding all registry outputs and docs mirrors from clean directories...");
execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
  cwd: path.join(root, "registry"),
  stdio: "inherit",
  shell: process.platform === "win32",
});
assert.deepEqual(snapshot(), before, "A clean rebuild changed the generated file set or bytes.");
console.log(`Verified reproducible output for ${Object.keys(before).length} generated files.`);
