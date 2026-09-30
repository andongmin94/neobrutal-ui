import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "@typescript/typescript6";

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

test("all published preview code includes its helpers and documented installation dependencies", () => {
  const catalog = JSON.parse(fs.readFileSync("../registry/registry.json", "utf8")) as {
    items: {
      name: string;
      dependencies?: string[];
      registryDependencies?: string[];
      files?: { path: string }[];
    }[];
  };
  const itemByName = new Map(catalog.items.map((item) => [item.name, item]));
  let checkedPreviews = 0;

  function packageName(dependency: string) {
    const versionSeparator = dependency.lastIndexOf("@");
    const name = versionSeparator > 0 ? dependency.slice(0, versionSeparator) : dependency;
    return name
      .split("/")
      .slice(0, name.startsWith("@") ? 2 : 1)
      .join("/");
  }

  for (const fileName of fs.readdirSync("content/docs").filter((name) => name.endsWith(".mdx"))) {
    const document = fs.readFileSync(`content/docs/${fileName}`, "utf8");
    const previews = [
      ...document.matchAll(/<ComponentPreview\b([^>]*)>([\s\S]*?)<\/ComponentPreview>/g),
    ];
    if (!previews.length) continue;
    const slug = fileName.replace(/\.mdx$/, "");
    const installed = new Set<string>();
    const modules = new Set<string>();
    // The installation guide starts with the shared base and the first Button.
    const packages = new Set(["react", "react-dom"]);
    const pending = [
      "neobrutal-ui",
      "button",
      ...(itemByName.has(slug) ? [slug] : []),
      ...[...document.matchAll(/https:\/\/neobrutal-ui\.andongmin\.com\/r\/([\w-]+)\.json/g)].map(
        (match) => match[1],
      ),
    ];

    // An installation instruction can point to another component's documentation.
    const prose = document.replace(/```[\s\S]*?```/g, "");
    for (const paragraph of prose.split(/\n\s*\n/)) {
      if (!/\binstall\b/i.test(paragraph)) continue;
      for (const match of paragraph.matchAll(/\]\(\/docs\/([\w-]+)\)/g))
        if (itemByName.has(match[1])) pending.push(match[1]);
    }
    for (const match of document.matchAll(/\bnpm install\s+([^\n`]+)/g))
      for (const dependency of match[1].trim().split(/\s+/))
        if (!dependency.startsWith("-")) packages.add(packageName(dependency));

    for (const name of pending) {
      if (installed.has(name)) continue;
      installed.add(name);
      // The shared base declares shadcn's built-in utils item.
      if (name === "utils") {
        assert.ok(itemByName.get("neobrutal-ui")?.registryDependencies?.includes("utils"));
        modules.add("@/lib/utils");
        continue;
      }
      const item = itemByName.get(name);
      assert.ok(item, `${slug}: unknown registry item ${name}`);
      for (const file of item.files ?? [])
        if (file.path.startsWith("src/"))
          modules.add(`@/${file.path.slice("src/".length).replace(/\.[jt]sx?$/, "")}`);
      for (const dependency of item.dependencies ?? []) packages.add(packageName(dependency));
      for (const dependency of item.registryDependencies ?? [])
        pending.push(
          dependency === "utils"
            ? dependency
            : path.basename(new URL(dependency).pathname, ".json"),
        );
    }

    for (const preview of previews) {
      checkedPreviews++;
      const component = preview[1].match(/component="([^"]+)"/)?.[1];
      const example = preview[1].match(/example="([^"]+)"/)?.[1] ?? "primary";
      const identity = `${component}/${example}`;
      const sources = new Set(
        [...preview[2].matchAll(/<include\b[^>]*>\s*([^<]+?)\s*<\/include>/g)].map((match) =>
          path.resolve(match[1].trim()),
        ),
      );
      assert.ok(sources.size, `${identity}: Code has no included source`);

      for (const file of sources) {
        const source = ts.createSourceFile(
          file,
          fs.readFileSync(file, "utf8"),
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TSX,
        );
        const dependencies: string[] = [];
        function visit(node: ts.Node) {
          if (
            (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          )
            dependencies.push(node.moduleSpecifier.text);
          else if (
            ts.isCallExpression(node) &&
            node.expression.kind === ts.SyntaxKind.ImportKeyword &&
            node.arguments[0] &&
            ts.isStringLiteral(node.arguments[0])
          )
            dependencies.push(node.arguments[0].text);
          ts.forEachChild(node, visit);
        }
        visit(source);

        for (const dependency of dependencies) {
          if (dependency.startsWith("@/"))
            assert.ok(
              modules.has(dependency),
              `${identity}: ${dependency} needs a documented install`,
            );
          else if (dependency.startsWith(".")) {
            const target = path.resolve(path.dirname(file), dependency);
            assert.ok(
              [
                target,
                `${target}.tsx`,
                `${target}.ts`,
                path.join(target, "index.tsx"),
                path.join(target, "index.ts"),
              ].some((candidate) => sources.has(candidate)),
              `${identity}: Code omits supporting file ${dependency}`,
            );
          } else
            assert.ok(
              packages.has(packageName(dependency)),
              `${identity}: ${dependency} needs a documented npm install`,
            );
        }
      }
    }
  }

  assert.equal(checkedPreviews, getDocumentedPreviewKeys().size);
});
