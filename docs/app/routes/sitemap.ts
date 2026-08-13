import { SITE_URL } from "~/lib/site";
import { source } from "~/lib/source";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function loader() {
  const paths = new Set(["/", ...source.getPages().map((page) => page.url)]);
  const urls = [...paths]
    .sort()
    .map((path) => `  <url><loc>${escapeXml(new URL(path, SITE_URL).href)}</loc></url>`)
    .join("\n");
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
