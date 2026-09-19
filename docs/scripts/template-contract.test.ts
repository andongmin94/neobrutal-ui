import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import { registryInstallCommand } from "../src/data/registry-endpoints";
import TEMPLATES from "../src/data/templates";

type CatalogItem = {
  categories?: string[];
  description: string;
  name: string;
};

test("template cards are an exact presentation of the installable registry templates", () => {
  const catalog = JSON.parse(fs.readFileSync("../registry/registry.json", "utf8")) as {
    items: CatalogItem[];
  };
  const registryTemplates = catalog.items.filter((item) => item.categories?.includes("template"));
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
    const page = fs.readFileSync(`content/templates/${template.slug}.mdx`, "utf8");
    assert.equal(
      page.match(/^description: (.+)$/m)?.[1],
      item.description,
      `${template.slug}: page metadata must describe the installed template`,
    );
    assert.equal(template.installCommand, registryInstallCommand(template.registryItem));
    assert.ok(
      fs.existsSync(`public${template.preview}`),
      `${template.registryItem}: preview image is missing`,
    );
  }
});
