import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { measureInitialJavaScript } from "./initial-js-budget";

function fixture(run: (publicDirectory: string, root: string) => void) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-js-budget-"));
  const directory = path.join(root, "dist/public");
  fs.mkdirSync(path.join(directory, "assets"), { recursive: true });
  try {
    run(directory, root);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.join(os.tmpdir(), "neobrutal-js-budget-")));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("initial transfer counts unique module URLs and ignores inline strings, comments and lazy chunks", () => {
  fixture((directory) => {
    fs.writeFileSync(path.join(directory, "assets/shared.js"), "export const shared = true;");
    fs.writeFileSync(path.join(directory, "assets/entry.js"), "import './shared.js';");
    fs.writeFileSync(path.join(directory, "assets/lazy.js"), "export const lazy = true;");
    fs.writeFileSync(
      path.join(directory, "index.html"),
      `<!-- <link rel="modulepreload" href="/assets/missing.js"> -->
       <script>const example = '<link rel="modulepreload" href="/assets/missing.js">';</script>
       <link href='/assets/shared.js' rel='modulepreload'>
       <link rel="modulepreload" href="/assets/shared.js">
       <script type="module" src="/assets/entry.js"></script>`,
    );
    const result = measureInitialJavaScript(directory, "/");
    assert.deepEqual(
      result.assets.map((asset: { path: string }) => asset.path),
      ["/assets/shared.js", "/assets/entry.js"],
    );
    assert.ok(result.gzipBytes > 0);
    fs.writeFileSync(path.join(directory, "index.html"), "<h1>No module graph</h1>");
    assert.throws(() => measureInitialJavaScript(directory, "/"), /no initial JavaScript/);
  });
});

test("the build gate rejects an aggregate transfer that passes the largest-file budget", () => {
  fixture((directory, root) => {
    for (const name of ["one", "two"]) {
      fs.writeFileSync(
        path.join(directory, `assets/${name}.js`),
        `/*${randomBytes(160_000).toString("base64")}*/`,
      );
    }
    for (const route of ["/", "/docs/button", "/docs/chart", "/templates/cms"]) {
      const target = path.join(directory, route);
      fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(
        path.join(target, "index.html"),
        '<link rel="modulepreload" href="/assets/one.js"><link rel="modulepreload" href="/assets/two.js">',
      );
    }
    const script = fileURLToPath(new URL("./check-build-budget.mjs", import.meta.url));
    assert.throws(
      () => execFileSync(process.execPath, [script], { cwd: root, stdio: "pipe" }),
      (error: unknown) =>
        error instanceof Error && /initial JavaScript \(gzip\)/.test(error.message),
    );
  });
});
