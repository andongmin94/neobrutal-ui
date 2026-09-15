import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registryItemSchema, registrySchema } from "shadcn/schema";

const output = fileURLToPath(new URL("../public/r/", import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path.join(output, "registry.json"), "utf8"));
const registryUrl = `${catalog.homepage.replace(/\/$/, "")}/r`;
const files = ["registry.json", ...catalog.items.map((item) => `${item.name}.json`)];

// Check deployed bytes against this build; a successful deployment status alone is insufficient.
for (let start = 0; start < files.length; start += 8) {
  await Promise.all(
    files.slice(start, start + 8).map(async (name) => {
      const url = `${registryUrl}/${name}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
      assert.equal(response.status, 200, `${url}: expected HTTP 200`);
      assert.match(
        response.headers.get("content-type") ?? "",
        /application\/json/i,
        `${url}: expected JSON`,
      );
      const actual = await response.json();
      const expected = JSON.parse(fs.readFileSync(path.join(output, name), "utf8"));
      (name === "registry.json" ? registrySchema : registryItemSchema).parse(actual);
      assert.deepEqual(actual, expected, `${url}: deployment differs from the current build`);
    }),
  );
}
console.log(`Live registry verified: ${files.length} JSON endpoints match the current build.`);
