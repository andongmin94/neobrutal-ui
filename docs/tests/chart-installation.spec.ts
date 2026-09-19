import { expect, test } from "@playwright/test";

const recipes = [
  { name: "chart-revenue-target", kind: "revenue", control: "Revenue period", value: "8" },
  {
    name: "chart-signup-conversion",
    kind: "conversion",
    control: "Acquisition cohort",
    value: "Sales-led",
  },
  { name: "chart-service-latency", kind: "latency", control: "Service", value: "Search" },
];

test("analytical charts connect the gallery, documentation, and installable source", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const recipe of recipes) {
    await page.goto("/charts");
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
    await control.selectOption(recipe.value);
    await expect(control).toHaveValue(recipe.value);

    const response = await page.request.get(`/r/${recipe.name}.json`);
    expect(response.ok()).toBe(true);
    const item = await response.json();
    expect(item.name).toBe(recipe.name);
    expect(item.type).toBe("registry:component");
    expect(item.files).toHaveLength(1);
    expect(item.files[0].type).toBe("registry:ui");
    expect(item.files[0].content).toContain(`data-chart-recipe="${recipe.kind}"`);
    expect(item.files[0].content).toContain("export default function Component()");
    expect(item.files[0].content).not.toContain("@/examples/");
    const dependencies = item.registryDependencies as string[];
    for (const dependency of ["chart", "card"]) {
      expect(dependencies.some((url) => url.endsWith(`/r/${dependency}.json`))).toBe(true);
    }
  }

  expect(errors).toEqual([]);
});
