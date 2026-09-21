import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const buildInfoPath = "dist/public/build-info.json";

test("the documentation build identifies its exact source revision", () => {
  assert.ok(fs.existsSync(buildInfoPath), "run the documentation build before contract tests");

  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf8")) as {
    commit?: unknown;
  };
  assert.equal(typeof buildInfo.commit, "string");

  const commit = buildInfo.commit as string;
  const expectedCommit = process.env.GITHUB_SHA?.toLowerCase();

  if (expectedCommit) {
    assert.match(expectedCommit, /^[\da-f]{40}$/);
    assert.equal(commit, expectedCommit);
  } else {
    assert.match(commit, /^(?:local|[\da-f]{40})$/);
  }
});
