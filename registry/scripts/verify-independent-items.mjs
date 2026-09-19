import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const { items } = JSON.parse(fs.readFileSync(path.join(root, "public/r/registry.json"), "utf8"));
const queue = items.filter((item) => item.files?.length && !["registry:base", "registry:style"].includes(item.type));
assert.ok(queue.length > 0, "The independent installation matrix must not be empty");
const output = path.join(root, "../docs/test-results/independent-items");
fs.mkdirSync(output, { recursive: true });
const records = [];

// Each command creates and deletes its own fresh projects and node_modules.
// Bounded parallelism avoids serially rebuilding the catalog for every small fix.
async function worker() {
  for (let item; (item = queue.shift());) {
    const targets = item.categories?.includes("template") ? ["next"] : ["next", "vite"];
    const log = fs.openSync(path.join(output, `${item.name}.log`), "w");
    let passed = false;
    try {
      passed = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [path.join(root, "scripts/verify-consumer.mjs"), ...targets, `--item=${item.name}`], {
          cwd: root,
          env: process.env,
          stdio: ["ignore", log, log],
          timeout: 240_000,
        });
        child.once("error", reject);
        child.once("exit", (code) => resolve(code === 0));
      });
    } catch (error) {
      fs.writeSync(log, `\n${String(error)}\n`);
    } finally {
      fs.closeSync(log);
    }
    records.push({ item: item.name, targets, passed });
    console.log(`${passed ? "PASS" : "FAIL"} independent install: ${item.name} (${targets.join(", ")})`);
    if (!passed) console.error(fs.readFileSync(path.join(output, `${item.name}.log`), "utf8"));
    fs.writeFileSync(path.join(output, "report.json"), `${JSON.stringify(records, null, 2)}\n`);
  }
}

await Promise.all(Array.from({ length: 3 }, worker));
assert.ok(records.every((record) => record.passed), "Independent installation failures; see independent-items/report.json");
console.log(`All ${records.length} items passed ${records.reduce((sum, record) => sum + record.targets.length, 0)} independent framework installations.`);
