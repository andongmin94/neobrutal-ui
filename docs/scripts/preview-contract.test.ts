import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const examplesRoot = path.resolve("src/examples/ui");
const defaultExampleByComponent: Record<string, string> = {
  chart: "chart-area-stacked",
  sidebar: "page",
};
const specialPageComponents = new Set(["chart"]);

type PreviewIdentity = {
  component: string;
  example?: string;
};

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

function getPreviewIdentity(filePath: string): PreviewIdentity {
  const relativePath = path
    .relative(examplesRoot, filePath)
    .replaceAll("\\", "/")
    .replace(/\.tsx$/, "");
  const [component, ...segments] = relativePath.split("/");
  const example = segments.join("/");
  const isDefault =
    example === "" || example === "index" || defaultExampleByComponent[component] === example;

  return {
    component,
    ...(isDefault ? {} : { example }),
  };
}

function previewKey({ component, example }: PreviewIdentity) {
  return `${component}:${example ?? "default"}`;
}

function getDocumentedPreviewKeys() {
  const keys = new Set<string>();

  for (const fileName of fs.readdirSync("content/docs").filter((name) => name.endsWith(".mdx"))) {
    const source = fs.readFileSync(`content/docs/${fileName}`, "utf8");

    for (const match of source.matchAll(/<ComponentPreview\s+([^>]+)>/g)) {
      const attributes = match[1];
      if (attributes.includes('type="star"')) continue;

      const component = attributes.match(/component="([^"]+)"/)?.[1];
      const example = attributes.match(/example="([^"]+)"/)?.[1];
      assert.ok(component, `${fileName}: preview has no component name`);
      keys.add(previewKey({ component, ...(example ? { example } : {}) }));
    }
  }

  return keys;
}

test("preview modules and helper modules use explicit filename conventions", () => {
  for (const filePath of getExampleModules(examplesRoot)) {
    const source = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(examplesRoot, filePath).replaceAll("\\", "/");
    const isHelper = path.basename(filePath).startsWith("_");

    if (isHelper) {
      assert.doesNotMatch(
        source,
        /\bexport\s+default\b/,
        `${relativePath}: helper exports a preview`,
      );
    } else {
      assert.match(
        source,
        /\bexport\s+default\b/,
        `${relativePath}: preview has no default export`,
      );
    }
  }
});

test("every discoverable preview is documented or owned by a special gallery", () => {
  const documentedKeys = getDocumentedPreviewKeys();
  const discoveredKeys = new Set<string>();

  for (const filePath of getExampleModules(examplesRoot)) {
    if (path.basename(filePath).startsWith("_")) continue;

    const identity = getPreviewIdentity(filePath);
    const key = previewKey(identity);
    const relativePath = path.relative(examplesRoot, filePath).replaceAll("\\", "/");

    assert.ok(!discoveredKeys.has(key), `${relativePath}: duplicate preview identity ${key}`);
    discoveredKeys.add(key);

    if (identity.example && specialPageComponents.has(identity.component)) continue;
    assert.ok(documentedKeys.has(key), `${relativePath}: preview is not referenced by documentation`);
  }
});
