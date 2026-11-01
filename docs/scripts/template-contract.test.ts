import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import BlogTemplate from "../src/components/templates/blog-template";
import LinkHubTemplate from "../src/components/templates/link-hub-template";
import { registryInstallCommand } from "../src/data/registry-endpoints";
import TEMPLATES from "../src/data/templates";
import type { BlogPost } from "../src/lib/blog-posts";
import { LINK_HUB_LINKS, LINK_HUB_PROFILE, type LinkHubLink } from "../src/lib/link-hub-data";

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
  const registryTemplates = readCatalog().items.filter((item) =>
    item.categories?.includes("template"),
  );
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
  const source = fs.readFileSync("src/site/components/template-pages.tsx", "utf8");
  assert.match(source, /<TemplateThumbnail>[\s\S]*?<TemplateDemo slug=\{template\.slug\}/);
  assert.doesNotMatch(source, /template\.preview|<iframe/);
  assert.ok(!fs.existsSync("public/template-previews"));
});

test("blog renders supplied posts, derives topics and preserves the consumer's order", () => {
  const posts: readonly BlogPost[] = Object.freeze([
    {
      slug: "original-note",
      title: "Original customer note",
      summary: "Older application content.",
      topic: "All",
      publishedAt: "2025-01-01",
      publishedLabel: "Jan 1",
      readTime: "2 min",
      intro: "First note.",
      sections: [],
    },
    {
      slug: "latest-note",
      title: "Latest customer note",
      summary: "New application content.",
      topic: "Research",
      publishedAt: "2026-01-01",
      publishedLabel: "Jan 1",
      readTime: "4 min",
      intro: "Latest note.",
      sections: [],
    },
  ]);
  const html = renderToStaticMarkup(createElement(BlogTemplate, { posts, basePath: "/journal/" }));
  assert.match(html, /href="\/journal\/latest-note"/);
  assert.ok(html.indexOf("Latest customer note") < html.indexOf("Original customer note"));
  assert.match(html, /aria-pressed="true"[^>]*>All topics<\/button>/);
  assert.match(html, /aria-pressed="false"[^>]*>All<\/button>/);
  assert.match(html, />Research<\/button>/);
  assert.doesNotMatch(html, /Small Interfaces Age Better/);
  assert.equal(posts[0].slug, "original-note");
  const empty = renderToStaticMarkup(createElement(BlogTemplate, { posts: [] }));
  assert.match(empty, /No posts found\./);
  assert.doesNotMatch(empty, /href="\/blog\//);
});

test("link hub renders supplied profile, groups and destinations without demo fallbacks", () => {
  const links: readonly LinkHubLink[] = [
    {
      id: "guide",
      group: "All",
      title: "Customer guide",
      detail: "Read our guide",
      href: "/guide",
    },
    {
      id: "research",
      group: "Research",
      title: "Research library",
      detail: "External resources",
      href: "https://research.example.org",
      external: true,
      icon: "writing",
    },
  ];
  const profile = { name: "Mina Park", initials: "MP", handle: "@mina", bio: "Research notes." };
  const html = renderToStaticMarkup(createElement(LinkHubTemplate, { profile, links }));
  assert.match(html, />Mina Park<\/h1>/);
  assert.match(html, /href="\/guide"/);
  assert.match(html, /href="https:\/\/research.example.org" target="_blank"/);
  assert.match(html, /aria-pressed="true"[^>]*>All links<\/button>/);
  assert.match(html, /aria-pressed="false"[^>]*>All<\/button>/);
  assert.match(html, />Research<\/button>/);
  assert.doesNotMatch(html, /Alex Doe|hello@example.com|>Work<\/button>|aria-label="Contact"/);
  const empty = renderToStaticMarkup(createElement(LinkHubTemplate, { profile, links: [] }));
  assert.match(empty, />0 links<\/p>/);
  assert.doesNotMatch(empty, /<li\b/);
});

test("link hub demo props can cross a server-to-client boundary as data", () => {
  const props = { profile: LINK_HUB_PROFILE, links: LINK_HUB_LINKS };
  assert.deepEqual(JSON.parse(JSON.stringify(props)), props);
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
