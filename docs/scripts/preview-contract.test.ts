import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const examplesRoot = path.resolve("src/examples/ui");

function getExampleModules(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return getExampleModules(absolutePath);
      return entry.isFile() && entry.name.endsWith(".tsx") ? [absolutePath] : [];
    })
    .sort();
}

test("preview modules and helper modules use explicit filename conventions", () => {
  for (const filePath of getExampleModules(examplesRoot)) {
    const source = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(examplesRoot, filePath).replaceAll("\\", "/");
    const isHelper = path.basename(filePath).startsWith("_");

    if (isHelper) {
      assert.doesNotMatch(source, /\bexport\s+default\b/, `${relativePath}: helper exports a preview`);
    } else {
      assert.match(source, /\bexport\s+default\b/, `${relativePath}: preview has no default export`);
    }
  }
});
