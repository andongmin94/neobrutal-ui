import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const siteOrigin = "https://neobrutal-ui.andongmin.com";

export function measureInitialJavaScript(publicDirectory: string, route: string) {
  const html = fs.readFileSync(path.join(publicDirectory, route, "index.html"), "utf8");
  // Inline scripts may contain HTML-looking strings. Only their opening tags are relevant.
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, "$1");
  const modules = new Set<string>();

  function attribute(tag: string, name: string) {
    const match = tag.match(
      new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
    );
    return match?.[1] ?? match?.[2] ?? match?.[3];
  }

  for (const tag of markup.match(/<(?:script|link)\b[^>]*>/gi) ?? []) {
    const script = /^<script\b/i.test(tag);
    const relevant = script
      ? attribute(tag, "type")?.toLowerCase() === "module"
      : attribute(tag, "rel")?.toLowerCase().split(/\s+/).includes("modulepreload");
    const value = relevant ? attribute(tag, script ? "src" : "href") : undefined;
    if (!value) continue;
    const url = new URL(value.replaceAll("&amp;", "&"), siteOrigin);
    assert.equal(
      url.origin,
      siteOrigin,
      `${route}: cannot budget an external initial module ${value}`,
    );
    assert.match(url.pathname, /\.m?js$/, `${route}: initial module must be JavaScript`);
    modules.add(url.pathname + url.search);
  }

  assert.ok(modules.size, `${route}: no initial JavaScript modules were emitted`);
  const assets = [...modules].map((url) => {
    const pathname = new URL(url, siteOrigin).pathname;
    const content = fs.readFileSync(path.join(publicDirectory, decodeURIComponent(pathname)));
    return { path: url, bytes: content.length, gzipBytes: gzipSync(content).length };
  });
  return {
    route,
    assets,
    bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
    gzipBytes: assets.reduce((sum, asset) => sum + asset.gzipBytes, 0),
  };
}
