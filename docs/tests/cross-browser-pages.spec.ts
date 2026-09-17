import { readdirSync } from "node:fs";

import { expect, test } from "@playwright/test";
import { getSlugs } from "fumadocs-core/source";

const routes = [
  ...new Set([
    "/",
    ...readdirSync("content", { recursive: true })
      .filter((entry): entry is string => typeof entry === "string" && entry.endsWith(".mdx"))
      .map((entry) => `/${getSlugs(entry.replaceAll("\\", "/")).join("/")}`),
  ]),
].sort();
const routeGroups = Array.from({ length: Math.ceil(routes.length / 12) }, (_, index) =>
  routes.slice(index * 12, index * 12 + 12),
);

for (const [groupIndex, group] of routeGroups.entries()) {
  test(`all routes render in this browser: group ${groupIndex + 1}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });

    for (const route of group) {
      errors.length = 0;
      const response = await page.goto(route);
      expect(response?.ok(), `${route}: HTTP response`).toBe(true);
      await expect(page.locator("main").first()).toBeVisible();

      const hosts = page.locator("[data-react-host]");
      for (let index = 0; index < (await hosts.count()); index++) {
        await hosts.nth(index).scrollIntoViewIfNeeded();
        await expect(hosts.nth(index)).not.toHaveAttribute("aria-busy", "true");
      }

      await page.evaluate(() => document.fonts.ready);
      const viewport = page.viewportSize()!;
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenLocalImages: [...document.images]
          .filter(
            (image) =>
              image.complete &&
              image.naturalWidth === 0 &&
              new URL(image.src).origin === location.origin,
          )
          .map((image) => image.getAttribute("src")),
      }));

      expect(layout.scrollWidth, `${route}: horizontal overflow`).toBeLessThanOrEqual(
        viewport.width + 1,
      );
      expect(layout.clientWidth, `${route}: document width`).toBeLessThanOrEqual(
        viewport.width + 1,
      );
      expect(layout.brokenLocalImages, `${route}: broken local images`).toEqual([]);
      expect(errors, `${route}: runtime errors`).toEqual([]);
    }
  });
}
