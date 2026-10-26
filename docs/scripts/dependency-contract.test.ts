import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

type Manifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
type Lock = { packages: Record<string, { version?: string }> };

test("docs and registry use the same versions of their shared dependencies and verification tools", () => {
  const docs = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as Manifest;
  const registry = JSON.parse(
    fs.readFileSync(new URL("../../registry/package.json", import.meta.url), "utf8"),
  ) as Manifest;
  const docsLock = JSON.parse(
    fs.readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"),
  ) as Lock;
  const registryLock = JSON.parse(
    fs.readFileSync(new URL("../../registry/package-lock.json", import.meta.url), "utf8"),
  ) as Lock;
  const docsVersions = { ...docs.dependencies, ...docs.devDependencies };
  const registryVersions = { ...registry.dependencies, ...registry.devDependencies };
  for (const [name, version] of Object.entries(registryVersions)) {
    if (!(name in docsVersions)) continue;
    assert.equal(
      docsVersions[name].replace(/^[~^]/, ""),
      version.replace(/^[~^]/, ""),
      `${name}: declaration drift`,
    );
    assert.equal(
      docsLock.packages[`node_modules/${name}`]?.version,
      registryLock.packages[`node_modules/${name}`]?.version,
      `${name}: lockfile drift`,
    );
  }
});
