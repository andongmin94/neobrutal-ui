import { expect, test } from "@playwright/test";
import colors from "../src/data/colors";
import { applyPalette, captureMono, expectContrast } from "./helpers/contrast";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const mode of ["light", "dark"] as const) {
  for (const component of ["input", "textarea"]) {
    test(`${component} empty, filled and focused boundaries contrast in every ${mode} palette`, async ({
      page,
    }) => {
      await page.goto(`/docs/${component}`);
      await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
      const preview = page.locator(`.component-preview[data-component="${component}"]`).first();
      const field = preview.locator(`[data-slot="${component}"]`).first();
      await expect(field).toBeEnabled();
      for (const color of colors) {
        await applyPalette(page, color, mode);
        await field.fill("");
        await field.press("Tab");
        await expect(field).not.toBeFocused();
        await expectContrast(field, "border", `${color.name}/${mode}: empty ${component}`);
        await captureMono(preview, color.name, mode, "empty");
        await field.fill("name@example.com");
        await field.press("Tab");
        await expect(field).not.toBeFocused();
        await expectContrast(field, "border", `${color.name}/${mode}: filled ${component}`);
        await field.focus();
        await field.press("ArrowLeft");
        await expect(field).toBeFocused();
        await expectContrast(field, "border", `${color.name}/${mode}: focused ${component}`);
        await captureMono(preview, color.name, mode, "focused");
      }
    });
  }

  test(`closed menubar keyboard focus contrasts in every ${mode} palette`, async ({ page }) => {
    await page.goto("/docs/menubar");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const preview = page.locator('.component-preview[data-component="menubar"]').first();
    const triggers = preview.locator('[data-slot="menubar-trigger"]');
    await expect(triggers).toHaveCount(3);
    await page.mouse.move(0, 0);
    for (const color of colors) {
      await applyPalette(page, color, mode);
      await triggers.first().focus();
      await triggers.first().press("ArrowRight");
      await expect(triggers.nth(1)).toBeFocused();
      await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "false");
      await expectContrast(triggers.nth(1), "inset-outline", `${color.name}/${mode}: View focus`);
      await triggers.nth(1).press("ArrowLeft");
      await expect(triggers.first()).toBeFocused();
      await expectContrast(
        triggers.first(),
        "inset-outline",
        `${color.name}/${mode}: Project focus`,
      );
      await captureMono(preview, color.name, mode, "keyboard-focus");
    }
  });

  for (const component of ["dropdown-menu", "context-menu", "menubar"]) {
    test(`${component} current rows and open submenus contrast in every ${mode} palette`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.goto(`/docs/${component}`);
      await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
      const previews = page.locator(`.component-preview[data-component="${component}"]`);
      const previewCount = await previews.count();
      expect(previewCount).toBeGreaterThan(0);
      for (let index = 0; index < previewCount; index++) {
        const preview = previews.nth(index);
        const host = preview.locator("[data-react-host]");
        await host.scrollIntoViewIfNeeded();
        await expect(host).not.toHaveAttribute("aria-busy", "true");
        const triggers = preview.locator(`[data-slot="${component}-trigger"]`);
        await expect(triggers.first()).toBeVisible();
        const count = await triggers.count();
        for (let triggerIndex = 0; triggerIndex < count; triggerIndex++) {
          const trigger = triggers.nth(triggerIndex);
          if (component === "context-menu") await trigger.click({ button: "right" });
          else await trigger.press("ArrowDown");
          await page.mouse.move(0, 0);
          const popup = page.locator(`[data-slot="${component}-content"]:visible`).first();
          await expect(popup).toBeVisible();
          const items = popup.locator('[role^="menuitem"]:not([aria-disabled="true"])');
          const itemCount = await items.count();
          expect(itemCount).toBeGreaterThan(0);
          const sub = popup.locator(`[data-slot="${component}-sub-trigger"]`).first();
          for (const color of colors) {
            await applyPalette(page, color, mode);
            await popup.press("Home");
            for (let row = 0; row < itemCount; row++) {
              const item = items.nth(row);
              if (row) await page.keyboard.press("ArrowDown");
              await expect(item).toBeFocused();
              await expect(item).toHaveAttribute("data-highlighted", "");
              const role = await item.getAttribute("role");
              const variant = (await item.getAttribute("data-variant")) ?? "default";
              await expectContrast(
                item,
                "inset-outline",
                `${color.name}/${mode}: ${component}/${index}/${triggerIndex}/${row} ${role}/${variant}`,
              );
            }
            await captureMono(popup, color.name, mode, `${index}-${triggerIndex}-current`);
            if (await sub.count()) {
              await sub.press("ArrowRight");
              await expect(sub).toHaveAttribute("data-popup-open", "");
              const child = page.locator(`[data-slot="${component}-sub-content"]:visible`).first();
              await expect(child).toBeVisible();
              await expectContrast(
                sub,
                "inset-outline",
                `${color.name}/${mode}: open ${component} submenu`,
              );
              await child.press("Home");
              const first = child.getByRole("menuitem").first();
              await expect(first).toHaveAttribute("data-highlighted", "");
              await expectContrast(
                first,
                "inset-outline",
                `${color.name}/${mode}: ${component} child`,
              );
              await captureMono(child, color.name, mode, "submenu");
              await page.keyboard.press("Escape");
              await expect(child).toBeHidden();
              await expect(sub).toBeFocused();
            }
          }
          await page.keyboard.press("Escape");
          await expect(popup).toBeHidden();
          await expect(trigger).toBeFocused();
        }
      }
    });
  }
}
