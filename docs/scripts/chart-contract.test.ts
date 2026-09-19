import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import { charts } from "../src/data/charts";

const recipeNames = ["chart-revenue-target", "chart-signup-conversion", "chart-service-latency"];

test("chart recipes share one source across registry, gallery, and docs", () => {
  const registered = charts.filter((chart) => chart.registryName);
  assert.deepEqual(registered.map((chart) => chart.registryName).sort(), [...recipeNames].sort());

  for (const chart of registered) {
    const name = chart.registryName!;
    const source = fs.readFileSync(`../registry/src/components/ui/${name}.tsx`, "utf8");
    const item = JSON.parse(fs.readFileSync(`public/r/${name}.json`, "utf8"));
    assert.equal(chart.code, source);
    assert.equal(fs.readFileSync(`src/components/ui/${name}.tsx`, "utf8"), source);
    assert.equal(item.type, "registry:component");
    assert.equal(item.files.length, 1);
    assert.equal(item.files[0].content, source);
    assert.equal(item.files[0].type, "registry:ui");
    assert.equal(item.files[0].target, undefined);
    assert.ok(item.categories.includes("recipe"));
    assert.ok(item.dependencies.some((dependency: string) => dependency.startsWith("recharts@")));
    for (const dependency of ["chart", "card"]) {
      assert.ok(
        item.registryDependencies.some((url: string) => url.endsWith(`/r/${dependency}.json`)),
      );
    }
    assert.ok(
      !item.registryDependencies.some((url: string) => url.endsWith("/r/neobrutal-ui.json")),
      "Adding a chart must not reinstall the base theme.",
    );
    assert.ok(!fs.existsSync(`src/examples/ui/chart/${name}.tsx`));
    assert.equal(typeof chart.component, "function");
  }
});
