import { expect, test, type Locator, type TestInfo } from "@playwright/test";

async function readyCanvas(preview: Locator) {
  const canvas = preview.locator(".component-preview__canvas");
  // Secondary examples are loaded only after entering the viewport.
  const host = canvas.locator("[data-react-host]");
  await host.scrollIntoViewIfNeeded();
  await expect(host).not.toHaveAttribute("aria-busy", "true");
  await expect(host.locator(".react-host__mount > *").first()).toBeAttached();
  await expect(host.locator(".react-host__error")).toHaveCount(0);
  return canvas;
}

async function capture(surface: Locator, name: string, info: TestInfo) {
  await expect(surface).toBeVisible();
  await info.attach(name, {
    body: await surface.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const component of ["alert-dialog", "dialog", "drawer", "sheet"]) {
  test(`published modal states: ${component}`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await page.goto(`/docs/${component}`);
    const previews = page.locator(`.component-preview[data-component="${component}"]`);
    await expect(previews.first()).toBeVisible();
    const previewCount = await previews.count();
    for (let index = 0; index < previewCount; index++) {
      const canvas = await readyCanvas(previews.nth(index));
      const triggers = canvas.getByRole("button");
      expect(await triggers.count()).toBeGreaterThan(0);
      for (let triggerIndex = 0; triggerIndex < (await triggers.count()); triggerIndex++) {
        const trigger = triggers.nth(triggerIndex);
        const name = `${index + 1}-${triggerIndex + 1}`;
        await trigger.click();
        const surface = page.getByRole(component === "alert-dialog" ? "alertdialog" : "dialog");
        await capture(surface, `${component}-${name}-open`, info);
        const bounds = (await surface.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(-1);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
        expect(bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
        if ((await surface.locator("p").count()) > 1) {
          await surface.locator("p").last().scrollIntoViewIfNeeded();
          await capture(surface, `${component}-${name}-last-content`, info);
        }
        if (component === "alert-dialog") {
          await surface.getByRole("button", { name: "Keep active", exact: true }).click();
        } else {
          await page.keyboard.press("Escape");
        }
        await expect(surface).toBeHidden();
        await expect(trigger).toBeFocused();
      }
    }
  });
}

for (const { component, triggerSelector, surfaceSelector } of [
  {
    component: "dropdown-menu",
    triggerSelector: "button[aria-haspopup]",
    surfaceSelector: '[role="menu"]',
  },
  {
    component: "menubar",
    triggerSelector: '[data-slot="menubar-trigger"]',
    surfaceSelector: '[role="menu"]',
  },
  {
    component: "navigation-menu",
    triggerSelector: '[data-slot="navigation-menu-trigger"]',
    surfaceSelector: '[data-slot="navigation-menu-content"][data-open]',
  },
  {
    component: "combobox",
    triggerSelector: "button[aria-haspopup]",
    surfaceSelector: '[data-slot="popover-content"]',
  },
  {
    component: "select",
    triggerSelector: '[role="combobox"]',
    surfaceSelector: '[role="listbox"]',
  },
  {
    component: "date-picker",
    triggerSelector: "button[aria-haspopup]",
    surfaceSelector: '[data-slot="popover-content"]',
  },
  {
    component: "command",
    triggerSelector: "button",
    surfaceSelector: '[role="dialog"]',
  },
]) {
  test(`published popup states: ${component}`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await page.goto(`/docs/${component}`);
    const previews = page.locator(`.component-preview[data-component="${component}"]`);
    await expect(previews.first()).toBeVisible();
    const previewCount = await previews.count();
    for (let index = 0; index < previewCount; index++) {
      const canvas = await readyCanvas(previews.nth(index));
      const triggers = canvas.locator(`${triggerSelector}:visible`);
      expect(await triggers.count()).toBeGreaterThan(0);
      for (let triggerIndex = 0; triggerIndex < (await triggers.count()); triggerIndex++) {
        const trigger = triggers.nth(triggerIndex);
        if (await trigger.isDisabled()) continue;
        await trigger.click();
        const surface = page.locator(`${surfaceSelector}:visible`).first();
        const name = `${component}-${index + 1}-${triggerIndex + 1}`;
        await capture(surface, `${name}-open`, info);
        const bounds = (await surface.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(-1);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
        if (component === "combobox") {
          const input = surface.locator("input");
          if (await input.count()) {
            await input.fill("no-such-option-7362");
            await capture(surface, `${name}-empty`, info);
            await input.fill("");
          }
        }
        await page.keyboard.press("Escape");
        await expect(surface).toBeHidden();
      }
    }
  });
}

test("published toast feedback states", async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.goto("/docs/sonner");
  const previews = page.locator('.component-preview[data-component="sonner"]');
  await expect(previews.first()).toBeVisible();
  const count = await previews.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index++) {
    if (index) await page.reload();
    const preview = page.locator('.component-preview[data-component="sonner"]').nth(index);
    const canvas = await readyCanvas(preview);
    const trigger = canvas.getByRole("button");
    await trigger.click();
    const toast = page.locator("[data-sonner-toast]").first();
    await capture(toast, `toast-${index + 1}`, info);
    if ((await trigger.getAttribute("aria-busy")) === "true") {
      await expect(trigger).toBeEnabled();
      await capture(toast, `toast-${index + 1}-resolved`, info);
    }
  }
});

test("reduced-motion marquee keeps all text visible", async ({ page }, info) => {
  await page.goto("/docs/marquee");
  const preview = page.locator('.component-preview[data-component="marquee"]').first();
  const strip = preview.locator(".animate-marquee");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await strip.scrollIntoViewIfNeeded();
    await expect(strip).toHaveCSS("animation-name", "none");
    await expect(preview.locator(".animate-marquee2")).toBeHidden();
    const layout = await strip.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return {
        width: node.clientWidth,
        scrollWidth: node.scrollWidth,
        contained: [...node.children].every((child) => {
          const box = child.getBoundingClientRect();
          return box.left >= bounds.left && box.right <= bounds.right + 1;
        }),
      };
    });
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
    expect(layout.contained).toBe(true);
    await capture(strip, `reduced-motion-${width}`, info);
  }
});

for (const component of ["accordion", "collapsible"]) {
  test(`published disclosure states: ${component}`, async ({ page }, info) => {
    await page.goto(`/docs/${component}`);
    const preview = page.locator(`.component-preview[data-component="${component}"]`).first();
    const canvas = await readyCanvas(preview);
    const triggers = canvas.locator("button[aria-expanded]");
    expect(await triggers.count()).toBeGreaterThan(0);
    for (let index = 0; index < (await triggers.count()); index++) {
      const trigger = triggers.nth(index);
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await capture(canvas, `${component}-${index + 1}-expanded`, info);
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });
}

test("published carousel slides remain usable through the last slide", async ({ page }, info) => {
  await page.goto("/docs/carousel");
  const canvas = await readyCanvas(
    page.locator('.component-preview[data-component="carousel"]').first(),
  );
  const next = canvas.getByRole("button", { name: /next/i });
  // Embla initializes after React mounts; its initial disabled state is not the last slide.
  await expect(next).toBeEnabled();
  const slides = canvas.locator('[data-slot="carousel-item"]');
  const count = await slides.count();
  expect(count).toBeGreaterThan(1);
  for (let index = 1; index < count; index++) {
    await next.click();
    await expect
      .poll(() =>
        slides.nth(index).evaluate((node) => {
          const viewport = node.closest('[data-slot="carousel-content"]')!;
          const edge = viewport.getBoundingClientRect().right;
          return Math.abs(node.getBoundingClientRect().right - edge);
        }),
      )
      .toBeLessThanOrEqual(1);
    await capture(canvas, `carousel-${index}`, info);
  }
  await expect(next).toBeDisabled();
  await expect(canvas.getByRole("button", { name: /previous/i })).toBeEnabled();
});

test("published tooltip is visible on keyboard focus", async ({ page }, info) => {
  await page.goto("/docs/tooltip");
  const preview = page.locator('.component-preview[data-component="tooltip"]').first();
  await page.keyboard.press("Tab");
  await preview.getByRole("button").focus();
  await capture(page.getByRole("tooltip"), "tooltip-keyboard", info);
});

test("published one-time-code cells display the entered digits", async ({ page }, info) => {
  await page.goto("/docs/input-otp");
  const canvas = page.locator(
    '.component-preview[data-component="input-otp"] .component-preview__canvas',
  );
  await canvas.locator("input").fill("123456");
  await expect(canvas.locator("input")).toHaveValue("123456");
  await capture(canvas, "otp-filled", info);
});
