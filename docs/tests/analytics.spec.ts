import { expect, test, type Page } from "@playwright/test";

const origin = "https://neobrutal-ui.andongmin.com";
const beaconSource = "https://static.cloudflareinsights.com/beacon.min.js";

async function virtualProduction(page: Page, baseURL: string, automated: boolean) {
  await page.addInitScript((automated) => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => automated });
    localStorage.setItem(
      "neobrutal-ui-github-stars",
      JSON.stringify({ count: 10_000, fetchedAt: Date.now() }),
    );
  }, automated);
  await page.route(beaconSource, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "window.analyticsScriptLoaded = true;",
    }),
  );
  // Preserve the production URL in the browser while serving every request locally.
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: new URL(`${url.pathname}${url.search}`, baseURL).href,
    });
    await route.fulfill({ response });
  });
}

test("production analytics loads the site's module beacon once across navigation", async ({
  page,
  baseURL,
}) => {
  await virtualProduction(page, baseURL!, false);
  await page.goto(origin);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { analyticsScriptLoaded?: boolean }).analyticsScriptLoaded,
      ),
    )
    .toBe(true);
  const beacon = page.locator("script[data-cf-beacon]");
  await expect(beacon).toHaveAttribute("type", "module");
  await expect(beacon).toHaveAttribute("src", beaconSource);
  expect(JSON.parse((await beacon.getAttribute("data-cf-beacon"))!)).toEqual({
    token: "46a3e4b9ba064b08b6a501923ee191ee",
  });
  await page.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/docs/installation`);
  await expect(beacon).toHaveCount(1);
});

test("automated production visits do not load analytics", async ({ page, baseURL }) => {
  await virtualProduction(page, baseURL!, true);
  await page.goto(origin);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator("script[data-cf-beacon]")).toHaveCount(0);
});

test("localhost production builds do not load analytics", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator("script[data-cf-beacon]")).toHaveCount(0);
});
