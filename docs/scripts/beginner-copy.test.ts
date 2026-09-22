import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

function read(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function collectFiles(root: string, extensions: Set<string>) {
  return fs
    .readdirSync(root, { recursive: true })
    .filter((entry): entry is string => typeof entry === "string")
    .filter((entry) => extensions.has(entry.slice(entry.lastIndexOf("."))))
    .map((entry) => `${root}/${entry.replaceAll("\\", "/")}`);
}

test("beginner onboarding reaches a working button before optional configuration", () => {
  const readme = read("../README.md");
  const installation = read("content/docs/installation.mdx");
  const baseCommand =
    "npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json";
  const buttonCommand = "npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/button.json";
  const firstButton = "return <Button>Click me</Button>;";

  for (const source of [readme, installation]) {
    assert.ok(source.includes(baseCommand), "shared base command is missing");
    assert.ok(source.includes(buttonCommand), "first component command is missing");
    assert.ok(source.includes(firstButton), "working Button example is missing");
  }

  assert.ok(
    readme.indexOf(buttonCommand) < readme.indexOf("## Optional: shorter install commands"),
    "README asks for optional namespace configuration too early",
  );
  assert.ok(
    installation.indexOf("## Check that it works") <
      installation.indexOf("## Optional: shorter commands"),
    "installation guide explains optional configuration before the first success check",
  );
});

test("beginner-facing copy avoids project-internal ownership jargon", () => {
  const files = [
    "../README.md",
    "src/data/charts.ts",
    ...collectFiles("content", new Set([".mdx"])),
    ...collectFiles("src/site", new Set([".ts", ".tsx"])),
    ...collectFiles("src/examples", new Set([".ts", ".tsx"])),
    ...collectFiles("src/special-pages", new Set([".ts", ".tsx"])),
  ];

  for (const file of files) {
    assert.doesNotMatch(read(file), /\bsource-owned\b/i, file);
  }
});
