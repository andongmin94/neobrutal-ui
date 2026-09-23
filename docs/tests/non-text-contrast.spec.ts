import { expect, test } from "@playwright/test";
import colors from "../src/data/colors";
import { applyPalette, captureMono, expectContrast } from "./helpers/contrast";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const mode of ["light", "dark"] as const) {
  test(`checkbox boundaries and check marks contrast in every ${mode} palette`, async ({
    page,
  }) => {
    await page.goto("/docs/checkbox");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const preview = page.locator('.component-preview[data-component="checkbox"]').first();
    const checkbox = preview.locator('[data-slot="checkbox"]').first();
    await expect(checkbox).toBeEnabled();
    await expect(checkbox).toBeChecked();
    for (const color of colors) {
      await applyPalette(page, color, mode);
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
      await expectContrast(checkbox, "border", `${color.name}/${mode}: empty checkbox`);
      await captureMono(preview.locator("fieldset"), color.name, mode);
      await checkbox.press("Space");
      await expect(checkbox).toBeChecked();
      await expectContrast(checkbox.locator("svg"), "color", `${color.name}/${mode}: check mark`);
    }
  });

  test(`command keyboard position contrasts in every ${mode} palette`, async ({ page }) => {
    await page.goto("/docs/command");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const preview = page.locator('.component-preview[data-component="command"]').first();
    const trigger = preview.getByRole("button", { name: "Open command menu", exact: true });
    await trigger.click();
    const command = page.locator('[data-slot="command"]');
    const input = command.locator("input");
    const items = command.locator('[data-slot="command-item"]');
    await expect(input).toBeFocused();
    await page.mouse.move(0, 0);
    for (const color of colors) {
      await applyPalette(page, color, mode);
      await input.press("Home");
      await expect(items.first()).toHaveAttribute("data-selected", "true");
      await expectContrast(items.first(), "outline", `${color.name}/${mode}: first command`);
      await input.press("ArrowDown");
      await expect(items.nth(1)).toHaveAttribute("data-selected", "true");
      await expect(items.first()).toHaveAttribute("data-selected", "false");
      await expectContrast(items.nth(1), "outline", `${color.name}/${mode}: next command`);
      await captureMono(command, color.name, mode);
    }
    await input.press("Escape");
    await expect(command).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  for (const { name, route, label, result, indicator } of [
    {
      name: "select",
      route: "/docs/select",
      label: "Publication status",
      result: "Published",
      indicator: "border",
    },
    {
      name: "chart-select",
      route: "/docs/chart-release-activity",
      label: "Activity measure",
      result: "Share of each release",
      indicator: "inset-outline",
    },
  ] as const) {
    test(`${name} keyboard position contrasts in every ${mode} palette`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
      const preview = page.locator(".component-preview").first();
      const trigger = preview.getByRole("combobox", { name: label, exact: true });
      await trigger.click();
      const popup = page.locator('[data-slot="select-content"]');
      const items = popup.getByRole("option");
      await expect(popup).toBeVisible();
      await expect(items.first()).toHaveAttribute("aria-selected", "true");
      await page.mouse.move(0, 0);
      for (const color of colors) {
        await applyPalette(page, color, mode);
        await page.keyboard.press("Home");
        await expect(items.first()).toHaveAttribute("data-highlighted", "");
        await expectContrast(items.first(), indicator, `${color.name}/${mode}: selected option`);
        await captureMono(popup, color.name, mode, "selected-option");
        await page.keyboard.press("End");
        await expect(items.last()).toHaveAttribute("data-highlighted", "");
        await expect(items.first()).not.toHaveAttribute("data-highlighted", "");
        await expect(items.last()).toHaveAttribute("aria-selected", "false");
        await expectContrast(items.last(), indicator, `${color.name}/${mode}: unselected option`);
        await captureMono(popup, color.name, mode, "unselected-option");
      }
      await page.keyboard.press("Enter");
      await expect(trigger).toContainText(result);
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }

  test(`multi-select marks and keyboard position contrast in every ${mode} palette`, async ({
    page,
  }) => {
    await page.goto("/docs/combobox");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const preview = page.locator('.component-preview[data-component="combobox"]').filter({
      has: page.getByRole("tablist", { name: "combobox multiselect preview", exact: true }),
    });
    await preview.locator("[data-react-host]").scrollIntoViewIfNeeded();
    const trigger = preview.getByRole("combobox", { name: "Select frameworks", exact: true });
    await trigger.click();
    const popup = page.locator('[data-slot="combobox-popup"]');
    const input = popup.getByRole("combobox", { name: "Search frameworks", exact: true });
    const item = popup.getByRole("option", { name: "Next.js", exact: true });
    const mark = item.locator('[data-slot="combobox-selection-mark"]');
    await expect(input).toBeFocused();
    await expect(popup.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await page.mouse.move(0, 0);
    for (const color of colors) {
      await applyPalette(page, color, mode);
      await input.fill("");
      await expectContrast(input, "placeholder", `${color.name}/${mode}: search placeholder`);
      await input.fill("Next");
      await expect(item).toHaveAttribute("data-highlighted", "");
      await expect(item).toHaveAttribute("aria-selected", "false");
      await expectContrast(item, "inset-outline", `${color.name}/${mode}: current framework`);
      await expectContrast(mark, "border", `${color.name}/${mode}: empty selection mark`);
      await input.press("Enter");
      await input.fill("Next");
      await expect(item).toHaveAttribute("aria-selected", "true");
      await expect(mark.locator("svg")).toBeVisible();
      await expectContrast(mark.locator("svg"), "color", `${color.name}/${mode}: selected mark`);
      await captureMono(popup, color.name, mode);
      await input.press("Enter");
      await input.fill("Next");
      await expect(item).toHaveAttribute("aria-selected", "false");
      await expect(mark.locator("svg")).toBeHidden();
    }
    await input.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
