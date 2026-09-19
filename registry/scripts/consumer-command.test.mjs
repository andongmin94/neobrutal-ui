import assert from "node:assert/strict";
import { test } from "node:test";

import { run } from "./consumer-command.mjs";

function fixture(source, preserveFile = "button.tsx") {
  return run(
    process.execPath,
    ["--input-type=module", "-e", source],
    process.cwd(),
    {},
    preserveFile,
  );
}

for (const stream of ["stdout", "stderr"]) {
  test(`declines the expected overwrite on ${stream}, including split colored output`, async () => {
    await fixture(`
      const output = process.${stream};
      process.stdin.once("data", (answer) => {
        if (answer.toString() !== "n") process.exit(2);
        output.write("\\nPreserved button; installed remaining files.\\n");
        process.stdin.destroy();
      });
      output.write("? The file \\x1b[36mbutton.tsx\\x1b[0m already exists. ");
      setTimeout(() => output.write("Would you like to overwrite? › (y/N)"), 20);
    `);
  });
}

test("successful exit without a preservation prompt fails", async () => {
  await assert.rejects(fixture("process.exit(0)"), /never asked to preserve button.tsx/);
});

test("an unexpected file prompt fails instead of granting overwrite permission", async () => {
  await assert.rejects(
    fixture(`
      process.stdin.resume();
      process.stdout.write("? The file secrets.ts already exists. Would you like to overwrite?");
    `),
    /Unexpected overwrite prompt: secrets.ts/,
  );
});

test("a nonzero exit after declining still fails the command", async () => {
  await assert.rejects(
    fixture(`
      process.stdin.once("data", () => process.exit(3));
      process.stdout.write("? The file button.tsx already exists. Would you like to overwrite?");
    `),
    /exited with 3/,
  );
});

test("ordinary commands do not need an interactive answer", async () => {
  await run(process.execPath, ["-e", "process.exit(0)"], process.cwd());
});
