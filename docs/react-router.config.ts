import { glob } from "node:fs/promises";

import type { Config } from "@react-router/dev/config";
import { getSlugs } from "fumadocs-core/source";

function contentUrl(entry: string) {
  const slugs = getSlugs(entry.replaceAll("\\", "/"));
  return slugs.length === 0 ? "/" : `/${slugs.join("/")}`;
}

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const paths = new Set(getStaticPaths());

    paths.add("/");
    paths.add("/api/search");
    paths.add("/sitemap.xml");

    for await (const entry of glob("**/*.mdx", { cwd: "content" })) {
      paths.add(contentUrl(entry));
    }

    return [...paths];
  },
} satisfies Config;
