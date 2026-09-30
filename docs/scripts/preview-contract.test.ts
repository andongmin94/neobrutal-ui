import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { getPreviewIdentity, previewKey } from "../src/data/preview-registry";

const examplesRoot = path.resolve("src/examples/ui");
const specialPageComponents = new Set(["chart"]);

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

function getDocumentedPreviewKeys() {
  const keys = new Set<string>();

  for (const fileName of fs.readdirSync("content/docs").filter((name) => name.endsWith(".mdx"))) {
    const source = fs.readFileSync(`content/docs/${fileName}`, "utf8");

    for (const match of source.matchAll(/<ComponentPreview\s+([^>]+)>/g)) {
      const attributes = match[1];
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

test("documentation and discoverable preview sources stay bidirectionally complete", () => {
  const documentedKeys = getDocumentedPreviewKeys();
  const discoveredKeys = new Set<string>();

  for (const filePath of getExampleModules(examplesRoot)) {
    if (path.basename(filePath).startsWith("_")) continue;

    const identity = getPreviewIdentity(path.relative(examplesRoot, filePath));
    const key = previewKey(identity);
    const relativePath = path.relative(examplesRoot, filePath).replaceAll("\\", "/");

    assert.ok(!discoveredKeys.has(key), `${relativePath}: duplicate preview identity ${key}`);
    discoveredKeys.add(key);

    if (identity.example && specialPageComponents.has(identity.component)) continue;
    assert.ok(
      documentedKeys.has(key),
      `${relativePath}: preview is not referenced by documentation`,
    );
  }

  for (const key of documentedKeys) {
    assert.ok(discoveredKeys.has(key), `${key}: documented preview source is missing`);
  }
});

test("complete preview code includes its local helpers and documents extra component installs", () => {
  const catalog = JSON.parse(fs.readFileSync("../registry/registry.json", "utf8")) as {
    items: {
      name: string;
      registryDependencies?: string[];
      files?: { path: string }[];
    }[];
  };
  const itemByName = new Map(catalog.items.map((item) => [item.name, item]));

  for (const slug of [
    "hover-card",
    "sidebar",
    "breadcrumb",
    "carousel",
    "sheet",
    "tabs",
    "select",
    "input",
    "switch",
    "textarea",
  ]) {
    const document = fs.readFileSync(`content/docs/${slug}.mdx`, "utf8");
    const preview = document.match(/<ComponentPreview\b[^>]*>([\s\S]*?)<\/ComponentPreview>/)?.[1];
    assert.ok(preview, `${slug}: primary preview missing`);
    const sources = new Set(
      [...preview.matchAll(/<include\b[^>]*>\s*([^<]+?)\s*<\/include>/g)].map((match) =>
        path.resolve(match[1].trim()),
      ),
    );
    const installed = new Set<string>();
    const modules = new Set<string>();
    const pending = [
      slug,
      ...[...document.matchAll(/https:\/\/neobrutal-ui\.andongmin\.com\/r\/([\w-]+)\.json/g)].map(
        (match) => match[1],
      ),
    ];
    for (const name of pending) {
      if (installed.has(name)) continue;
      installed.add(name);
      const item = itemByName.get(name);
      assert.ok(item, `${slug}: undocumented registry item ${name}`);
      for (const file of item.files ?? []) {
        if (file.path.startsWith("src/components/ui/"))
          modules.add(file.path.slice("src/components/ui/".length).replace(/\.tsx?$/, ""));
      }
      for (const dependency of item.registryDependencies ?? [])
        pending.push(path.basename(new URL(dependency).pathname, ".json"));
    }

    for (const file of sources) {
      const source = fs.readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
        const dependency = match[1];
        if (dependency.startsWith("@/components/ui/")) {
          assert.ok(
            modules.has(dependency.slice("@/components/ui/".length)),
            `${slug}: ${dependency} needs an additional documented install`,
          );
        } else if (dependency.startsWith("@/")) {
          assert.equal(dependency, "@/lib/utils", `${slug}: docs-only dependency ${dependency}`);
        } else if (dependency.startsWith(".")) {
          assert.ok(
            sources.has(path.resolve(path.dirname(file), `${dependency}.tsx`)),
            `${slug}: Code tab omits supporting file ${dependency}`,
          );
        }
      }
    }
  }
});
