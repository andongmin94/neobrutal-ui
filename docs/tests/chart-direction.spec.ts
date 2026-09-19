import { expect, test } from "@playwright/test";

test("allocation slices follow the clockwise reading order in the caption", async ({ page }) => {
  await page.goto("/docs/chart-work-allocation");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const chart = page.locator('.component-preview [data-chart-recipe="allocation"]');
  await expect(chart.locator("figcaption")).toContainText("Clockwise from the right");
  const sectors = chart.locator(".recharts-pie-sector path");
  await expect(sectors).toHaveCount(4);

  for (const period of ["Current", "Next"]) {
    await chart.getByLabel("Allocation period").selectOption(period);
    await expect(chart.getByLabel("Allocation period")).toHaveValue(period);
    await expect
      .poll(() =>
        sectors.first().evaluate((node) => {
          const path = node as SVGPathElement;
          const svg = path.ownerSVGElement!;
          const bounds = path.getBBox();
          // Design is less than half the total in both periods. Starting at
          // three o'clock clockwise keeps its entire sector below the center.
          return bounds.y >= svg.viewBox.baseVal.height / 2 - 1 && bounds.height > 20;
        }),
      )
      .toBe(true);
  }
});
