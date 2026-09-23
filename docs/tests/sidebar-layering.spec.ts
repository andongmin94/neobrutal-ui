import { expect, test } from "@playwright/test";

test("mobile sidebar stays above its backdrop", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/sidebar");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const preview = page.locator('.component-preview[data-component="sidebar"]').first();
  const trigger = preview.locator('button[data-sidebar="trigger"]');
  await trigger.click();

  const sidebar = page.getByRole("dialog", { name: "Sidebar", exact: true });
  await expect(sidebar).toBeVisible();
  // A static popup can still receive clicks through a pointer-transparent
  // backdrop, but its z-index no longer lifts the content above that backdrop.
  await expect(sidebar).toHaveCSS("position", "fixed");
  const backdropLayer = await page
    .locator('[data-slot="sheet-overlay"]')
    .evaluate((node) => Number(getComputedStyle(node).zIndex));
  const sidebarLayer = await sidebar.evaluate((node) => Number(getComputedStyle(node).zIndex));
  expect(sidebarLayer).toBeGreaterThan(backdropLayer);
  await expect(sidebar.getByRole("button", { name: /Northstar Studio/ })).toBeVisible();
  await testInfo.attach("mobile-sidebar-above-backdrop", {
    body: await sidebar.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  await page.keyboard.press("Escape");
  await expect(sidebar).toBeHidden();
  await expect(trigger).toBeFocused();
});
