import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  getDocumentExamples,
  readDocsExamples,
  verifyDocsExamples,
  type DocsExample,
} from "./verify-docs-examples";

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

test("all published preview code includes helpers, declares installs and compiles for consumers", () => {
  const examples = readDocsExamples("preview");
  assert.equal(examples.length, getDocumentedPreviewKeys().size);
  assert.equal(verifyDocsExamples(examples), examples.length);
});

function replaceExampleSource(example: DocsExample, source: string): DocsExample {
  const fileName = example.sources.keys().next().value!;
  return { ...example, sources: new Map([[fileName, source]]) };
}

test("Usage cannot import undocumented components, npm packages or docs-only aliases", () => {
  const example = readDocsExamples("usage").find(({ slug }) => slug === "button")!;
  for (const dependency of ["@/components/ui/label", "fumapress", "@/data/theme"]) {
    const invalid = replaceExampleSource(
      example,
      `import * as dependency from "${dependency}";\nexport default dependency;\n`,
    );
    assert.throws(() => verifyDocsExamples([invalid]), /needs a documented (npm )?install/);
  }
});

test("published Code rejects omitted helpers even when the docs project contains them", () => {
  const example = readDocsExamples("preview").find(
    ({ identity }) => identity === "sidebar/primary",
  )!;
  const sources = new Map(
    [...example.sources].filter(([fileName]) => !path.basename(fileName).startsWith("_")),
  );
  assert.equal(sources.size, example.sources.size - 1);
  assert.throws(
    () => verifyDocsExamples([{ ...example, sources }]),
    /Code omits supporting file .*_sidebar/,
  );
});

test("included helper imports cannot be satisfied by docs-only dependencies", () => {
  const example = readDocsExamples("preview").find(
    ({ identity }) => identity === "sidebar/primary",
  )!;
  const sources = new Map(example.sources);
  const helper = [...sources.keys()].find((fileName) => path.basename(fileName).startsWith("_"))!;
  sources.set(helper, `${sources.get(helper)}\nexport * from "fumapress";\n`);
  assert.throws(
    () => verifyDocsExamples([{ ...example, sources }]),
    /fumapress needs a documented npm install/,
  );
});

test("side-effect imports, re-exports and dynamic imports also require documented installs", () => {
  const example = readDocsExamples("usage").find(({ slug }) => slug === "button")!;
  for (const source of [
    'import "fumapress";',
    'export * from "fumapress";',
    'const load = () => import("fumapress");',
    'type Runtime = import("fumapress");',
    'const runtime = require("fumapress");',
  ])
    assert.throws(
      () => verifyDocsExamples([replaceExampleSource(example, source)]),
      /fumapress needs a documented npm install/,
    );
  assert.throws(
    () =>
      verifyDocsExamples([
        replaceExampleSource(example, 'const dependency = "fumapress"; void import(dependency);'),
      ]),
    /imports must name their dependency explicitly/,
  );
});

test("secondary preview type errors are rejected independently of docs project compilation", () => {
  const examples = readDocsExamples("preview");
  const example = examples.find(({ identity }) => identity === "input/file")!;
  const primary = examples.find(({ identity }) => identity === "input/primary")!;
  const [fileName, source] = [...example.sources][0];
  assert.match(source, /<Input\b/);
  const invalid = {
    ...example,
    sources: new Map([
      [fileName, source.replace(/<Input\b/, "<Input registryContractTypo={true}")],
    ]),
  };
  assert.throws(() => verifyDocsExamples([primary, invalid]), /registryContractTypo/);
});

test("removing a secondary example's documented install rejects its unchanged Code", () => {
  const example = readDocsExamples("preview").find(({ identity }) => identity === "input/file")!;
  const document = example.document.replace(/## Examples\n[\s\S]*?(?=### File)/, "## Examples\n\n");
  assert.notEqual(document, example.document);
  assert.throws(
    () => verifyDocsExamples([{ ...example, document }]),
    /@\/components\/ui\/label needs a documented install/,
  );
});

test("all Usage blocks compile, including an invalid block after a valid first example", () => {
  const original = fs.readFileSync("content/docs/button.mdx", "utf8");
  const document = original.replace(
    "## API reference",
    '```tsx\nimport { Button } from "@/components/ui/button";\nexport default function InvalidButton() { return <Button registryContractTypo />; }\n```\n\n## API reference',
  );
  const examples = getDocumentExamples("button", document, "usage");
  assert.equal(examples.length, 2);
  assert.throws(() => verifyDocsExamples(examples), /registryContractTypo/);
});

test("built-in consumer utils cannot expose application-only utility exports", () => {
  const example = readDocsExamples("usage").find(({ slug }) => slug === "button")!;
  const invalid = replaceExampleSource(
    example,
    'import { addSpaces } from "@/lib/utils"; export default addSpaces;',
  );
  assert.throws(() => verifyDocsExamples([invalid]), /no exported member.*addSpaces/);
});
