import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { cloneElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "../src/components/ui/chart";
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

test("chart content keeps explicit HTML attributes separate from injected Recharts props", () => {
  const tooltipProps = {
    active: true,
    payload: [{ graphicalItemId: "visits", dataKey: "visits", name: "Visits", value: 120 }],
    coordinate: { x: 20, y: 30 },
    activeIndex: "0",
    contentStyle: { color: "purple" },
    wrapperStyle: { opacity: 0.5 },
    viewBox: { x: 0, y: 0, width: 320, height: 200 },
    allowEscapeViewBox: { x: false, y: false },
    isAnimationActive: false,
  };
  const legendProps = {
    payload: [{ dataKey: "visits", value: "Visits", color: "blue" }],
    layout: "horizontal",
    iconSize: 14,
    wrapperStyle: { color: "purple" },
    chartWidth: 320,
    chartHeight: 200,
  };
  const content = [
    cloneElement(
      <ChartTooltipContent
        className="tooltip-appearance"
        htmlProps={{
          id: "consumer-tooltip",
          role: "status",
          "aria-label": "Visits breakdown",
          "data-content": "tooltip",
          title: "Inspect visits",
          className: "tooltip-html",
          style: { letterSpacing: "1px" },
        }}
      />,
      tooltipProps,
    ),
    cloneElement(
      <ChartLegendContent
        className="legend-appearance"
        htmlProps={{
          id: "consumer-legend",
          role: "list",
          "aria-label": "Chart series",
          "data-content": "legend",
          title: "Inspect series",
          className: "legend-html",
          style: { letterSpacing: "1px" },
        }}
      />,
      legendProps,
    ),
  ];

  for (const [index, part] of content.entries()) {
    const html = renderToStaticMarkup(<ChartContainer config={{}}>{part}</ChartContainer>);
    const name = index === 0 ? "tooltip" : "legend";
    const tag = html.match(new RegExp(`<div\\b[^>]*id="consumer-${name}"[^>]*>`))?.[0];
    assert.ok(tag);
    assert.match(tag, index === 0 ? /role="status"/ : /role="list"/);
    assert.match(tag, index === 0 ? /aria-label="Visits breakdown"/ : /aria-label="Chart series"/);
    assert.match(tag, index === 0 ? /title="Inspect visits"/ : /title="Inspect series"/);
    assert.match(tag, /style="letter-spacing:1px"/);
    assert.ok(tag.includes(`data-content="${name}"`));
    assert.ok(tag.includes(`${name}-appearance`));
    assert.ok(tag.includes(`${name}-html`));
    assert.doesNotMatch(
      tag,
      /\b(?:payload|coordinate|activeIndex|contentStyle|wrapperStyle|viewBox|allowEscapeViewBox|isAnimationActive|layout|iconSize|chartWidth|chartHeight)=/i,
    );
  }
});

test("tooltip announcements follow the Recharts accessibility layer and explicit HTML overrides", () => {
  const payload = [{ graphicalItemId: "visits", dataKey: "visits", name: "Visits", value: 120 }];
  for (const accessibilityLayer of [false, true]) {
    const html = renderToStaticMarkup(
      <ChartContainer config={{}}>
        <ChartTooltipContent
          active
          payload={payload}
          accessibilityLayer={accessibilityLayer}
          htmlProps={{ id: "announcement" }}
        />
      </ChartContainer>,
    );
    const tag = html.match(/<div\b[^>]*id="announcement"[^>]*>/)?.[0];
    assert.ok(tag);
    if (accessibilityLayer) {
      assert.match(tag, /role="status"/);
      assert.match(tag, /aria-live="assertive"/);
    } else {
      assert.doesNotMatch(tag, /\brole=|aria-live=/);
    }
  }

  const html = renderToStaticMarkup(
    <ChartContainer config={{}}>
      <ChartTooltipContent
        active
        payload={payload}
        accessibilityLayer
        htmlProps={{ id: "custom-announcement", role: "tooltip", "aria-live": "polite" }}
      />
    </ChartContainer>,
  );
  const tag = html.match(/<div\b[^>]*id="custom-announcement"[^>]*>/)?.[0];
  assert.ok(tag);
  assert.match(tag, /role="tooltip"/);
  assert.match(tag, /aria-live="polite"/);
});

test("tooltip headers preserve numeric axis labels including zero", () => {
  const payload = [{ graphicalItemId: "visits", dataKey: "visits", name: "Visits", value: 120 }];
  for (const label of [0, 7, "7"]) {
    const html = renderToStaticMarkup(
      <ChartContainer config={{ visits: { label: "Visits" } }}>
        <ChartTooltipContent active payload={payload} label={label} />
      </ChartContainer>,
    );
    assert.match(html, new RegExp(`<div class="font-medium">${label}</div>`));
  }
  let formattedLabel: unknown;
  renderToStaticMarkup(
    <ChartContainer config={{ visits: { label: "Visits" } }}>
      <ChartTooltipContent
        active
        payload={payload}
        label={0}
        labelFormatter={(label) => {
          formattedLabel = label;
          return `Sample ${label}`;
        }}
      />
    </ChartContainer>,
  );
  assert.equal(formattedLabel, 0);
});

test("legends use native series names unless an explicit config label is supplied", () => {
  const payload = [{ dataKey: "visits", value: "Visits", color: "blue" }];
  for (const [label, expected] of [
    [undefined, "Visits"],
    [0, "0"],
    [<strong key="configured">Configured label</strong>, "<strong>Configured label</strong>"],
  ] as const) {
    const html = renderToStaticMarkup(
      <ChartContainer config={{ visits: { color: "blue", label } }}>
        <ChartLegendContent payload={payload} />
      </ChartContainer>,
    );
    if (label === 0) assert.match(html, /<\/div>0<\/div>/);
    else assert.ok(html.includes(expected));
    if (label !== undefined) assert.ok(!html.includes("Visits"));
  }
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
