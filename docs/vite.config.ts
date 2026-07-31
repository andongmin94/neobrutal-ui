import { existsSync } from "node:fs";
import path from "node:path";

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig, type Plugin } from "vite";

function cleanUrlPreview(): Plugin {
  const outputRoot = path.resolve("build/client");

  return {
    name: "neobrutal-ui-clean-url-preview",
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const [pathname, query] = (request.url ?? "/").split("?", 2);
        if (!pathname || pathname.endsWith("/") || path.extname(pathname)) {
          next();
          return;
        }

        let relativePath: string;
        try {
          relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
        } catch {
          next();
          return;
        }

        const indexPath = path.resolve(outputRoot, relativePath, "index.html");

        if (indexPath.startsWith(`${outputRoot}${path.sep}`) && existsSync(indexPath)) {
          request.url = `${pathname}/${query ? `?${query}` : ""}`;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [cleanUrlPreview(), fumadocsMdx(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
