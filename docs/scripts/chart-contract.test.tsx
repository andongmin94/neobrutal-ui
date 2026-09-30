import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ChartContainer, ChartTooltipContent } from "../src/components/ui/chart";
import { charts } from "../src/data/charts";

const recipeNames = [
  "chart-revenue-target",
  "chart-signup-conversion",
  "chart-service-latency",
  "chart-release-activity",
  "chart-delivery-capacity",
  "chart-build-duration",
  "chart-work-allocation",
  "chart-install-diagnostics",
];

test("tooltip formatters can calculate each series share from the complete payload", () => {
  const row = { month: "January", desktop: 30, mobile: 70 };
  const payload = [
    {
      graphicalItemId: "desktop",
      dataKey: "desktop",
      name: "Desktop",
      value: row.desktop,
      payload: row,
    },
    {
      graphicalItemId: "mobile",
      dataKey: "mobile",
      name: "Mobile",
      value: row.mobile,
      payload: row,
    },
  ] satisfies NonNullable<ComponentProps<typeof ChartTooltipContent>["payload"]>;
  let calls = 0;
  const html = renderToStaticMarkup(
    <ChartContainer config={{}}>
      <ChartTooltipContent
        active
        payload={payload}
        formatter={(value, name, item, index, entries) => {
          assert.equal(entries, payload);
          assert.equal(item, payload[index]);
          calls += 1;
          const total = entries.reduce(
            (sum, entry) => sum + (typeof entry.value === "number" ? entry.value : 0),
            0,
          );
          return <span>{`${name}: ${(Number(value) / total) * 100}%`}</span>;
        }}
      />
    </ChartContainer>,
  );
  assert.equal(calls, 2);
  assert.match(html, /Desktop: 30%/);
  assert.match(html, /Mobile: 70%/);
});

test("tooltip formatters preserve zero and empty series names", () => {
  const payload = [
    { graphicalItemId: "zero", dataKey: "zero", name: 0, value: 12 },
    { graphicalItemId: "empty", dataKey: "empty", name: "", value: 7 },
  ] satisfies NonNullable<ComponentProps<typeof ChartTooltipContent>["payload"]>;
  const names: Array<string | number> = [];
  const html = renderToStaticMarkup(
    <ChartContainer config={{}}>
      <ChartTooltipContent
        active
        payload={payload}
        formatter={(value, name, item, index, entries) => {
          assert.ok(name !== undefined);
          names.push(name);
          assert.equal(entries, payload);
          assert.equal(item, payload[index]);
          return <span>{`Formatted ${item.dataKey}: $${value}`}</span>;
        }}
      />
    </ChartContainer>,
  );
  assert.deepEqual(names, [0, ""]);
  assert.match(html, /Formatted zero: \$12/);
  assert.match(html, /Formatted empty: \$7/);
});

test("tooltip formatter indices match the complete payload when a series is hidden", () => {
  const payload = [
    { graphicalItemId: "hidden", dataKey: "hidden", name: "Hidden", value: 5, type: "none" },
    { graphicalItemId: "revenue", dataKey: "revenue", name: "Revenue", value: 12 },
  ] satisfies NonNullable<ComponentProps<typeof ChartTooltipContent>["payload"]>;
  const indices: number[] = [];
  const html = renderToStaticMarkup(
    <ChartContainer config={{}}>
      <ChartTooltipContent
        active
        payload={payload}
        formatter={(value, name, item, index, entries) => {
          indices.push(index);
          assert.equal(entries, payload);
          assert.equal(item, entries[index]);
          return <span>{`${name}: $${value}`}</span>;
        }}
      />
    </ChartContainer>,
  );
  assert.deepEqual(indices, [1]);
  assert.match(html, /Revenue: \$12/);
  assert.doesNotMatch(html, /Hidden: \$5/);
});

test("all analytical recipes share one source across registry, gallery, and docs", () => {
  assert.deepEqual(charts.map((chart) => chart.registryName).sort(), [...recipeNames].sort());
  assert.ok(!fs.existsSync("src/examples/ui/chart"), "obsolete chart implementations remain");
  assert.deepEqual(
    fs.readdirSync("public/chart-source").sort(),
    recipeNames.map((name) => `${name}.json`).sort(),
  );

  for (const chart of charts) {
    const name = chart.registryName;
    const source = fs.readFileSync(`../registry/src/components/ui/${name}.tsx`, "utf8");
    const item = JSON.parse(fs.readFileSync(`public/r/${name}.json`, "utf8"));
    const payload = JSON.parse(fs.readFileSync(`public/chart-source/${name}.json`, "utf8"));
    assert.ok(payload.code === source, `${name}: source payload differs from the recipe`);
    assert.equal(typeof payload.highlightedCode, "string");
    const prefix = payload.highlightedCode.slice(0, 400);
    assert.ok(/<code\b/.test(payload.highlightedCode), `${name}: missing code element: ${prefix}`);
    assert.ok(
      /--shiki-dark:/.test(payload.highlightedCode),
      `${name}: missing dark syntax variables: ${prefix}`,
    );
    assert.ok(!("code" in chart), "gallery metadata must not embed source text");
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
    );
    assert.equal(typeof chart.component, "function");
    assert.match(source, /<table\b/);
    assert.match(source, /<caption\b/);
    assert.match(source, /<output\b/);
    assert.match(source, /isAnimationActive=\{false\}/);
  }
});
