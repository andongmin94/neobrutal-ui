import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, postcssIsolateStyles } from "vitepress";

import codeImport from "./markdown/code-import";

const siteUrl = process.env.DOCS_BASE_URL || "https://neobrutal-ui.andongmin.com";

export default defineConfig({
  srcDir: "content",
  cleanUrls: true,
  lang: "en-US",
  title: "neobrutal-ui",
  description:
    "A source-owned neobrutalist component registry built with Base UI, React, and Tailwind CSS.",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#ffcc00" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "neobrutal-ui" }],
    ["meta", { property: "og:image", content: `${siteUrl}/preview.png` }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: `${siteUrl}/preview.png` }],
  ],
  sitemap: {
    hostname: siteUrl,
  },
  themeConfig: {
    search: {
      provider: "local",
      options: {
        miniSearch: {
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
          },
        },
      },
    },
  },
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    config(markdown) {
      markdown.use(codeImport);
    },
  },
  vite: {
    publicDir: fileURLToPath(new URL("../public", import.meta.url)),
    plugins: [tailwindcss(), react()],
    build: { chunkSizeWarningLimit: 520 },
    css: {
      postcss: {
        plugins: [
          postcssIsolateStyles({
            includeFiles: [/content\.css$/],
          }),
        ],
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("../src", import.meta.url)),
      },
    },
  },
});
