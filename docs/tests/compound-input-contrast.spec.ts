import { expect, test } from "@playwright/test";
import colors from "../src/data/colors";
import { applyPalette, captureMono, expectContrast } from "./helpers/contrast";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const mode of ["light", "dark"] as const) {
  for (const color of colors) {
    test(`input-group: ${color.name}/${mode} empty, filled and focused boundary`, async ({
      page,
    }) => {
      await page.goto("/docs/input-group");
      await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
      const preview = page.locator('.component-preview[data-component="input-group"]').first();
      const group = preview.locator('[data-slot="input-group"]');
      const field = group.locator('[data-slot="input-group-control"]');
      await expect(field).toBeEnabled();
      await applyPalette(page, color, mode);

      for (const value of ["", "Search components"]) {
        await field.fill(value);
        await field.press("Tab");
        await expect(field).not.toBeFocused();
        await expect(field).toHaveValue(value);
        // The child deliberately has no border; the group owns the visible boundary.
        await expect(field).toHaveCSS("border-top-width", "0px");
        await expectContrast(
          group,
          "border",
          `${color.name}/${mode}: input-group ${value ? "filled" : "empty"}`,
        );
        await captureMono(preview, color.name, mode, value ? "filled" : "empty");
      }

      await field.focus();
      await field.press("ArrowLeft");
      await expect(field).toBeFocused();
      await expectContrast(group, "border", `${color.name}/${mode}: input-group focused`);
      await captureMono(preview, color.name, mode, "focused");
    });

    test(`input-otp: ${color.name}/${mode} empty, active and filled slot boundaries`, async ({
      page,
    }) => {
      await page.goto("/docs/input-otp");
      await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
      const preview = page.locator('.component-preview[data-component="input-otp"]').first();
      const field = preview.locator("input");
      const slots = preview.locator('[data-slot="input-otp-slot"]');
      const active = preview.locator('[data-slot="input-otp-slot"][data-active="true"]');
      await expect(field).toBeEnabled();
      await expect(slots).toHaveCount(6);
      await applyPalette(page, color, mode);

      await field.fill("");
      await field.press("Tab");
      await expect(field).not.toBeFocused();
      await expect(active).toHaveCount(0);
      await expect(slots).toHaveText(["", "", "", "", "", ""]);
      for (let index = 0; index < 6; index++) {
        await expectContrast(
          slots.nth(index),
          "border",
          `${color.name}/${mode}: input-otp empty slot ${index}`,
        );
      }
      await captureMono(preview, color.name, mode, "empty");

      await field.fill("123");
      await expect(field).toBeFocused();
      await expect(field).toHaveValue("123");
      await expect(slots).toHaveText(["1", "2", "3", "", "", ""]);
      await expect(active).toHaveCount(1);
      await expect(slots.nth(3)).toHaveAttribute("data-active", "true");
      await expect(active).not.toHaveCSS("box-shadow", "none");
      for (let index = 0; index < 6; index++) {
        await expectContrast(
          slots.nth(index),
          "border",
          `${color.name}/${mode}: input-otp active state slot ${index}`,
        );
      }
      await captureMono(preview, color.name, mode, "active");

      await field.fill("123456");
      await field.press("Tab");
      await expect(field).not.toBeFocused();
      await expect(field).toHaveValue("123456");
      await expect(active).toHaveCount(0);
      await expect(slots).toHaveText(["1", "2", "3", "4", "5", "6"]);
      for (let index = 0; index < 6; index++) {
        await expectContrast(
          slots.nth(index),
          "border",
          `${color.name}/${mode}: input-otp filled slot ${index}`,
        );
      }
      await captureMono(preview, color.name, mode, "filled");
    });
  }
}
