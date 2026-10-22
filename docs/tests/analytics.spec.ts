import type { BeforeSendEvent } from "@vercel/analytics";
import { expect, test, type Page } from "@playwright/test";

const origin = "https://neobrutal-ui.andongmin.com";

async function virtualProduction(page: Page, baseURL: string, automated: boolean) {
  await page.addInitScript((automated) => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => automated });
    localStorage.setItem(
      "neobrutal-ui-github-stars",
      JSON.stringify({ count: 10_000, fetchedAt: Date.now() }),
    );
  }, automated);
  // Preserve the production URL in the browser while serving every request locally.
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/_vercel/insights/script.js") {
      await route.fulfill({
        contentType: "application/javascript",
        body: "window.analyticsScriptLoaded = true;",
      });
      return;
    }
    const response = await route.fetch({
      url: new URL(`${url.pathname}${url.search}`, baseURL).href,
    });
    await route.fulfill({ response });
  });
}

test("production analytics loads once and accepts only sanitized page views", async ({
  page,
  baseURL,
}) => {
  await virtualProduction(page, baseURL!, false);
  await page.goto(`${origin}/?email=private@example.test#secret`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { analyticsScriptLoaded?: boolean }).analyticsScriptLoaded,
      ),
    )
    .toBe(true);
  expect(
    await page.evaluate(() => {
      const filter = window.vaq?.find(([type]) => type === "beforeSend")?.[1] as (
        event: BeforeSendEvent,
      ) => BeforeSendEvent | null;
      return {
        view: filter({
          type: "pageview",
          url: `${location.origin}/docs/dialog?email=private@example.test#secret`,
        }),
        event: filter({ type: "event", url: location.href }),
        other: filter({ type: "pageview", url: "https://preview.example.test/docs/dialog" }),
      };
    }),
  ).toEqual({
    view: { type: "pageview", url: `${origin}/docs/dialog` },
    event: null,
    other: null,
  });
  await page.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/docs/installation`);
  await expect(page.locator('script[src="/_vercel/insights/script.js"]')).toHaveCount(1);
});

test("automated production visits do not load analytics", async ({ page, baseURL }) => {
  await virtualProduction(page, baseURL!, true);
  await page.goto(origin);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator('script[src*="insights"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.vaq)).toBeUndefined();
});

test("localhost production builds do not load analytics", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator('script[src*="insights"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.vaq)).toBeUndefined();
});
