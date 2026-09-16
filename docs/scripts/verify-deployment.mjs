import assert from "node:assert/strict";

const expectedCommit = process.env.EXPECTED_COMMIT?.toLowerCase();
const deploymentUrl = (process.env.DOCS_TEST_URL ?? "https://neobrutal-ui.andongmin.com").replace(
  /\/$/,
  "",
);
const deadline = Date.now() + 5 * 60_000;

assert.match(expectedCommit ?? "", /^[\da-f]{40}$/, "EXPECTED_COMMIT must be a full Git SHA");

let lastFailure = "the deployment marker has not been checked";
let matched = false;

while (Date.now() < deadline && !matched) {
  try {
    const response = await fetch(
      `${deploymentUrl}/build-info.json?expected=${encodeURIComponent(expectedCommit)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      },
    );
    assert.equal(response.status, 200, `expected HTTP 200, received ${response.status}`);
    assert.match(response.headers.get("content-type") ?? "", /application\/json/i);

    const buildInfo = await response.json();
    matched = buildInfo.commit === expectedCommit;
    if (!matched) lastFailure = `production reports ${buildInfo.commit ?? "no commit"}`;
  } catch (error) {
    lastFailure = error instanceof Error ? error.message : String(error);
  }

  if (!matched) {
    console.log(`Waiting for the current production documentation: ${lastFailure}`);
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}

if (!matched) {
  throw new Error(`Timed out waiting for ${expectedCommit}: ${lastFailure}`);
}

console.log(`Production documentation matches commit ${expectedCommit}.`);
