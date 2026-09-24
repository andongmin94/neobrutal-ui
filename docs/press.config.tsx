import { defineConfig, getPressContext, type AppShape, type PressPlugin } from "fumapress";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import { metaSchema, pageSchema } from "fumapress/adapters/mdx/schema";
import { createRootLayout } from "fumapress/layouts/root";
import { oramaSearchPlugin } from "fumapress/plugins/orama-search";
import { sitemapPlugin } from "fumapress/plugins/sitemap";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

import { getMDXComponents } from "@/site/components/mdx-components";
import { HydrationMarker } from "@/site/components/hydration-marker";
import NotFound from "@/site/components/not-found";
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
  const current = localStorage.getItem("neobrutal-ui-theme");
  const theme = current === "light" || current === "dark"
    ? current
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

const PressRoot = createRootLayout({
  providerProps: {
    search: { enabled: false },
    theme: { enabled: false },
  },
});

async function PageLayout({ page }: { page: AppShape["page"] }) {
  const context = getPressContext();
  const data = page.data as {
    description?: string;
    shadcnDocsLink?: string;
    title: string;
  };
  const body = (await context.getPageBody(page))?.node;
  const toc = await context.getPageToc(page);

  if (body == null) throw new Error(`No MDX body for ${page.path}`);

  return (
    <SiteLayout
      description={data.description}
      shadcnDocsLink={data.shadcnDocsLink}
      title={data.title}
      toc={toc}
    >
      {body}
    </SiteLayout>
  );
}

const config = defineConfig({
  content: docs.toFumadocsSource(),
  mode: "static",
  preset: false,
  site: {
    name: SITE_NAME,
    baseUrl: SITE_URL,
  },
  meta: {
    root() {
      return (
        <>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta property="og:image" content={SOCIAL_IMAGE_URL} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </>
      );
    },
  },
  renderRoot: ({ children, lang }) => (
    <PressRoot lang={lang}>
      {children}
      <HydrationMarker />
      <BridgeToaster />
    </PressRoot>
  ),
  renderPage: ({ page }) => <PageLayout page={page} />,
  renderNotFound: () => <NotFound />,
});

type SiteContext = typeof config.$context;

const githubStarsPlugin: PressPlugin<SiteContext> = {
  name: "site:github-stars",
  createPages({ createApiIsomorphic }) {
    createApiIsomorphic({
      render: "static",
      path: "/api/github-stars",
      async handler() {
        try {
          const response = await fetch("https://api.github.com/repos/andongmin94/neobrutal-ui", {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "neobrutal-ui-build",
            },
          });

          if (!response.ok) return Response.json({ count: null });

          const payload = await response.json();
          const count =
            typeof payload.stargazers_count === "number" ? payload.stargazers_count : null;

          return Response.json({ count });
        } catch {
          return Response.json({ count: null });
        }
      },
    });
  },
};

const metadataPlugin: PressPlugin<SiteContext> = {
  name: "site:metadata",
  init() {
    this.interceptPageMeta(({ page }) => {
      const isHome = page.url === "/";
      const title = isHome
        ? `${SITE_NAME} - Component directory`
        : `${page.data.title} - ${SITE_NAME}`;
      const description = page.data.description ?? SITE_DESCRIPTION;

      return (
        <>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
        </>
      );
    });
  },
};

export default config
  .adapters(
    fumadocsMdx<SiteContext>({
      getMdxComponents() {
        return getMDXComponents();
      },
    }),
  )
  .plugins(
    oramaSearchPlugin<SiteContext>(),
    sitemapPlugin<SiteContext>(),
    githubStarsPlugin,
    metadataPlugin,
  );
