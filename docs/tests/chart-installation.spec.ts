import { expect, test } from "@playwright/test";

const recipes = [
  {
    name: "chart-revenue-target",
    kind: "revenue",
    group: "examples",
    control: "Revenue period",
    option: "All 8 weeks",
  },
  {
    name: "chart-signup-conversion",
    kind: "conversion",
    group: "examples",
    control: "Acquisition cohort",
    option: "Sales-led",
  },
  {
    name: "chart-service-latency",
    kind: "latency",
    group: "examples",
    control: "Service",
    option: "Search",
  },
  {
    name: "chart-release-activity",
    kind: "activity",
    group: "area-chart",
    control: "Activity measure",
    option: "Share of each release",
  },
  {
    name: "chart-delivery-capacity",
    kind: "capacity",
    group: "bar-chart",
    control: "Delivery view",
    option: "Signed variance",
  },
  {
    name: "chart-build-duration",
    kind: "builds",
    group: "line-chart",
    control: "Visible build series",
    option: "Cached only",
  },
  {
    name: "chart-work-allocation",
    kind: "allocation",
    group: "pie-chart",
    control: "Inspect workstream",
    option: "Test",
  },
  {
    name: "chart-install-diagnostics",
    kind: "diagnostics",
    group: "tooltip",
    control: "Duration unit",
    option: "Seconds",
  },
];

for (const recipe of recipes) {
  test(`gallery, documentation, and installable source agree: ${recipe.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/charts#${recipe.group}`);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await expect(page.locator(".special-page-loading")).toHaveCount(0);
    const card = page.locator(`[data-chart-recipe="${recipe.kind}"]`).locator("..");
    const install = card.getByRole("link", { name: "Install recipe", exact: true });
    await expect(install).toHaveAttribute("href", `/docs/${recipe.name}`);
    await install.click();
    await expect(page).toHaveURL(new RegExp(`/docs/${recipe.name}$`));
    const preview = page.locator(`.component-preview [data-chart-recipe="${recipe.kind}"]`);
    await expect(preview).toBeVisible();
    const control = preview.getByRole("combobox", { name: recipe.control, exact: true });
    await control.click();
    await page.getByRole("option", { name: recipe.option, exact: true }).click();
    await expect(control).toContainText(recipe.option);
    await expect(preview.locator(".recharts-surface")).toBeVisible();

    const response = await page.request.get(`/r/${recipe.name}.json`);
    expect(response.ok()).toBe(true);
    const item = await response.json();
    expect(item.name).toBe(recipe.name);
    expect(item.type).toBe("registry:component");
    expect(item.files).toHaveLength(1);
    expect(item.files[0].type).toBe("registry:ui");
    expect(item.files[0].content).toContain(`data-chart-recipe="${recipe.kind}"`);
    expect(item.files[0].content).toMatch(/export default function \w+\(/);
    expect(item.files[0].content).not.toContain("@/examples/");
    const dependencies = item.registryDependencies as string[];
    for (const dependency of ["chart", "card"]) {
      expect(dependencies.some((url) => url.endsWith(`/r/${dependency}.json`))).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}
