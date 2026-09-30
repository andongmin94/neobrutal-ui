import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import tailwindcss from "@tailwindcss/vite";
import { createServer, type ViteDevServer } from "vite";

let server: ViteDevServer;
let origin: string;
const root = fileURLToPath(new URL("..", import.meta.url));
const cacheRoot = join(root, "test-results");
let cacheDirectory: string | undefined;

test.beforeAll(async () => {
  await mkdir(cacheRoot, { recursive: true });
  cacheDirectory = await mkdtemp(join(cacheRoot, "primitive-overflow-vite-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir: cacheDirectory,
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    server: { host: "127.0.0.1", port: 0 },
    appType: "custom",
    plugins: [tailwindcss()],
    optimizeDeps: { entries: ["tests/fixtures/primitive-overflow.tsx"] },
  });
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] !== "/") return next();
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Primitive locale and overflow</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/primitive-overflow.tsx"></script></body></html>',
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

test("Calendar uses the native locale pipeline and stable dates in its time zone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(`${origin}?surface=calendar-locale`);
  const wrapper = page.getByTestId("localized-calendar");
  const native = page.getByTestId("native-calendar");
  const nativeMonths = native.locator(".rdp-months_dropdown option");
  const wrapperMonths = wrapper.locator(".rdp-months_dropdown option");
  await expect(nativeMonths).toHaveCount(12);
  await expect(wrapperMonths).toHaveText(await nativeMonths.allTextContents());
  await expect(wrapperMonths.first()).toHaveText("ژانویه");
  const dates = await wrapper.locator("button[data-day]").evaluateAll((buttons) =>
    buttons.map((button) => ({
      button: button.getAttribute("data-day"),
      cell: button.closest("td")?.getAttribute("data-day"),
    })),
  );
  expect(dates.length).toBeGreaterThan(0);
  expect(
    dates.every(({ button, cell }) => button === cell && /^\d{4}-\d{2}-\d{2}$/.test(button!)),
  ).toBe(true);
  await expect(
    page.getByTestId("zoned-calendar").locator('button[data-selected-single="true"]'),
  ).toHaveAttribute("data-day", "2024-01-01");
});

test("Calendar hydrates across Korean and English hosts without locale-dependent markup", async ({
  browser,
}) => {
  const host = await browser.newContext({ locale: "ko-KR", timezoneId: "UTC" });
  const client = await browser.newContext({ locale: "en-US", timezoneId: "UTC" });
  try {
    const hostPage = await host.newPage();
    const clientPage = await client.newPage();
    const hydrationMessages: string[] = [];
    const pageErrors: string[] = [];
    clientPage.on("pageerror", (error) => pageErrors.push(error.message));
    clientPage.on("console", (message) => {
      if (
        ["warning", "error"].includes(message.type()) &&
        /hydration|hydrated|server rendered/i.test(message.text())
      ) {
        hydrationMessages.push(message.text());
      }
    });
    for (const caption of ["label", "dropdown"]) {
      await hostPage.goto(`${origin}?surface=calendar-ssr&caption=${caption}`);
      const markup = await hostPage.getByTestId("calendar-ssr-markup").textContent();
      expect(markup).toContain('data-day="2024-01-01"');
      const url = `${origin}?surface=calendar-hydrate&caption=${caption}`;
      await clientPage.route(url, async (route) => {
        const response = await route.fetch();
        const html = (await response.text()).replace(
          '<div id="root"></div>',
          `<div id="root">${markup}</div>`,
        );
        await route.fulfill({ response, body: html });
      });
      await clientPage.goto(url);
      await expect(clientPage.getByTestId("calendar-hydrated")).toHaveText("complete");
      await expect(clientPage.locator("html")).toHaveAttribute("data-hydration-errors", "[]");
      await expect(clientPage.locator('button[data-day="2024-01-01"]')).toHaveCount(1);
      await clientPage.unroute(url);
    }
    expect(pageErrors).toEqual([]);
    expect(hydrationMessages).toEqual([]);
  } finally {
    await client.close();
    await host.close();
  }
});

for (const width of [320, 844]) {
  test(`Sheet Side example keeps content and close controls reachable at ${width}×390`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 390 });
    await page.goto(`${origin}?surface=sheet`);
    for (const side of ["top", "right", "bottom", "left"]) {
      const trigger = page.getByRole("button", { name: `${side} sheet`, exact: true });
      await trigger.click();
      const popup = page.getByRole("dialog", { name: `${side} panel review` });
      await expect(popup).toBeVisible();
      await expect
        .poll(async () => {
          const box = await popup.boundingBox();
          return box !== null && box.y >= -1 && box.y + box.height <= 391;
        })
        .toBe(true);
      await expect(popup.getByRole("heading", { name: `${side} panel review` })).toBeInViewport({
        ratio: 1,
      });
      const close = popup.getByRole("button", { name: "Close panel", exact: true });
      await expect(close).toBeInViewport({ ratio: 1 });
      const body = popup.locator("div.overflow-y-auto");
      expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
        true,
      );
      const lastNote = body.locator("p").last();
      await lastNote.scrollIntoViewIfNeeded();
      await expect(lastNote).toBeInViewport({ ratio: 1 });
      await expect(close).toBeInViewport({ ratio: 1 });
      await close.click();
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });
}

for (const contextMenu of [false, true]) {
  test(`${contextMenu ? "ContextMenu" : "DropdownMenu"} reaches the first and last of 40 items by scrolling and keyboard`, async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize({ width: 320, height: 390 });
    await page.goto(`${origin}?surface=menu`);
    const name = contextMenu ? "Context option" : "Option";
    const trigger = contextMenu
      ? page.getByText("Open context options", { exact: true })
      : page.getByRole("button", { name: "Open options", exact: true });
    await trigger.click(contextMenu ? { button: "right" } : {});
    const popup = page.getByRole("menu");
    await expect(popup).toBeVisible();
    await expect
      .poll(async () => {
        const box = await popup.boundingBox();
        return box !== null && box.y >= -1 && box.y + box.height <= 391;
      })
      .toBe(true);
    expect(await popup.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
      true,
    );
    await expect(popup).toHaveCSS("overflow-y", "auto");
    const first = popup.getByRole("menuitem", { name: `${name} 1`, exact: true });
    const last = popup.getByRole("menuitem", { name: `${name} 40`, exact: true });
    if (isMobile) {
      // Mobile WebKit has no mouse-wheel input; exercise the native scroll container instead.
      await last.scrollIntoViewIfNeeded();
    } else {
      const box = (await popup.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect
        .poll(async () => {
          // Firefox limits one wheel gesture to part of the visible scroll area.
          await page.mouse.wheel(0, 2000);
          return popup.evaluate(
            (element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 1,
          );
        })
        .toBe(true);
    }
    await expect(last).toBeInViewport({ ratio: 1 });
    expect(await popup.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await first.focus();
    await first.press("End");
    await expect(last).toBeFocused();
    await expect(last).toBeInViewport({ ratio: 1 });
    await last.press("Home");
    await expect(first).toBeFocused();
    await expect(first).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await first.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
