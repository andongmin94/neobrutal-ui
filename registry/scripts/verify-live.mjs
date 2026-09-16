import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import { registryItemSchema, registrySchema } from "shadcn/schema";

const output = fileURLToPath(new URL("../public/r/", import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path.join(output, "registry.json"), "utf8"));
const registryUrl = `${catalog.homepage.replace(/\/$/, "")}/r`;
const itemFiles = catalog.items.map((item) => `${item.name}.json`);
const deploymentDeadline = Date.now() + 3 * 60_000;

async function fetchJson(name) {
  const url = `${registryUrl}/${name}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });

  assert.equal(response.status, 200, `${url}: expected HTTP 200`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /application\/json/i,
    `${url}: expected JSON`,
  );

  return { url, value: await response.json() };
}

async function waitForCurrentCatalog() {
  let lastFailure = "the deployed catalog has not been checked";

  while (Date.now() < deploymentDeadline) {
    try {
      const { value } = await fetchJson("registry.json");
      registrySchema.parse(value);

      if (isDeepStrictEqual(value, catalog)) return;
      lastFailure = "the deployed catalog does not match the current build";
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }

    console.log(`Waiting for the current deployment: ${lastFailure}`);
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  throw new Error(`Timed out waiting for the current deployment: ${lastFailure}`);
}

await waitForCurrentCatalog();

// Once the catalog matches, every advertised item must be present and byte-equivalent as JSON.
for (let start = 0; start < itemFiles.length; start += 8) {
  await Promise.all(
    itemFiles.slice(start, start + 8).map(async (name) => {
      const { url, value } = await fetchJson(name);
      const expected = JSON.parse(fs.readFileSync(path.join(output, name), "utf8"));
      registryItemSchema.parse(value);
      assert.deepEqual(value, expected, `${url}: deployment differs from the current build`);
    }),
  );
}

console.log(
  `Live registry verified: registry.json and ${itemFiles.length} item endpoints match the current build.`,
);
