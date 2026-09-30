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

test("collapsed offcanvas navigation leaves the tab order and can be reopened", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto("/docs/sidebar");
  const preview = page.locator('.component-preview[data-component="sidebar"]').last();
  await preview.scrollIntoViewIfNeeded();
  const trigger = preview.locator('[data-slot="sidebar-trigger"]');
  const navigation = preview.getByRole("navigation", { name: "Offcanvas navigation" });
  const firstLink = preview.getByRole("link", {
    name: "Documentation",
    exact: true,
    includeHidden: true,
  });
  const lastLink = preview.getByRole("link", {
    name: "Installation",
    exact: true,
    includeHidden: true,
  });
  const continueButton = preview.getByRole("button", { name: "Continue working" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toHaveCount(0);
  await firstLink.focus();
  await expect(firstLink).not.toBeFocused();
  await trigger.focus();
  await trigger.press("Tab");
  await expect(continueButton).toBeFocused();
  await continueButton.press("Shift+Tab");
  await trigger.press("Shift+Tab");
  await expect(preview.getByRole("tab", { name: "Preview", exact: true })).toBeFocused();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  // WebKit's default Tab navigation skips native anchors. Direct focus verifies
  // that reopening restores their focusability in every browser engine.
  await lastLink.focus();
  await expect(lastLink).toBeFocused();
  await firstLink.focus();
  await expect(firstLink).toBeFocused();
  await trigger.click();
  await expect(navigation).toHaveCount(0);
  await trigger.press("Tab");
  await expect(continueButton).toBeFocused();

  const rail = preview.locator('[data-slot="sidebar-rail"]');
  await expect(rail).toHaveCSS("visibility", "visible");
  const box = (await rail.boundingBox())!;
  await rail.click({ position: { x: box.width - 2, y: box.height / 2 } });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(firstLink).toBeInViewport({ ratio: 1 });
});
