import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import colors from "../src/data/colors";
import { createThemeCssVars } from "../src/data/theme";

async function openReady(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok(), route).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator(".special-page-loading")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

test("button focus follows ring and offset tokens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openReady(page, "/docs/button");
  const preview = page.locator('.component-preview[data-component="button"]').first();
  const canvas = preview.locator(".component-preview__canvas");
  const button = preview.getByRole("button", { name: "neutral", exact: true });
  await expect(button).toBeVisible();
  await expect(preview.getByRole("button", { name: "secondary", exact: true })).toHaveCount(0);
  await canvas.evaluate((node) => {
    (node as HTMLElement).style.setProperty("--ring", "rgb(31, 83, 127)");
    (node as HTMLElement).style.setProperty("--background", "rgb(239, 243, 247)");
  });
  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).toBeFocused();
  await expect.poll(() => button.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
  await expect
    .poll(() => button.evaluate((node) => getComputedStyle(node).boxShadow))
    .toContain("rgb(31, 83, 127)");
  await expect
    .poll(() => button.evaluate((node) => getComputedStyle(node).boxShadow))
    .toContain("rgb(239, 243, 247)");
});

test("form errors preserve associations, focus, tokens, and recovery", async ({ page }, info) => {
  await openReady(page, "/docs/form");
  const preview = page.locator('.component-preview[data-component="form"]').first();
  const input = preview.getByRole("textbox", { name: "Username", exact: true });
  await expect(input).toBeVisible();
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  const error = preview.locator('[data-slot="form-message"]');
  await expect(error).toHaveText("Username must be at least 2 characters.");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  const described = await input.evaluate((node) =>
    (node.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => ({ id, found: document.getElementById(id) !== null })),
  );
  expect(described.length).toBeGreaterThan(0);
  expect(described.every(({ found }) => found)).toBe(true);
  expect(described.map(({ id }) => id)).toContain(await error.getAttribute("id"));
  await info.attach("form-error-default-theme", {
    body: await preview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });
  await preview.locator(".component-preview__canvas").evaluate((node) => {
    (node as HTMLElement).style.setProperty("--error", "rgb(137, 24, 48)");
  });
  await expect(error).toHaveCSS("color", "rgb(137, 24, 48)");
  await input.fill("Local tester");
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(input).toHaveAttribute("aria-invalid", "false");
  await expect(error).toHaveCount(0);
  await expect(preview.getByRole("status")).toContainText("Nothing was saved to a server");
  await info.attach("form-error-recovered", {
    body: await preview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });
});

// This is an automated contrast regression, not a full accessibility certification.
test("form errors pass contrast checks in every light/dark palette", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openReady(page, "/docs/form");
  const preview = page.locator('.component-preview[data-component="form"]').first();
  const canvas = preview.locator(".component-preview__canvas");
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  const error = preview.locator('[data-slot="form-message"]');
  await expect(error).toBeVisible();

  for (const color of colors) {
    const theme = createThemeCssVars(color);
    for (const mode of ["light", "dark"] as const) {
      // Exercise both the variables and dark selectors, independently of saved preferences.
      await page.locator("html").evaluate((node, currentMode) => {
        node.classList.toggle("dark", currentMode === "dark");
      }, mode);
      await canvas.evaluate(
        (node, values) => {
          for (const [key, value] of Object.entries(values)) {
            (node as HTMLElement).style.setProperty(`--${key}`, value);
          }
        },
        { ...theme.light, ...theme[mode] },
      );
      await error.scrollIntoViewIfNeeded();
      const result = await new AxeBuilder({ page })
        .include('[data-component="form"] .component-preview__canvas')
        .withRules(["color-contrast"])
        .analyze();
      expect(result.violations, `${color.name}/${mode}: contrast failures`).toEqual([]);
      expect(result.incomplete, `${color.name}/${mode}: unresolved contrast checks`).toEqual([]);
    }
  }
});

for (const [route, name] of [
  ["/templates/blog", "blog"],
  ["/templates/blog/small-interfaces", "blog"],
  ["/templates/portfolio", "portfolio"],
  ["/templates/cms", "cms"],
  ["/templates/links", "links"],
] as const) {
  test(`template inherits preview-parent tokens: ${route}`, async ({ page }) => {
    await openReady(page, route);
    const wrapper = page.locator(`[data-template-preview="${name}"]`);
    await expect(wrapper).toBeVisible();
    const component = wrapper.locator(":scope > div").first();
    await expect(component).toBeVisible();
    await wrapper.evaluate((node) => {
      const style = (node as HTMLElement).style;
      style.setProperty("--main", "rgb(29, 79, 129)");
      style.setProperty("--background", "rgb(244, 245, 246)");
      style.setProperty("--radius", "13px");
      style.setProperty("--box-shadow-x", "-6px");
      style.setProperty("--base-font-weight", "550");
    });
    const values = await component.evaluate((node) => {
      const style = getComputedStyle(node);
      return Object.fromEntries(
        ["--main", "--background", "--radius", "--box-shadow-x", "--base-font-weight"].map(
          (key) => [key, style.getPropertyValue(key).trim()],
        ),
      );
    });
    expect(values).toEqual({
      "--main": "rgb(29, 79, 129)",
      "--background": "rgb(244, 245, 246)",
      "--radius": "13px",
      "--box-shadow-x": "-6px",
      "--base-font-weight": "550",
    });
    await expect(
      wrapper.getByText(/Installed templates inherit your project's theme/),
    ).toBeVisible();
  });
}

test("navigation does not expose the removed decorative collection", async ({ page }) => {
  await openReady(page, "/");
  await expect(page.locator('a[href="/stars"], a[href="/docs/stars"]')).toHaveCount(0);
});
