import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import colors from "../src/data/colors";
import { createThemeCssVars } from "../src/data/theme";

const focusControls = [
  { route: "input", control: 'input[data-slot="input"]:not(:disabled)', mode: "border" },
  { route: "textarea", control: "textarea:not(:disabled)", mode: "border" },
  { route: "checkbox", control: '[data-slot="checkbox"]', mode: "ring" },
  { route: "radio-group", control: '[data-slot="radio-group-item"]', mode: "ring" },
  { route: "switch", control: '[data-slot="switch"]', mode: "ring" },
  { route: "select", control: '[data-slot="select-trigger"]', mode: "border" },
  { route: "tabs", control: '[data-slot="tabs-trigger"]', mode: "ring" },
  { route: "calendar", control: 'button[data-day][tabindex="0"]', mode: "ring" },
  { route: "resizable", control: '[data-slot="resizable-handle"]', mode: "ring" },
  {
    route: "input-group",
    control: 'input[data-slot="input-group-control"]',
    indicator: '[data-slot="input-group"]',
    mode: "border",
  },
  {
    route: "slider",
    control: 'input[type="range"]',
    indicator: '[data-slot="slider-thumb"]',
    mode: "ring",
  },
] as const;

for (const item of focusControls) {
  test(`${item.route}: keyboard focus stays compact and follows the consuming theme`, async ({
    page,
  }) => {
    await page.goto(`/docs/${item.route}`);
    const preview = page.locator(`.component-preview[data-component="${item.route}"]`).first();
    await preview.scrollIntoViewIfNeeded();
    const control = preview.locator(item.control).first();
    await expect(control).toBeVisible();
    await preview.locator(".component-preview__canvas").evaluate((node) => {
      (node as HTMLElement).style.setProperty("--ring", "rgb(31, 83, 127)");
      (node as HTMLElement).style.setProperty("--background", "rgb(239, 243, 247)");
    });
    await page.keyboard.press("Tab");
    await control.focus();
    await expect(control).toBeFocused();
    const indicator = "indicator" in item ? preview.locator(item.indicator).first() : control;

    if (item.mode === "border") {
      await expect(indicator).toHaveCSS("border-color", "rgb(31, 83, 127)");
      await expect
        .poll(() => indicator.evaluate((node) => getComputedStyle(node).boxShadow))
        .not.toContain("rgb(31, 83, 127)");
    } else {
      await expect
        .poll(() => indicator.evaluate((node) => getComputedStyle(node).boxShadow))
        .toContain("rgb(31, 83, 127)");
    }

    await expect
      .poll(() => indicator.evaluate((node) => getComputedStyle(node).boxShadow))
      .not.toContain("rgb(239, 243, 247)");
  });
}

test("every public button variant remains readable in every palette", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/button");
  const preview = page.locator('.component-preview[data-component="button"]').first();
  const canvas = preview.locator(".component-preview__canvas");
  await expect(preview.getByRole("button", { name: "neutral", exact: true })).toBeVisible();
  await expect(preview.getByRole("button", { name: "Unavailable", exact: true })).toBeDisabled();
  const busy = preview.getByRole("button", { name: "Saving…", exact: true });
  await expect(busy).toBeDisabled();
  await expect(busy).toHaveAttribute("aria-busy", "true");
  for (const color of colors) {
    const theme = createThemeCssVars(color);
    for (const mode of ["light", "dark"] as const) {
      await page
        .locator("html")
        .evaluate((node, dark) => node.classList.toggle("dark", dark), mode === "dark");
      await canvas.evaluate(
        (node, values) => {
          for (const [key, value] of Object.entries(values))
            (node as HTMLElement).style.setProperty(`--${key}`, value);
        },
        { ...theme.light, ...theme[mode] },
      );
      const result = await new AxeBuilder({ page })
        .include('[data-component="button"] .component-preview__canvas')
        .withRules(["color-contrast"])
        .analyze();
      expect(result.violations, `${color.name}/${mode}`).toEqual([]);
      expect(result.incomplete, `${color.name}/${mode}: unresolved contrast`).toEqual([]);
      if (test.info().project.name === "desktop-light") {
        await test.info().attach(`palette-${color.name}-${mode}`, {
          body: await canvas.screenshot({ animations: "disabled" }),
          contentType: "image/png",
        });
      }
    }
  }
});

test("calendar keyboard focus advances to a different day", async ({ page }) => {
  await page.goto("/docs/calendar");
  const calendar = page.locator('.component-preview [data-slot="calendar"]').first();
  const first = calendar.locator('button[data-day][tabindex="0"]').first();
  await first.focus();
  const before = await first.getAttribute("data-day");
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("data-day")))
    .not.toBe(before);
  await expect(calendar.locator("button[data-day]:focus")).toHaveCount(1);
});

test("native panel resizing responds to keyboard without a translation adapter", async ({
  page,
}) => {
  await page.goto("/docs/resizable");
  const handle = page.getByRole("separator", { name: "Resize file explorer", exact: true });
  await expect(handle).toBeVisible();
  const before = Number(await handle.getAttribute("aria-valuenow"));
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => Number(await handle.getAttribute("aria-valuenow")))
    .toBeGreaterThan(before);
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(async () => Number(await handle.getAttribute("aria-valuenow")))
    .toBeCloseTo(before, 0);
});

test("native slider stepping, boundaries, and pointer input agree with its value", async ({
  page,
}) => {
  await page.goto("/docs/slider");
  const preview = page.locator('.component-preview[data-component="slider"]').first();
  const thumb = preview.getByRole("slider").first();
  await expect(thumb).toBeVisible();
  const before = Number(await thumb.inputValue());
  await thumb.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Number(await thumb.inputValue())).toBeGreaterThan(before);
  await page.keyboard.press("Home");
  await expect
    .poll(async () => Number(await thumb.inputValue()))
    .toBe(Number(await thumb.getAttribute("min")));
  await page.keyboard.press("End");
  await expect
    .poll(async () => Number(await thumb.inputValue()))
    .toBe(Number(await thumb.getAttribute("max")));
  const track = preview.locator('[data-slot="slider-track"]');
  const box = (await track.boundingBox())!;
  if (test.info().project.use.hasTouch)
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const min = Number(await thumb.getAttribute("min"));
  const max = Number(await thumb.getAttribute("max"));
  await expect.poll(async () => Number(await thumb.inputValue())).toBeGreaterThan(min);
  await expect.poll(async () => Number(await thumb.inputValue())).toBeLessThan(max);
});
