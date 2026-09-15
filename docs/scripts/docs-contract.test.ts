import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import colors from "../src/data/colors";
import {
  createCustomizedTheme,
  serializeThemeCss,
  serializeThemeVariables,
  defaultThemeSettings,
  themeCss,
} from "../src/data/theme-styles";
import { COMPONENT_DIRECTORY_LINKS } from "../src/data/component-directory";
import descriptions from "../src/data/component-descriptions.json";
import components from "../src/data/components";

test("all palette exports match the installable registry contract", () => {
  for (const color of colors) {
    const item = JSON.parse(
      fs.readFileSync(`../registry/public/r/theme-${color.name}.json`, "utf8"),
    );
    assert.deepEqual(createCustomizedTheme(color), item.cssVars);
    assert.deepEqual(themeCss, item.css);
    const css = serializeThemeCss(color);
    for (const section of Object.values(item.cssVars) as Record<string, string>[]) {
      for (const [key, value] of Object.entries(section))
        assert.ok(css.includes(`--${key}: ${value};`), `${color.name}: missing ${key}`);
    }
  }
});
test("customization changes the same light/dark variables without dropping tokens", () => {
  const settings = {
    ...defaultThemeSettings,
    radius: 12,
    shadowX: -2,
    shadowY: 6,
    baseWeight: 600,
    headingWeight: 900,
  };
  const vars = createCustomizedTheme(colors[0], settings);
  assert.equal(vars.light.radius, "12px");
  assert.equal(vars.dark.radius, "12px");
  assert.equal(vars.dark["box-shadow-x"], "-2px");
  assert.equal(vars.light["base-font-weight"], "600");
  assert.ok(
    vars.theme["color-primary"] && vars.theme["color-sidebar"] && vars.theme["color-destructive"],
  );
});
test("shared theme sources are byte-identical after registry synchronization", () => {
  for (const name of ["theme.ts", "theme-styles.ts"])
    assert.equal(
      fs.readFileSync(`src/data/${name}`, "utf8"),
      fs.readFileSync(`../registry/src/data/${name}`, "utf8"),
    );
});
test("every directory card has a purpose-specific description", () => {
  for (const link of COMPONENT_DIRECTORY_LINKS) {
    const slug = link.href.split("/").pop()!;
    assert.ok((descriptions as Record<string, string>)[slug]?.length > 15, slug);
  }
});
test("markdown typography never uses bare descendant element selectors", () => {
  const css = fs.readFileSync("app/styles/content.css", "utf8");
  assert.doesNotMatch(css, /\.docs-content\s+(?:h[1-6]|p|a|ol|ul|li|strong)\b/);
});
test("all documented preview names resolve to a registered loader", () => {
  for (const file of fs.readdirSync("content/docs").filter((name) => name.endsWith(".mdx"))) {
    const source = fs.readFileSync(`content/docs/${file}`, "utf8");
    for (const match of source.matchAll(/<ComponentPreview\s+([^>]+)>/g)) {
      const attributes = match[1];
      if (attributes.includes('type="star"')) continue;
      const slug = attributes.match(/component="([^"]+)"/)?.[1];
      const example = attributes.match(/example="([^"]+)"/)?.[1];
      const component = components.find(
        (entry) =>
          entry.name.toLowerCase().replaceAll(" ", "-") ===
          slug?.toLowerCase().replaceAll(" ", "-"),
      );
      assert.ok(
        component && (example ? component.examples?.[example] : component.exampleComponent),
        `${file}: ${slug}/${example ?? "default"}`,
      );
    }
  }
});

test("the docs stylesheet is generated from the same default theme", () => {
  const normalize = (value: string) =>
    value.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => hex.toLowerCase()).replace(/\s+/g, "");
  assert.equal(
    normalize(fs.readFileSync("src/styling/theme.css", "utf8")),
    normalize(serializeThemeVariables()),
  );
});
