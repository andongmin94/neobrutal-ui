import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

// Mount the exported components directly so consumer props are exercised without docs wrappers.
let server: ViteDevServer;
let origin: string;
test.beforeAll(async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  server = await createServer({
    configFile: false,
    root,
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    server: { host: "127.0.0.1", port: 0 },
    appType: "custom",
  });
  server.middlewares.use((request, response, next) => {
    if (request.url !== "/") return next();
    response.setHeader("Content-Type", "text/html");
    response.end(
      '<!doctype html><html lang="en"><head><title>Component composition</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/component-composition.tsx"></script></body></html>',
    );
  });
  await server.listen();
  origin = server.resolvedUrls!.local[0];
});
test.afterAll(async () => {
  await server?.close();
});
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(origin);
  await expect(page.getByTestId("badge-refs")).toHaveText("true");
});

test("Badge merges the rendered link's handlers, styles and refs", async ({ page }) => {
  const link = page.getByRole("link", { name: "Published" });
  await expect(link).toHaveCSS("color", "rgb(200, 0, 0)");
  await expect(link).toHaveCSS("font-weight", "700");
  await link.focus();
  await link.press("Enter");
  await expect(page.getByTestId("badge-calls")).toHaveText("inner,outer");
  await expect(page).toHaveURL(`${origin}#destination`);
});

test("InputGroupAddon preserves consumer clicks, cancellation and nested button focus", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Search field" });
  const button = page.getByRole("button", { name: "Keep button focus" });
  await button.click();
  await page.getByTestId("normal-addon").click();
  await expect(input).toBeFocused();
  await expect(page.getByTestId("addon-calls")).toHaveText("1");
  await button.click();
  await page.getByTestId("cancelled-addon").click();
  await expect(input).not.toBeFocused();
  await expect(page.getByTestId("addon-cancelled")).toHaveText("1");
  await button.click();
  await expect(input).not.toBeFocused();
});

test("Carousel keeps navigation when consumer handlers are present and honors cancellation", async ({
  page,
}) => {
  const next = page.getByRole("button", { name: "Next slide" });
  const previous = page.getByRole("button", { name: "Previous slide" });
  const block = page.getByRole("button", { name: "Block next navigation" });
  await expect(next).toBeEnabled();
  await expect(previous).toBeDisabled();
  await block.click();
  await next.click();
  await expect(page.getByTestId("next-calls")).toHaveText("1");
  await expect(previous).toBeDisabled();
  await block.click();
  await next.click();
  await expect(previous).toBeEnabled();
  await next.click();
  await expect(next).toBeDisabled();
  await expect(page.getByTestId("next-calls")).toHaveText("3");
  await previous.click();
  await previous.click();
  await expect(previous).toBeDisabled();
  await expect(page.getByTestId("previous-calls")).toHaveText("2");
});

test("Sidebar notifies uncontrolled changes, composes rail clicks and honors cancelled toggles", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Toggle Sidebar", exact: true }).first();
  const rail = page.locator('[data-slot="sidebar-rail"]');
  await trigger.click();
  await expect(page.getByTestId("sidebar-state")).toHaveText("expanded");
  await expect(page.getByTestId("sidebar-observed")).toHaveText("true");
  await page.getByRole("button", { name: "Cancel sidebar toggle" }).click();
  await trigger.click();
  await expect(page.getByTestId("sidebar-state")).toHaveText("expanded");
  await expect(page.getByTestId("sidebar-calls")).toHaveText("2");
  await rail.click();
  await expect(page.getByTestId("sidebar-state")).toHaveText("collapsed");
  await expect(page.getByTestId("sidebar-observed")).toHaveText("false");
  await expect(page.getByTestId("rail-calls")).toHaveText("1");
});

test("A tooltip does not make a disabled SidebarMenuButton actionable", async ({ page }) => {
  const button = page.getByRole("button", { name: "Unavailable action" });
  await expect(button).toBeDisabled();
  await button.evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByTestId("disabled-calls")).toHaveText("0");
  await button.focus();
  await expect(button).not.toBeFocused();
});
