import { expect, test, type Locator, type Page } from "@playwright/test";
import colors from "../../src/data/colors";
import { createThemeCssVars } from "../../src/data/theme";

type Mode = "light" | "dark";
type Indicator = "border" | "outline" | "inset-outline" | "color" | "placeholder";

export async function applyPalette(page: Page, color: (typeof colors)[number], mode: Mode) {
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

// Measure rendered colors and actual adjacent surfaces, not just token names.
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
      "inset-outline": style.outlineColor,
      color: style.color,
      placeholder: getComputedStyle(node, "::placeholder").color,
    };
    const ink = rgba(inkColors[kind]);
    const surfaces =
      kind === "border" || kind === "outline"
        ? [background(node), background(node.parentElement)]
        : [background(node)];
    return Math.min(
      ...surfaces.map((surface) => {
        const a = luminance(composite(ink, surface));
        const b = luminance(surface);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      }),
    );
  }, indicator);
}

export async function expectContrast(locator: Locator, indicator: Indicator, label: string) {
  await expect(locator).toBeVisible();
  if (indicator === "outline" || indicator === "inset-outline") {
    await expect(locator).toHaveCSS("outline-style", "solid");
    await expect(locator).toHaveCSS("outline-width", "2px");
    if (indicator === "inset-outline") {
      await expect(locator).toHaveCSS("outline-offset", "-4px");
    }
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
    .toBeGreaterThanOrEqual(indicator === "placeholder" ? 4.5 : 3);
  test.info().annotations.push({
    type: "contrast",
    description: `${label}: ${ratio.toFixed(3)}:1`,
  });
}

export async function captureMono(surface: Locator, color: string, mode: Mode, state = "") {
  if (color !== "mono") return;
  await test.info().attach(`mono-${mode}${state ? `-${state}` : ""}`, {
    body: await surface.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
}
