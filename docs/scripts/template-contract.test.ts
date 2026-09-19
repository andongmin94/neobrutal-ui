import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import { registryInstallCommand } from "../src/data/registry-endpoints";
import TEMPLATES from "../src/data/templates";

type CatalogItem = {
  categories?: string[];
  description: string;
  name: string;
  registryDependencies?: string[];
  files: { path: string; type: string; target?: string }[];
};

function readCatalog() {
  return JSON.parse(fs.readFileSync("../registry/registry.json", "utf8")) as {
    items: CatalogItem[];
  };
}

test("template cards are an exact presentation of the installable registry templates", () => {
  const registryTemplates = readCatalog().items.filter((item) => item.categories?.includes("template"));
  const templateByName = new Map(registryTemplates.map((item) => [item.name, item]));

  assert.equal(new Set(TEMPLATES.map((template) => template.slug)).size, TEMPLATES.length);
  assert.equal(new Set(TEMPLATES.map((template) => template.registryItem)).size, TEMPLATES.length);
  assert.deepEqual(
    TEMPLATES.map((template) => template.registryItem).sort(),
    registryTemplates.map((item) => item.name).sort(),
  );

  for (const template of TEMPLATES) {
    const item = templateByName.get(template.registryItem);
    assert.ok(item, `${template.registryItem}: registry item is missing`);
    assert.equal(template.description, item.description);
    assert.equal(template.installCommand, registryInstallCommand(template.registryItem));
    const page = fs.readFileSync(`content/templates/${template.slug}.mdx`, "utf8");
    assert.ok(page.includes(`description: ${item.description}\n`), template.slug);
  }
});

test("template thumbnails render current templates rather than stale screenshot assets", () => {
  const source = fs.readFileSync("app/components/template-pages.tsx", "utf8");
  assert.match(source, /<TemplateThumbnail>[\s\S]*?<TemplateDetailPage slug=\{template\.slug\}/);
  assert.doesNotMatch(source, /template\.preview|<iframe/);
  assert.ok(!fs.existsSync("public/template-previews"));
});

test("compositions do not reinstall the base and explicit module targets respect aliases", () => {
  const items = readCatalog().items.filter((item) =>
    item.categories?.some((category) => ["template", "recipe"].includes(category)),
  );
  assert.ok(items.length > 0);
  for (const item of items) {
    assert.ok(
      !item.registryDependencies?.some((dependency) => dependency.endsWith("/neobrutal-ui.json")),
      `${item.name}: composition reinstalls the base theme`,
    );
    for (const file of item.files) {
      if (file.type === "registry:page" || !file.target) continue;
      assert.match(file.target, /^@(components|ui|lib|hooks)\//, `${item.name}: ${file.path}`);
    }
  }
});
