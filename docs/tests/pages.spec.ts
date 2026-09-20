import { readdirSync } from "node:fs";
import { getSlugs } from "fumadocs-core/source";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  ...readdirSync("content", { recursive: true })
    .filter((entry): entry is string => typeof entry === "string" && entry.endsWith(".mdx"))
    .map((entry) => `/${getSlugs(entry.replaceAll("\\", "/")).join("/")}`),
];

for (const route of [...new Set(routes)].sort()) {
  test(`complete page review: ${route}`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });

    const response = await page.goto(route);
    expect(response?.ok(), `${route}: HTTP response`).toBe(true);
    await expect(page.locator("main").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    const previews = page.locator(".component-preview");
    const previewCount = await previews.count();
    for (let index = 0; index < previewCount; index++) {
      const preview = previews.nth(index);
      const host = preview.locator("[data-react-host]");
      await host.scrollIntoViewIfNeeded();
      await expect(host, `${route}: preview ${index + 1}`).not.toHaveAttribute("aria-busy", "true");
      // Inputs, skeletons and SVG examples can be correctly rendered without any text.
      await expect(host.locator(".react-host__mount > *").first()).toBeAttached();
      await expect(host.locator(".react-host__error")).toHaveCount(0);
      await info.attach(`preview-${index + 1}`, {
        body: await preview.locator(".component-preview__canvas").screenshot(),
        contentType: "image/png",
      });
      await preview.getByRole("tab", { name: "Code", exact: true }).click();
      await expect(preview.locator(".component-preview__canvas")).toBeHidden();
      await expect(preview.locator(".component-preview__code pre").first()).toBeVisible();
      await expect(preview.locator(".component-preview__code pre").first()).not.toBeEmpty();
      await preview.getByRole("tab", { name: "Preview", exact: true }).click();
      await expect(preview.locator(".component-preview__code")).toBeHidden();
    }

    const installations = page.locator(".installation-tabs");
    for (let index = 0; index < (await installations.count()); index++) {
      const installation = installations.nth(index);
      await installation.getByRole("tab", { name: "Manual", exact: true }).click();
      await expect(installation.locator(".installation-tabs__manual pre").first()).toBeVisible();
      await expect(installation.locator(".installation-tabs__manual pre").first()).not.toBeEmpty();
      await installation.getByRole("tab", { name: "shadcn CLI", exact: true }).click();
    }

    await expect(page.locator(".react-host__error")).toHaveCount(0);
    // Keep viewport-sensitive accessibility checks independent of prior interaction scrolling.
    await page.evaluate(() => scrollTo(0, 0));
    const viewport = page.viewportSize()!;
    const layout = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      document: document.documentElement.clientWidth,
      layout: innerWidth,
      brokenLocalImages: [...document.images]
        .filter(
          (image) =>
            image.complete &&
            image.naturalWidth === 0 &&
            new URL(image.src).origin === location.origin,
        )
        .map((image) => image.getAttribute("src")),
    }));
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const violations = axeResults.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    }));

    await info.attach("review", {
      body: JSON.stringify(
        {
          route,
          profile: info.project.name,
          previews: previewCount,
          layout,
          errors,
          violations,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });

    expect(layout.scroll, `${route}: horizontal overflow`).toBeLessThanOrEqual(viewport.width + 1);
    expect(layout.document, `${route}: document width`).toBeLessThanOrEqual(viewport.width + 1);
    expect(layout.layout, `${route}: layout viewport`).toBeLessThanOrEqual(viewport.width + 1);
    expect(layout.brokenLocalImages, `${route}: broken local images`).toEqual([]);
    expect(errors, `${route}: runtime errors`).toEqual([]);
    expect(violations, `${route}: accessibility violations`).toEqual([]);
  });
}
