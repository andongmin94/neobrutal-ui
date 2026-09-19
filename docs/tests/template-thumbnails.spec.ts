import { expect, test } from "@playwright/test";

test("template thumbnails use current, inert layouts and remain inside their cards", async ({
  page,
}) => {
  await page.goto("/templates");
  const thumbnails = page.locator("[data-thumbnail-ready]");
  await expect(thumbnails).toHaveCount(4);
  for (const thumbnail of await thumbnails.all()) {
    await expect(thumbnail).toHaveAttribute("data-thumbnail-ready", "true");
    await expect(thumbnail).toHaveAttribute("inert", "");
    await expect(thumbnail.locator("[data-template-preview]")).toHaveCount(1);
    const frame = await thumbnail.boundingBox();
    const content = await thumbnail.locator(":scope > div").boundingBox();
    expect(frame!.width).toBeGreaterThan(0);
    expect(Math.abs(frame!.width - content!.width)).toBeLessThanOrEqual(1);
  }
  await expect(page.getByRole("textbox", { name: "Title", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open CMS template", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width + 1,
  );
});
