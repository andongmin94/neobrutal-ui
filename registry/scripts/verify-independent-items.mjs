import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { spawnConsumerProcess, terminateConsumerProcess } from "./consumer-command.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const { items } = JSON.parse(fs.readFileSync(path.join(root, "public/r/registry.json"), "utf8"));
const { values } = parseArgs({ options: { shard: { type: "string", default: "1/1" } } });
assert.match(values.shard, /^[1-9]\d*\/[1-9]\d*$/, "Use --shard=index/count (1-based)");
const [shard, shardCount] = values.shard.split("/").map(Number);
assert.ok(Number.isSafeInteger(shardCount) && shard <= shardCount, "Invalid installation shard");
const installable = items.filter(
  (item) => item.files?.length && !["registry:base", "registry:style"].includes(item.type),
);
const queue = installable.filter((_, index) => index % shardCount === shard - 1);
const expectedCount = queue.length;
assert.ok(expectedCount > 0, "The independent installation matrix must not be empty");
const output = path.join(root, "../docs/test-results/independent-items");
fs.mkdirSync(output, { recursive: true });
const records = [];
const activeConsumers = new Set();
let interruption;

function interrupt(signal) {
  interruption ??= new Error(`Independent installations interrupted by ${signal}`);
  queue.length = 0;
  for (const stop of activeConsumers) stop(signal, interruption);
}

const onSigterm = () => interrupt("SIGTERM");
const onSigint = () => interrupt("SIGINT");
process.on("SIGTERM", onSigterm);
process.on("SIGINT", onSigint);

// Shards partition the catalog; each command still uses fresh projects and node_modules.
async function worker() {
  for (let item; (item = queue.shift());) {
    const targets = item.categories?.includes("template") ? ["next"] : ["next", "vite"];
    const log = fs.openSync(path.join(output, `${item.name}.log`), "w");
    let passed = false;
    try {
      passed = await new Promise((resolve) => {
        const child = spawnConsumerProcess(
          process.execPath,
          [path.join(root, "scripts/verify-consumer.mjs"), ...targets, `--item=${item.name}`],
          {
            cwd: root,
            env: process.env,
            stdio: ["ignore", log, log],
          },
        );
        let failure;
        let termination;
        const stop = (signal = "SIGTERM", error) => {
          failure ??= error;
          termination ??= terminateConsumerProcess(child, signal).catch((terminationError) => {
            failure ??= terminationError;
            child.kill();
          });
        };
        activeConsumers.add(stop);
        const timeout = setTimeout(() => {
          fs.writeSync(
            log,
            "\nIndependent installation exceeded 240000ms; stopping its process tree.\n",
          );
          stop();
        }, 240_000);
        child.once("error", (error) => {
          failure = error;
          clearTimeout(timeout);
        });
        child.once("close", async (code, signal) => {
          clearTimeout(timeout);
          activeConsumers.delete(stop);
          await termination;
          if (failure) fs.writeSync(log, `\n${String(failure)}\n`);
          fs.writeSync(log, `\nConsumer exited with code ${code}, signal ${signal}.\n`);
          resolve(code === 0 && !termination && !failure);
        });
      });
    } catch (error) {
      fs.writeSync(log, `\n${String(error)}\n`);
    } finally {
      fs.closeSync(log);
    }
    records.push({ item: item.name, targets, passed });
    console.log(
      `${passed ? "PASS" : "FAIL"} independent install: ${item.name} (${targets.join(", ")})`,
    );
    if (!passed) console.error(fs.readFileSync(path.join(output, `${item.name}.log`), "utf8"));
    fs.writeFileSync(path.join(output, "report.json"), `${JSON.stringify(records, null, 2)}\n`);
  }
}

try {
  await Promise.all(Array.from({ length: 3 }, worker));
} finally {
  process.removeListener("SIGTERM", onSigterm);
  process.removeListener("SIGINT", onSigint);
}
if (interruption) throw interruption;
assert.equal(records.length, expectedCount, "Every selected item must finish");
assert.ok(
  records.every((record) => record.passed),
  "Independent installation failures; see independent-items/report.json",
);
console.log(
  `All ${records.length} items passed ${records.reduce((sum, record) => sum + record.targets.length, 0)} independent framework installations.`,
);
