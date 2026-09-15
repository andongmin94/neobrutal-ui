import { readdirSync } from "node:fs";
import { getSlugs } from "fumadocs-core/source";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  ...readdirSync("content", { recursive: true })
    .filter((entry): entry is string => typeof entry === "string" && entry.endsWith(".mdx"))
    .map((entry) => `/${getSlugs(entry.replaceAll("\\", "/")).join("/")}`),
];

for (const route of [...new Set(routes)].sort()) {
  test(`complete page review: ${route}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
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
      await preview.getByRole("tab", { name: "Code", exact: true }).click();
      await expect(preview.locator(".component-preview__canvas")).toBeHidden();
      await expect(preview.locator(".component-preview__code pre").first()).toBeVisible();
      await expect(preview.locator(".component-preview__code pre").first()).not.toBeEmpty();
      if (index === 0) await preview.screenshot({ path: info.outputPath("source-panel.png"), animations: "disabled" });
      await preview.getByRole("tab", { name: "Preview", exact: true }).click();
      await expect(preview.locator(".component-preview__code")).toBeHidden();
    }
    const installations = page.locator(".installation-tabs");
    for (let index = 0; index < await installations.count(); index++) {
      const installation = installations.nth(index);
      await installation.getByRole("tab", { name: "Manual", exact: true }).click();
      await expect(installation.locator(".installation-tabs__manual pre").first()).toBeVisible();
      await expect(installation.locator(".installation-tabs__manual pre").first()).not.toBeEmpty();
      await installation.screenshot({ path: info.outputPath(`manual-${index}.png`), animations: "disabled" });
      await installation.getByRole("tab", { name: "shadcn CLI", exact: true }).click();
    }
    await expect(page.locator(".react-host__error")).toHaveCount(0);
    const viewport = page.viewportSize()!;
    const layout = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      document: document.documentElement.clientWidth,
      layout: innerWidth,
      brokenLocalImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0 && new URL(image.src).origin === location.origin)
        .map((image) => image.getAttribute("src")),
    }));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath("page.png"), fullPage: true, animations: "disabled" });
    await info.attach("coverage", {
      body: JSON.stringify({ route, profile: info.project.name, previews: previewCount, layout, errors }),
      contentType: "application/json",
    });
    expect(layout.scroll, `${route}: horizontal overflow`).toBeLessThanOrEqual(viewport.width + 1);
    expect(layout.document, `${route}: document width`).toBeLessThanOrEqual(viewport.width + 1);
    expect(layout.layout, `${route}: layout viewport`).toBeLessThanOrEqual(viewport.width + 1);
    expect(layout.brokenLocalImages, `${route}: broken local images`).toEqual([]);
    expect(errors, `${route}: runtime errors`).toEqual([]);
  });
}
