import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { SITE_URL } from "../src/site/lib/site";

const output = "dist/public";

test("every sitemap page has one matching canonical URL and Open Graph URL", () => {
  const sitemap = fs.readFileSync(path.join(output, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
  assert.ok(urls.length > 0, "the built sitemap must contain published pages");

  for (const url of urls) {
    const canonical = new URL(url);
    assert.equal(canonical.origin, SITE_URL, url);
    assert.equal(canonical.search, "", url);
    assert.equal(canonical.hash, "", url);
    const html = fs.readFileSync(path.join(output, canonical.pathname, "index.html"), "utf8");
    const tags = [...html.matchAll(/<(?:link|meta)\b[^>]*>/g)].map(([tag]) =>
      Object.fromEntries(
        [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
      ),
    );
    const links = tags.filter((tag) => tag.rel === "canonical");
    const openGraph = tags.filter((tag) => tag.property === "og:url");
    assert.equal(links.length, 1, `${url}: expected one canonical link`);
    assert.equal(links[0].href, url, `${url}: canonical differs from sitemap`);
    assert.equal(openGraph.length, 1, `${url}: expected one Open Graph URL`);
    assert.equal(openGraph[0].content, url, `${url}: Open Graph URL differs from sitemap`);
  }
});

test("the published robots file advertises the canonical sitemap", () => {
  const robots = fs.readFileSync(path.join(output, "robots.txt"), "utf8");
  const sitemaps = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gm)].map(([, url]) => url);
  assert.ok(sitemaps.includes(`${SITE_URL}/sitemap.xml`));
});
