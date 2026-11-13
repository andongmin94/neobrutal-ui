import { createPress, type HeadTag } from "fumapress";
import { metaSchema, pageSchema } from "fumapress/schema";
import { oramaSearchPlugin } from "fumapress/plugins/orama-search";
import { sitemapPlugin } from "fumapress/plugins/sitemap";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

import { HydrationMarker } from "@/site/components/hydration-marker";
import { SiteAnalytics } from "@/site/components/site-analytics";
import { SiteLayout } from "@/site/components/site-layout";
import { BridgeToaster } from "@/site/components/toaster";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_IMAGE_URL } from "@/site/lib/site";

const docs = defineDocs({
  dir: "content",
  docs: {
    async: true,
    schema: pageSchema.extend({
      layout: z.string().optional(),
      shadcnDocsLink: z.string().url().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

const themeScript = `
(() => {
  let current;
  try {
    current = localStorage.getItem("neobrutal-ui-theme");
  } catch {
    // A blocked preference store must not prevent the first theme paint.
  }
  const theme = current === "light" || current === "dark"
    ? current
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

const app = createPress(docs.toFumadocsSource(), { mode: "force-static" }).plugins(
  oramaSearchPlugin(),
  sitemapPlugin(),
);

export default app.config({
  preset: [],
  site: {
    name: SITE_NAME,
    baseUrl: SITE_URL,
  },
  head({ page }): HeadTag[] {
    if (!page) {
      return [
        { tag: "meta", attrs: { property: "og:type", content: "website" } },
        { tag: "meta", attrs: { property: "og:site_name", content: SITE_NAME } },
        { tag: "meta", attrs: { property: "og:image", content: SOCIAL_IMAGE_URL } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        { tag: "meta", attrs: { name: "twitter:image", content: SOCIAL_IMAGE_URL } },
        { tag: "link", attrs: { rel: "icon", href: "/logo.svg", type: "image/svg+xml" } },
      ];
    }
    const title =
      page.url === "/" ? `${SITE_NAME} - Component directory` : `${page.data.title} - ${SITE_NAME}`;
    const description = page.data.description ?? SITE_DESCRIPTION;

    return [
      { tag: "title", children: title },
      { tag: "meta", attrs: { name: "description", content: description } },
      { tag: "meta", attrs: { property: "og:title", content: title } },
      { tag: "meta", attrs: { property: "og:description", content: description } },
      { tag: "meta", attrs: { name: "twitter:title", content: title } },
      { tag: "meta", attrs: { name: "twitter:description", content: description } },
    ];
  },
  ui: {
    providerProps: {
      search: { enabled: false },
      theme: { enabled: false },
    },
    renderRoot: ({ children, lang, head }) => (
      <html lang={lang ?? "en"} suppressHydrationWarning>
        <head>
          {head}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body>
          {children}
          <HydrationMarker />
          <SiteAnalytics />
          <BridgeToaster />
        </body>
      </html>
    ),
    renderPage: ({ page, body, toc }) => (
      <SiteLayout
        description={page.data.description}
        shadcnDocsLink={page.data.shadcnDocsLink}
        title={page.data.title}
        toc={toc}
      >
        {body}
      </SiteLayout>
    ),
  },
});
