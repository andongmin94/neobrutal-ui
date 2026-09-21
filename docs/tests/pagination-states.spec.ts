import { expect, test } from "@playwright/test";

test("pagination current and unavailable states stay distinct", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/pagination");
  const preview = page.locator('.component-preview[data-component="pagination"]').first();
  const canvas = preview.locator(".component-preview__canvas");
  const current = canvas.locator('a[aria-current="page"]');
  const previous = canvas.getByRole("link", { name: "Go to previous page", exact: true });
  const next = canvas.getByRole("link", { name: "Go to next page", exact: true });
  await expect(current).toHaveText("2");

  for (const value of [2, 1, 7]) {
    if (value !== 2) {
      await canvas.getByRole("link", { name: `Go to page ${value}`, exact: true }).click();
    }
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(String(value));
    await expect(current).toHaveCSS("text-decoration-line", "underline");
    await expect(current).toHaveCSS("text-decoration-thickness", "2px");
    await expect(previous).toHaveAttribute("aria-disabled", String(value === 1));
    await expect(next).toHaveAttribute("aria-disabled", String(value === 7));
    await expect(previous).toHaveCSS("opacity", value === 1 ? "0.5" : "1");
    await expect(next).toHaveCSS("opacity", value === 7 ? "0.5" : "1");
    await info.attach(`pagination-page-${value}`, {
      body: await canvas.screenshot({
        animations: "disabled",
        style: ".site-header, .site-header * { visibility: hidden !important; }",
      }),
      contentType: "image/png",
    });
  }

  await previous.click();
  await expect(current).toHaveText("6");
  await expect(next).toHaveAttribute("aria-disabled", "false");
  await expect(next).toHaveCSS("opacity", "1");
});
