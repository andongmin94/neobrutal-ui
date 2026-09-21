import tailwindcss from "@tailwindcss/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import press from "fumapress/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    press(),
    fumadocsMdx({
      forcedConfig: {
        default: {
          mdxOptions: {
            rehypeCodeOptions: {
              themes: { dark: "dark-plus" },
              defaultColor: false,
            },
          },
        },
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
