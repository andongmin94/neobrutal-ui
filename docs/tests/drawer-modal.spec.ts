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
const registrySource = resolve(root, "../registry/src");
const cacheRoot = join(root, "test-results");
let cacheDirectory: string | undefined;

test.beforeAll(async () => {
  await mkdir(cacheRoot, { recursive: true });
  cacheDirectory = await mkdtemp(join(cacheRoot, "drawer-modal-vite-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir: cacheDirectory,
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@/components/ui": join(registrySource, "components/ui"),
        "@/lib/utils": join(registrySource, "lib/utils.ts"),
      },
    },
    server: { host: "127.0.0.1", port: 4186, fs: { allow: [join(root, "..")] } },
    appType: "custom",
    plugins: [tailwindcss()],
    oxc: { jsx: { runtime: "automatic" } },
    // A fixed fixture graph lets Vite finish its cold-cache commit before listening.
    optimizeDeps: {
      noDiscovery: true,
      include: [
        "react",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@base-ui/react/drawer",
        "clsx",
        "tailwind-merge",
      ],
    },
  });
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] !== "/") return next();
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Drawer modal regression</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/drawer-modal.tsx"></script></body></html>',
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

test("non-modal drawer leaves background controls clickable", async ({ page }) => {
  await page.goto(`${origin}?modal=false`);
  const trigger = page.getByRole("button", { name: "Open drawer", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Drawer modal behavior" })).toBeVisible();
  const background = page.getByTestId("background-action");
  if (test.info().project.use.hasTouch) await background.tap({ timeout: 2000 });
  else await background.click({ timeout: 2000 });
  await expect(page.locator('[data-slot="drawer-overlay"]')).toHaveCount(0);
  await expect(page.getByTestId("background-count")).toHaveText("1");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close drawer", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("default modal drawer preserves its backdrop and focus return", async ({ page }) => {
  await page.goto(origin);
  const trigger = page.getByRole("button", { name: "Open drawer", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Drawer modal behavior" })).toBeVisible();
  await expect(page.locator('[data-slot="drawer-overlay"]')).toBeVisible();
  const background = page.getByTestId("background-action");
  const point = await background.boundingBox();
  expect(point).not.toBeNull();
  const x = point!.x + point!.width / 2;
  const y = point!.y + point!.height / 2;
  if (test.info().project.use.hasTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect(page.getByTestId("background-count")).toHaveText("0");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
