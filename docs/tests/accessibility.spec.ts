import { readdirSync } from "node:fs";
import { getSlugs } from "fumadocs-core/source";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [...new Set(["/", ...readdirSync("content", { recursive: true })
  .filter((name): name is string => typeof name === "string" && name.endsWith(".mdx"))
  .map((name) => `/${getSlugs(name.replaceAll("\\", "/")).join("/")}`)])].sort();

for (const route of routes) {
  test(`accessibility and visible layout: ${route}`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await expect(page.locator("main").first()).toBeVisible();
    const hosts = page.locator("[data-react-host]");
    for (let index = 0; index < await hosts.count(); index++) {
      await hosts.nth(index).scrollIntoViewIfNeeded();
      await expect(hosts.nth(index)).not.toHaveAttribute("aria-busy", "true");
    }
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const violations = results.violations.map(({ id, impact, help, nodes }) => ({
      id, impact, help, nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    }));
    await info.attach("accessibility", { body: JSON.stringify({ route, profile: info.project.name, violations }, null, 2), contentType: "application/json" });
    expect(violations).toEqual([]);
  });
}
