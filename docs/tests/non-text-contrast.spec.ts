import { expect, test, type Locator, type Page } from "@playwright/test";
import colors from "../src/data/colors";
import { createThemeCssVars } from "../src/data/theme";

type Mode = "light" | "dark";
type Indicator = "border" | "outline" | "color";

async function applyPalette(page: Page, color: (typeof colors)[number], mode: Mode) {
  const theme = createThemeCssVars(color);
  await page.locator("html").evaluate(
    (node, { dark, values }) => {
      node.classList.toggle("dark", dark);
      for (const [key, value] of Object.entries(values)) {
        node.style.setProperty(`--${key}`, value);
      }
    },
    { dark: mode === "dark", values: { ...theme.light, ...theme[mode] } },
  );
}

// Read the rendered indicator and its actual adjacent surfaces, including
// transparent ancestors. Token equality alone cannot prove visible contrast.
async function indicatorContrast(locator: Locator, indicator: Indicator) {
  return locator.evaluate((node, kind) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { colorSpace: "srgb" });
    if (!context) throw new Error("Cannot measure non-text contrast");

    function rgba(value: string) {
      if (!CSS.supports("color", value)) throw new Error(`Invalid color: ${value}`);
      context!.clearRect(0, 0, 1, 1);
      context!.fillStyle = value;
      context!.fillRect(0, 0, 1, 1);
      return Array.from(context!.getImageData(0, 0, 1, 1).data);
    }

    function composite(foreground: number[], background: number[]) {
      const alpha = foreground[3] / 255;
      return [
        ...foreground
          .slice(0, 3)
          .map((value, index) => value * alpha + background[index] * (1 - alpha)),
        255,
      ];
    }

    function background(element: Element | null): number[] {
      if (!element) return [255, 255, 255, 255];
      const style = getComputedStyle(element);
      if (style.backgroundImage !== "none" || style.opacity !== "1") {
        throw new Error("This contrast check requires opaque, flat test surfaces");
      }
      const color = rgba(style.backgroundColor);
      return color[3] === 255 ? color : composite(color, background(element.parentElement));
    }

    function luminance(color: number[]) {
      const linear = color.slice(0, 3).map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }

    const style = getComputedStyle(node);
    const inkColors = {
      border: style.borderTopColor,
      outline: style.outlineColor,
      color: style.color,
    };
    const ink = rgba(inkColors[kind]);
    const surfaces =
      kind === "color" ? [background(node)] : [background(node), background(node.parentElement)];
    return Math.min(
      ...surfaces.map((surface) => {
        const a = luminance(composite(ink, surface));
        const b = luminance(surface);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      }),
    );
  }, indicator);
}

async function expectContrast(locator: Locator, indicator: Indicator, label: string) {
  await expect(locator).toBeVisible();
  if (indicator === "outline") {
    await expect(locator).toHaveCSS("outline-style", "solid");
    await expect(locator).toHaveCSS("outline-width", "2px");
  } else if (indicator === "border") {
    await expect(locator).toHaveCSS("border-top-style", "solid");
    await expect(locator).toHaveCSS("border-top-width", "2px");
  }
  let ratio = 0;
  await expect
    .poll(
      async () => {
        ratio = await indicatorContrast(locator, indicator);
        return ratio;
      },
      { message: label },
    )
    .toBeGreaterThanOrEqual(3);
  test.info().annotations.push({
    type: "contrast",
    description: `${label}: ${ratio.toFixed(3)}:1`,
  });
}

async function captureMono(surface: Locator, color: string, mode: Mode) {
  if (color !== "mono") return;
  await test.info().attach(`mono-${mode}`, {
    body: await surface.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
}

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

  test(`select keyboard position contrasts in every ${mode} palette`, async ({ page }) => {
    await page.goto("/docs/chart-release-activity");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const chart = page.locator('.component-preview [data-chart-recipe="activity"]');
    const trigger = chart.getByRole("combobox", { name: "Activity measure", exact: true });
    await trigger.click();
    const popup = page.locator('[data-slot="select-content"]');
    const items = popup.getByRole("option");
    await expect(popup).toBeVisible();
    await page.mouse.move(0, 0);
    for (const color of colors) {
      await applyPalette(page, color, mode);
      await page.keyboard.press("Home");
      await expect(items.first()).toHaveAttribute("data-highlighted", "");
      await expectContrast(items.first(), "border", `${color.name}/${mode}: first option`);
      await page.keyboard.press("End");
      await expect(items.last()).toHaveAttribute("data-highlighted", "");
      await expect(items.first()).not.toHaveAttribute("data-highlighted", "");
      await expectContrast(items.last(), "border", `${color.name}/${mode}: last option`);
      await captureMono(popup, color.name, mode);
    }
    await page.keyboard.press("Enter");
    await expect(trigger).toContainText("Share of each release");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  });

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
    const popup = page.locator('[data-slot="popover-content"]');
    const input = popup.locator("input");
    const item = popup.locator('[data-slot="command-item"]').first();
    const mark = item.locator("div[data-selected]");
    await expect(input).toBeFocused();
    await page.mouse.move(0, 0);
    for (const color of colors) {
      await applyPalette(page, color, mode);
      await input.press("Home");
      await expect(item).toHaveAttribute("data-selected", "true");
      await expectContrast(item, "outline", `${color.name}/${mode}: current framework`);
      await expect(mark).toHaveAttribute("data-selected", "false");
      await expectContrast(mark, "border", `${color.name}/${mode}: empty selection mark`);
      await input.press("Enter");
      await expect(mark).toHaveAttribute("data-selected", "true");
      await expect(mark.locator("svg")).toHaveCSS("opacity", "1");
      await expectContrast(mark.locator("svg"), "color", `${color.name}/${mode}: selected mark`);
      await captureMono(popup, color.name, mode);
      await input.press("Enter");
      await expect(mark).toHaveAttribute("data-selected", "false");
      await expect(mark.locator("svg")).toHaveCSS("opacity", "0");
    }
    await input.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
