import { expect, test } from "@playwright/test";

for (const recipe of [
  "chart-signup-conversion",
  "chart-delivery-capacity",
  "chart-install-diagnostics",
]) {
  test(`${recipe}: hover highlights remain translucent`, async ({ page }) => {
    await page.goto(`/docs/${recipe}`);
    const chart = page.locator(".component-preview [data-chart-recipe]").first();
    await chart.scrollIntoViewIfNeeded();
    const bar = chart.locator(".recharts-bar-rectangle path").first();
    await expect(bar).toBeVisible();
    await bar.hover();
    const cursor = chart.locator(".recharts-rectangle.recharts-tooltip-cursor");
    await expect(cursor).toBeVisible();
    const alpha = await cursor.evaluate((node) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Cannot inspect the chart cursor color");
      context.fillStyle = getComputedStyle(node).fill;
      context.fillRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThanOrEqual(51);
    await expect(chart.locator(".recharts-tooltip-wrapper")).toBeVisible();
  });
}

test("allocation tooltip names the hovered workstream", async ({ page }) => {
  await page.goto("/docs/chart-work-allocation");
  const chart = page.locator('.component-preview [data-chart-recipe="allocation"]').first();
  await chart.scrollIntoViewIfNeeded();
  const sector = chart.locator("path.recharts-sector").first();
  await expect(sector).toBeVisible();
  await sector.hover();
  await expect(chart.locator(".recharts-tooltip-wrapper")).toContainText("Design: 48 h");
});

test("wide records remain keyboard-scrollable on a narrow page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/data-table");
  const scroller = page.locator('.component-preview [data-slot="table-container"]').first();
  await expect(scroller).toBeVisible();
  const extraWidth = await scroller.evaluate((node) => node.scrollWidth - node.clientWidth);
  expect(extraWidth).toBeGreaterThan(0);
  await scroller.focus();
  await expect(scroller).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => scroller.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(391);
});

test("delivery outlines preserve the series foreground and width", async ({ page }) => {
  await page.goto("/docs/chart-delivery-capacity");
  const chart = page.locator('.component-preview [data-chart-recipe="capacity"]').first();
  const planned = chart.locator(".recharts-bar-rectangle path").first();
  await expect(planned).toBeVisible();
  await expect(planned).toHaveAttribute("stroke-dasharray", "4 3");
  const foreground = await chart.evaluate((node) => getComputedStyle(node).color);
  await expect(planned).toHaveCSS("stroke", foreground);
  await expect(planned).toHaveCSS("stroke-width", "2px");
  await planned.evaluate((node) => node.setAttribute("stroke-width", "5"));
  await expect(planned).toHaveCSS("stroke-width", "5px");
});
