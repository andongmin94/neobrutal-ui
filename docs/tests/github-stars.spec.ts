import { expect, test } from "@playwright/test";

const API_URL = "https://api.github.com/repos/andongmin94/neobrutal-ui";
const CACHE_KEY = "neobrutal-ui-github-stars";
const ONE_HOUR_MS = 60 * 60 * 1000;

test.use({ storageState: { cookies: [], origins: [] } });

test("repository stars display the full accessible count and reuse persisted data after reload", async ({
  page,
}) => {
  let requests = 0;
  await page.route(API_URL, async (route) => {
    requests++;
    await route.fulfill({
      headers: { "Access-Control-Allow-Origin": "*" },
      json: { stargazers_count: 10_000 },
    });
  });

  await page.goto("/");
  const stars = page.locator("[data-github-stars]");
  const repository = page.locator(".github-repo-button");
  await expect(stars).toHaveText("10K");
  await expect(repository).toHaveAttribute("aria-label", "Open GitHub repository, 10,000 stars");
  await expect
    .poll(() =>
      page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null")?.count, CACHE_KEY),
    )
    .toBe(10_000);
  expect(requests).toBe(1);

  await page.reload();
  await expect(repository).toHaveAttribute("aria-label", "Open GitHub repository, 10,000 stars");
  await expect(stars).toHaveText("10K");
  expect(requests).toBe(1);
});

test("repository stars refresh a persisted count older than one hour", async ({ page }) => {
  await page.addInitScript(
    ({ key, age }) => {
      localStorage.setItem(key, JSON.stringify({ count: 9_999, fetchedAt: Date.now() - age }));
    },
    { key: CACHE_KEY, age: ONE_HOUR_MS + 1_000 },
  );
  let requests = 0;
  await page.route(API_URL, async (route) => {
    requests++;
    await route.fulfill({
      headers: { "Access-Control-Allow-Origin": "*" },
      json: { stargazers_count: 10_001 },
    });
  });

  await page.goto("/");
  await expect(page.locator(".github-repo-button")).toHaveAttribute(
    "aria-label",
    "Open GitHub repository, 10,001 stars",
  );
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CACHE_KEY);
  expect(stored.count).toBe(10_001);
  expect(Date.now() - stored.fetchedAt).toBeLessThan(ONE_HOUR_MS);
  expect(requests).toBe(1);
});

test("a failed repository request preserves the last successful count", async ({ page }) => {
  await page.addInitScript(
    ({ key, age }) => {
      localStorage.setItem(key, JSON.stringify({ count: 12_345, fetchedAt: Date.now() - age }));
    },
    { key: CACHE_KEY, age: ONE_HOUR_MS + 1_000 },
  );
  await page.route(API_URL, async (route) => {
    await route.fulfill({
      status: 403,
      headers: { "Access-Control-Allow-Origin": "*" },
      json: { message: "API rate limit exceeded" },
    });
  });

  await page.goto("/");
  await expect(page.locator("[data-github-stars]")).toHaveText("12.3K");
  await expect(page.locator(".github-repo-button")).toHaveAttribute(
    "aria-label",
    "Open GitHub repository, 12,345 stars",
  );
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CACHE_KEY);
  expect(stored.count).toBe(12_345);
  expect(Date.now() - stored.fetchedAt).toBeGreaterThanOrEqual(ONE_HOUR_MS);
});

test("an unavailable repository count remains unknown without cached data", async ({ page }) => {
  await page.route(API_URL, async (route) => {
    await route.abort("failed");
  });

  const requestFinished = page.waitForEvent("requestfailed", {
    predicate: (request) => request.url() === API_URL,
  });
  await page.goto("/");
  await requestFinished;
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator("[data-github-stars]")).toHaveText("—");
  await expect(page.locator(".github-repo-button")).toHaveAttribute(
    "aria-label",
    "Open GitHub repository",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), CACHE_KEY)).toBeNull();
});
