import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Mount the exported components directly so consumer props are exercised without docs wrappers.
let server: ViteDevServer;
let origin: string;
const root = fileURLToPath(new URL("..", import.meta.url));
const cacheRoot = join(root, "test-results");
let cacheDirectory: string | undefined;
test.beforeAll(async () => {
  await mkdir(cacheRoot, { recursive: true });
  cacheDirectory = await mkdtemp(join(cacheRoot, "component-composition-vite-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir: cacheDirectory,
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    server: { host: "127.0.0.1", port: 0 },
    appType: "custom",
    plugins: [tailwindcss()],
    optimizeDeps: { entries: ["tests/fixtures/component-composition.tsx"] },
  });
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] !== "/") return next();
    response.setHeader("Content-Type", "text/html");
    response.end(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Component composition</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/component-composition.tsx"></script></body></html>',
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

test("Select forwards null changes and supports choosing again after clearing", async ({
  page,
}) => {
  await page.goto(`${origin}?surface=select-clear`);
  const trigger = page.getByRole("combobox", { name: "Selection", exact: true });
  await trigger.click();
  await page.getByRole("option", { name: "Clear selection", exact: true }).click();
  await expect(page.getByTestId("selection-value")).toHaveText("null");
  await expect(page.getByTestId("selection-calls")).toHaveText("[null]");
  await expect(page.locator('input[name="selection"]')).toHaveValue("");
  await expect(trigger).toContainText("No selection");
  await trigger.click();
  await page.getByRole("option", { name: "Bravo", exact: true }).click();
  await expect(page.getByTestId("selection-value")).toHaveText("b");
  await expect(page.getByTestId("selection-calls")).toHaveText('[null,"b"]');
  await expect(page.locator('input[name="selection"]')).toHaveValue("b");
});

test("Select clears controlled state when the selected option disappears", async ({ page }) => {
  await page.goto(`${origin}?surface=select-remove`);
  await page.getByRole("combobox", { name: "Selection", exact: true }).click();
  await expect(page.getByRole("option", { name: "Alpha", exact: true })).toBeVisible();
  // Model an option-data refresh while the modal popup remains open.
  await page
    .getByRole("button", { name: "Remove Alpha", exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByRole("option", { name: "Alpha", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("selection-value")).toHaveText("null");
  await expect(page.getByTestId("selection-calls")).toHaveText("[null]");
});

test("Select preserves native cancellation details when clearing", async ({ page }) => {
  await page.goto(`${origin}?surface=select-cancel`);
  const trigger = page.getByRole("combobox", { name: "Selection", exact: true });
  await trigger.click();
  await page.getByRole("option", { name: "Clear selection", exact: true }).click();
  await expect(page.getByTestId("selection-calls")).toHaveText("[null]");
  await expect(page.getByTestId("selection-value")).toHaveText("a");
  await expect(trigger).toContainText("Alpha");
  await expect(page.locator('input[name="selection"]')).toHaveValue("a");
});

test("Long Select lists fit short viewports and keep the final option reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 390 });
  for (const aligned of [false, true]) {
    await page.goto(`${origin}?surface=select-long&aligned=${aligned}`);
    const trigger = page.getByRole("combobox", { name: "Workspace", exact: true });
    await trigger.press("Enter");
    const popup = page.locator('[data-slot="select-content"]');
    await expect(popup).toBeVisible();
    if (aligned) {
      await expect(popup).toHaveAttribute("data-side", "none");
      await expect.poll(async () => (await popup.boundingBox())!.height).toBeGreaterThan(350);
    }
    await expect
      .poll(async () => {
        const box = await popup.boundingBox();
        return box !== null && box.y >= 0 && box.y + box.height <= 391;
      })
      .toBe(true);
    const list = popup.getByRole("listbox");
    await expect
      .poll(() => list.evaluate((node) => node.scrollHeight > node.clientHeight))
      .toBe(true);
    const finalOption = list.getByRole("option", { name: "Workspace 80", exact: true });
    await finalOption.scrollIntoViewIfNeeded();
    await expect(finalOption).toBeInViewport({ ratio: 1 });
    await finalOption.click();
    await expect(trigger).toContainText("Workspace 80");
  }
});

test("Command reports initially empty and refreshed empty option collections", async ({ page }) => {
  await page.goto(`${origin}?surface=command-empty`);
  const empty = page.locator('[data-slot="command-empty"]');
  await expect(empty).toHaveText("No options available");
  const input = page.getByRole("combobox", { name: "Find options", exact: true });
  await input.fill("missing");
  await expect(empty).toBeVisible();
  await input.clear();
  await expect(empty).toBeVisible();
  const toggle = page.getByRole("button", { name: "Toggle available options", exact: true });
  await toggle.click();
  await expect(page.getByRole("option", { name: "Loaded option", exact: true })).toBeVisible();
  await expect(empty).toHaveCount(0);
  await toggle.click();
  await expect(empty).toBeVisible();
});

test("Switch thumbs stay inside both sizes and move with LTR or RTL state", async ({ page }) => {
  await page.goto(`${origin}?surface=switch`);
  const switches = page.getByRole("switch");
  const geometry = () =>
    switches.evaluateAll((nodes) =>
      nodes.map((node) => {
        const track = node.getBoundingClientRect();
        const thumb = node.querySelector('[data-slot="switch-thumb"]')!.getBoundingClientRect();
        return {
          name: node.getAttribute("aria-label")!,
          x: thumb.x,
          inside: thumb.x >= track.x && thumb.right <= track.right,
        };
      }),
    );
  await expect.poll(async () => (await geometry()).every((item) => item.inside)).toBe(true);
  const checked = await geometry();
  await page.getByRole("switch", { name: "rtl default", exact: true }).click();
  for (const control of await switches.all())
    await expect(control).toHaveAttribute("aria-checked", "false");
  await expect
    .poll(async () => {
      const unchecked = await geometry();
      return unchecked.every(
        (item, index) =>
          item.inside &&
          (item.name.startsWith("rtl") ? item.x > checked[index].x : item.x < checked[index].x),
      );
    })
    .toBe(true);
});

test("Long Alert Dialogs scroll within short viewports and restore trigger focus", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 390 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${origin}?surface=alert-long`);
    const trigger = page.getByRole("button", { name: "Open long confirmation", exact: true });
    await trigger.click();
    const dialog = page.getByRole("alertdialog", {
      name: "Archive all project records?",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        return box !== null && box.y >= 15 && box.y + box.height <= viewport.height - 15;
      })
      .toBe(true);
    await expect
      .poll(() => dialog.evaluate((node) => node.scrollHeight > node.clientHeight))
      .toBe(true);
    await dialog.evaluate((node) => {
      node.scrollTop = 0;
    });
    await expect(
      dialog.getByRole("heading", { name: "Archive all project records?" }),
    ).toBeInViewport({ ratio: 1 });
    const cancel = dialog.getByRole("button", { name: "Keep active", exact: true });
    await cancel.scrollIntoViewIfNeeded();
    await expect(cancel).toBeInViewport({ ratio: 1 });
    await cancel.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test("Chart content htmlProps preserve DOM refs and click handlers", async ({ page }) => {
  await page.goto(`${origin}?surface=chart-html-props`);
  await expect(page.getByTestId("chart-refs")).toHaveText("composition-tooltip,composition-legend");
  await page.locator("#composition-tooltip").click();
  await expect(page.getByTestId("tooltip-calls")).toHaveText("1");
  await expect(page.getByTestId("legend-calls")).toHaveText("0");
  await page.locator("#composition-legend").click();
  await expect(page.getByTestId("legend-calls")).toHaveText("1");
});
