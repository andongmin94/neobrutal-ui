import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openChart(page: Page, name: string, kind: string) {
  await page.goto(`/docs/${name}`);
  const chart = page.locator(`.component-preview [data-chart-recipe="${kind}"]`);
  await expect(chart.locator(".recharts-surface")).toBeVisible();
  return chart;
}

test("activity counts and normalized shares use the same filtered releases", async ({ page }) => {
  const chart = await openChart(page, "chart-release-activity", "activity");
  await expect(chart.locator("dl")).toContainText("2,350");
  await expect(chart.locator("dl")).toContainText("32.8%");
  await chart.getByLabel("Release period").selectOption("3");
  await expect(chart.locator("dl")).toContainText("1,520");
  await expect(chart.locator("dl")).toContainText("34.0%");
  await chart.getByLabel("Activity measure").selectOption("share");
  await expect(chart.locator("figure")).toContainText("100%");
  await expect(chart.locator("output")).toContainText("does not necessarily mean more events");
  await chart.getByText("View activity data", { exact: true }).click();
  await expect(chart.locator("tbody tr")).toHaveCount(3);
  await expect(chart.locator("tbody tr").first()).toContainText("R4");
  await expect(chart.locator("tbody tr").last()).toContainText("35.6%");
});

test("delivery variance keeps negative and positive values around zero", async ({ page }) => {
  const chart = await openChart(page, "chart-delivery-capacity", "capacity");
  await expect(chart.locator("dl")).toContainText("140");
  await chart.getByLabel("Delivery view").selectOption("variance");
  await chart.getByText("View delivery data", { exact: true }).click();
  await expect(chart.locator("tbody tr").first()).toContainText("-4");
  await expect(chart.locator("tbody tr").last()).toContainText("+4");
  await chart.getByLabel("Delivery team").selectOption("Platform");
  await expect(chart.locator("dl")).toContainText("108");
  await expect(chart.locator("output")).toContainText("3 of 4");
  await expect(chart.locator("tbody tr").nth(1)).toContainText("-5");
  await expect(chart.locator("figure")).toContainText("-8");
  await expect(chart.locator("figure")).toContainText("8");
});

test("build-series visibility does not silently change the comparison population", async ({ page }) => {
  const chart = await openChart(page, "chart-build-duration", "builds");
  await expect(chart.locator("dl")).toContainText("106.5 s");
  await expect(chart.locator(".recharts-line-curve")).toHaveCount(2);
  await chart.getByLabel("Visible build series").selectOption("warm");
  await expect(chart.locator(".recharts-line-curve")).toHaveCount(1);
  await expect(chart.locator("dl")).toContainText("106.5 s");
  await chart.getByLabel("Build period").selectOption("3");
  await expect(chart.locator("dl")).toContainText("206.0 s");
  await expect(chart.locator("dl")).toContainText("106.7 s");
  await expect(chart.locator("output")).toContainText("1 of 3");
  await chart.getByText("View build data", { exact: true }).click();
  await expect(chart.locator("tbody tr")).toHaveCount(3);
  await expect(chart.locator("tbody tr").last()).toContainText("95");
});

test("allocation inspection preserves all categories and updates its denominator", async ({ page }) => {
  const chart = await openChart(page, "chart-work-allocation", "allocation");
  await expect(chart.locator("dl")).toContainText("180 h");
  await chart.getByLabel("Inspect workstream").selectOption("Test");
  await expect(chart.locator("dl")).toContainText("20.0%");
  await chart.getByLabel("Allocation period").selectOption("Next");
  await expect(chart.locator("dl")).toContainText("210 h");
  await expect(chart.locator("dl")).toContainText("54 h");
  await expect(chart.locator("dl")).toContainText("25.7%");
  await chart.getByText("View allocation data", { exact: true }).click();
  await expect(chart.locator("tbody tr")).toHaveCount(4);
  await expect(chart.locator("tbody tr").nth(2)).toContainText("selected");
  await expect(chart.locator(".recharts-pie-sector")).toHaveCount(4);
});

test("installation trace changes duration units consistently without changing shares", async ({ page }) => {
  const chart = await openChart(page, "chart-install-diagnostics", "diagnostics");
  await expect(chart.locator("dl")).toContainText("1260 ms");
  await chart.getByLabel("Install environment").selectOption("CI");
  await expect(chart.locator("dl")).toContainText("2010 ms");
  await expect(chart.locator("dl")).toContainText("73.6%");
  await chart.getByLabel("Duration unit").selectOption("s");
  await expect(chart.locator("dl")).toContainText("2.01 s");
  await expect(chart.locator("dl")).toContainText("73.6%");
  await chart.getByText("View installation data", { exact: true }).click();
  await expect(chart.locator("tbody tr")).toHaveCount(4);
  await expect(chart.locator("tbody tr").nth(1)).toContainText("1.48 s");
  await expect(chart.locator("output")).toContainText("not the underlying measurements");
});

for (const name of [
  "chart-release-activity", "chart-delivery-capacity", "chart-build-duration",
  "chart-work-allocation", "chart-install-diagnostics",
]) {
  test(`analytical recipe remains readable and keyboard-operable: ${name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/docs/${name}`);
    const preview = page.locator(".component-preview").first();
    await expect(preview.locator(".recharts-surface")).toBeVisible();
    const select = preview.getByRole("combobox").first();
    await select.focus();
    await expect(select).toBeFocused();
    const summary = preview.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(preview.locator("details")).toHaveAttribute("open", "");
    const results = await new AxeBuilder({ page }).include(".component-preview")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    expect(errors).toEqual([]);
  });
}
