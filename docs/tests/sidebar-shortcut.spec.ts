import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import tailwindcss from "@tailwindcss/vite";
import { createServer, type ViteDevServer } from "vite";

let server: ViteDevServer;
let origin: string;
const root = fileURLToPath(new URL("..", import.meta.url));
const source = resolve(root, "../registry/src");
const cacheRoot = join(root, "test-results");
let cacheDirectory: string | undefined;

test.beforeAll(async () => {
  await mkdir(cacheRoot, { recursive: true });
  cacheDirectory = await mkdtemp(join(cacheRoot, "sidebar-shortcut-vite-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir: cacheDirectory,
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@/components/ui": join(source, "components/ui"),
        "@/hooks/use-mobile": join(source, "hooks/use-mobile.ts"),
        "@/lib/utils": join(source, "lib/utils.ts"),
      },
    },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [join(root, "..")] } },
    appType: "custom",
    plugins: [tailwindcss()],
    oxc: { jsx: { runtime: "automatic" } },
    optimizeDeps: { entries: ["tests/fixtures/sidebar-shortcut.tsx"] },
  });
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] !== "/") return next();
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sidebar shortcut</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/sidebar-shortcut.tsx"></script></body></html>',
    );
  });
  await server.listen();
  origin = server.resolvedUrls!.local[0];
});

test.afterAll(async () => {
  try {
    await server?.close();
  } finally {
    if (cacheDirectory) {
      assert.equal(dirname(cacheDirectory), cacheRoot, "Unexpected Vite cache path");
      await rm(cacheDirectory, { recursive: true, force: true, maxRetries: 3 });
    }
  }
});

test("Sidebar shortcuts preserve editing, cancelled and composing events", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin);
    const open = page.getByRole("status", { name: "Current sidebar open", exact: true });
    const initial = width < 768 ? "false" : "true";
    await expect(open).toHaveText(initial);
    for (const name of ["Editor input", "Editor notes", "Rich editor"]) {
      await page.getByRole("textbox", { name, exact: true }).press("Control+b");
      await expect(open).toHaveText(initial);
    }
    await page.getByRole("combobox", { name: "Editor choice" }).press("Control+b");
    await expect(open).toHaveText(initial);
    await page.getByRole("button", { name: "Owned shortcut", exact: true }).press("Control+b");
    await expect(open).toHaveText(initial);
    const target = page.getByRole("button", { name: "Shortcut target", exact: true });
    await target.evaluate((element) =>
      element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "b",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
          isComposing: true,
        }),
      ),
    );
    await expect(open).toHaveText(initial);
    await target.press("Control+b");
    await expect(open).toHaveText(initial === "true" ? "false" : "true");
    await target.press("Meta+b");
    await expect(open).toHaveText(initial);
  }
});
