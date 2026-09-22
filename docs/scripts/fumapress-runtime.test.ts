import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(docsRoot, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
const packageLock = JSON.parse(readFileSync(path.join(docsRoot, "package-lock.json"), "utf8")) as {
  packages?: Record<string, { dependencies?: Record<string, string> }>;
};

test("Fumapress owns the docs runtime without React Router compatibility paths", () => {
  assert.equal(packageJson.scripts?.dev, "fumapress dev");
  assert.equal(packageJson.scripts?.build, "fumapress build");
  assert.equal(packageJson.scripts?.start, "fumapress start");

  for (const dependency of ["react-router", "@react-router/node", "@react-router/dev", "isbot"]) {
    assert.equal(packageJson.dependencies?.[dependency], undefined, dependency);
    assert.equal(packageJson.devDependencies?.[dependency], undefined, dependency);
  }

  for (const relative of [
    "react-router.config.ts",
    "app",
    "app/root.tsx",
    "app/routes.ts",
    "app/routes",
    "app/lib/source.ts",
    "app/app.css",
    "vercel.json",
    "src/data/theme.json",
  ]) {
    assert.equal(existsSync(path.join(docsRoot, relative)), false, relative);
  }

  assert.equal(existsSync(path.join(docsRoot, "press.config.tsx")), true);
  assert.equal(existsSync(path.join(docsRoot, "src/app.css")), true);
  assert.equal(existsSync(path.join(docsRoot, "src/site")), true);

  const globalsCss = readFileSync(path.join(docsRoot, "src/styling/globals.css"), "utf8");
  assert.doesNotMatch(globalsCss, /@source\s+["']\.\.\/\.\.\/app["']/);

  assert.equal(packageLock.packages?.[""]?.dependencies?.isbot, undefined);
  assert.equal(packageLock.packages?.["node_modules/isbot"], undefined);
});
