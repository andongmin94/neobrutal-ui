import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Mount the exported components directly so consumer props are exercised without docs wrappers.
let server: ViteDevServer;
let origin: string;
const root = fileURLToPath(new URL("..", import.meta.url));
const cacheRoot = join(root, "test-results");
let cacheDirectory: string | undefined;
test.beforeAll(async () => {
  await mkdir(cacheRoot, { recursive: true });
  cacheDirectory = await mkdtemp(join(cacheRoot, "component-composition-vite-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir: cacheDirectory,
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    server: { host: "127.0.0.1", port: 0 },
    appType: "custom",
    plugins: [tailwindcss()],
    optimizeDeps: { entries: ["tests/fixtures/component-composition.tsx"] },
  });
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] !== "/") return next();
    response.setHeader("Content-Type", "text/html");
    response.end(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Component composition</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/component-composition.tsx"></script></body></html>',
    );
  });
  await server.listen();
  origin = server.resolvedUrls!.local[0];
});
test.afterAll(async () => {
  try {
    await server?.close();
  } finally {
    if (cacheDirectory) {
      assert.equal(dirname(cacheDirectory), cacheRoot, "Unexpected Vite cache path");
      await rm(cacheDirectory, { recursive: true, force: true, maxRetries: 3 });
    }
  }
});
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(origin);
  await expect(page.getByTestId("badge-refs")).toHaveText("true");
});

test("Badge merges the rendered link's handlers, styles and refs", async ({ page }) => {
  const link = page.getByRole("link", { name: "Published" });
  await expect(link).toHaveCSS("color", "rgb(200, 0, 0)");
  await expect(link).toHaveCSS("font-weight", "700");
  await link.focus();
  await link.press("Enter");
  await expect(page.getByTestId("badge-calls")).toHaveText("inner,outer");
  await expect(page).toHaveURL(`${origin}#destination`);
});

test("InputGroupAddon preserves consumer clicks, cancellation and nested button focus", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Search field" });
  const button = page.getByRole("button", { name: "Keep button focus" });
  await button.click();
  await page.getByTestId("normal-addon").click();
  await expect(input).toBeFocused();
  await expect(page.getByTestId("addon-calls")).toHaveText("1");
  await button.click();
  await page.getByTestId("cancelled-addon").click();
  await expect(input).not.toBeFocused();
  await expect(page.getByTestId("addon-cancelled")).toHaveText("1");
  await button.click();
  await expect(input).not.toBeFocused();
});

for (const direction of ["ltr", "rtl"] as const) {
  test(`InputGroup inline ${direction} gutters follow addon placement and keep controls usable`, async ({
    page,
  }) => {
    await page.goto(`${origin}?surface=input-group-direction&direction=${direction}`);
    for (const [kind, expectedGutter] of [
      ["text", 8],
      ["button", 3.2],
      ["kbd", 5.6],
    ] as const) {
      for (const align of ["inline-start", "inline-end"] as const) {
        const group = page.getByTestId(`${kind}-${align}`);
        await expect(group).toHaveCSS("direction", direction);
        const input = group.getByRole("textbox");
        await expect(input).toHaveCSS(
          "padding-inline-start",
          align === "inline-start" ? "6px" : "12px",
        );
        await expect(input).toHaveCSS(
          "padding-inline-end",
          align === "inline-end" ? "6px" : "12px",
        );
        const isLeft = (direction === "ltr") === (align === "inline-start");
        const layout = await group.evaluate((element, left) => {
          const outer = element.getBoundingClientRect();
          const border = getComputedStyle(element);
          const addon = element.querySelector('[data-slot="input-group-addon"]')!;
          const content = addon.firstElementChild!.getBoundingClientRect();
          const field = element.querySelector("input")!.getBoundingClientRect();
          return {
            gutter: left
              ? content.left - outer.left - Number.parseFloat(border.borderLeftWidth)
              : outer.right - content.right - Number.parseFloat(border.borderRightWidth),
            outsideField: left ? content.right <= field.left : content.left >= field.right,
          };
        }, isLeft);
        expect(layout.gutter).toBeCloseTo(expectedGutter, 1);
        expect(layout.outsideField).toBe(true);
      }
    }

    const textGroup = page.getByTestId("text-inline-start");
    const textInput = textGroup.getByRole("textbox");
    await textGroup.locator('[data-slot="input-group-addon"]').click();
    await expect(textInput).toBeFocused();
    await textInput.fill("Edited value");
    const button = page.getByTestId("button-inline-end").getByRole("button", { name: "Action" });
    await button.click();
    await expect(button).toBeFocused();
    await button.press("Enter");
    await expect(page.getByTestId("input-group-actions")).toHaveText("2");
    await expect(textInput).toHaveValue("Edited value");
    const keyGroup = page.getByTestId("kbd-inline-end");
    await keyGroup.locator("kbd").click();
    await expect(keyGroup.getByRole("textbox")).toBeFocused();
  });

  test(`Tabs vertical line ${direction} indicator faces its panel and retains arrow navigation`, async ({
    page,
  }) => {
    await page.goto(`${origin}?surface=tabs-direction&direction=${direction}`);
    await expect(page.locator('[data-slot="tabs"]')).toHaveCSS("direction", direction);
    const overview = page.getByRole("tab", { name: "Overview", exact: true });
    const history = page.getByRole("tab", { name: "History", exact: true });
    const panel = page.getByRole("tabpanel", { name: "Overview", exact: true });
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await expect(panel).toBeVisible();
    await expect
      .poll(() => overview.evaluate((element) => getComputedStyle(element, "::after").opacity))
      .toBe("1");
    const indicator = await overview.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const border = getComputedStyle(element);
      const marker = getComputedStyle(element, "::after");
      const width = Number.parseFloat(marker.width);
      const left = Number.parseFloat(marker.left);
      const x = Number.isFinite(left)
        ? box.left + Number.parseFloat(border.borderLeftWidth) + left
        : box.right -
          Number.parseFloat(border.borderRightWidth) -
          Number.parseFloat(marker.right) -
          width;
      return { center: x + width / 2, left: box.left, right: box.right };
    });
    const panelBox = (await panel.boundingBox())!;
    expect(Number.isFinite(indicator.center)).toBe(true);
    expect(
      direction === "rtl"
        ? panelBox.x + panelBox.width < indicator.center && indicator.center < indicator.left
        : indicator.right < indicator.center && indicator.center < panelBox.x,
    ).toBe(true);

    await overview.focus();
    await overview.press("ArrowDown");
    await expect(history).toBeFocused();
    await expect(history).toHaveAttribute("aria-selected", "true");
    await expect(overview).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("tabpanel", { name: "History", exact: true })).toHaveText(
      "History panel",
    );
  });
}

for (const [appearance, behavior] of [
  ["default", "duration options retain theme styles"],
  ["custom", "partial class names replace only their matching defaults"],
  ["native", "explicit native styling is preserved with partial class names"],
] as const) {
  test(`Sonner ${behavior}`, async ({ page }) => {
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.goto(`${origin}?surface=sonner-options&appearance=${appearance}`);
    const trigger = page.getByRole("button", { name: "Show configured notification" });
    await expect(trigger).toBeVisible();
    await page.clock.pauseAt(new Date("2026-01-01T00:01:00Z"));
    await trigger.click();
    await page.clock.runFor(20);

    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toHaveAttribute("data-mounted", "true");
    await expect(toast).toHaveAttribute("data-styled", String(appearance === "native"));
    await expect(toast).toHaveClass(/\bborder-2\b/);
    await expect(toast).toHaveClass(/\bshadow-shadow\b/);
    await expect(toast.locator("[data-description]")).toHaveClass(
      appearance === "default" ? "font-base" : "consumer-description",
    );
    await expect(toast.getByRole("button", { name: "Close toast" })).toBeVisible();

    await page.clock.runFor(1000);
    await expect(toast).toHaveAttribute("data-removed", "false");
    await page.clock.runFor(500);
    await expect(toast).toHaveAttribute("data-removed", "true");
    await page.clock.runFor(200);
    await expect(toast).toHaveCount(0);
  });
}

test("Carousel keeps navigation when consumer handlers are present and honors cancellation", async ({
  page,
}) => {
  const next = page.getByRole("button", { name: "Next slide" });
  const previous = page.getByRole("button", { name: "Previous slide" });
  const block = page.getByRole("button", { name: "Block next navigation" });
  await expect(next).toBeEnabled();
  await expect(previous).toBeDisabled();
  await block.click();
  await next.click();
  await expect(page.getByTestId("next-calls")).toHaveText("1");
  await expect(previous).toBeDisabled();
  await block.click();
  await next.click();
  await expect(previous).toBeEnabled();
  await next.click();
  await expect(next).toBeDisabled();
  await expect(page.getByTestId("next-calls")).toHaveText("3");
  await previous.click();
  await previous.click();
  await expect(previous).toBeDisabled();
  await expect(page.getByTestId("previous-calls")).toHaveText("2");
});

for (const orientation of ["horizontal", "vertical"] as const) {
  for (const direction of ["ltr", "rtl"] as const) {
    test(`Carousel ${orientation} ${direction} navigation follows its layout and honors cancellation`, async ({
      page,
    }) => {
      await page.goto(
        `${origin}?surface=carousel-keyboard&orientation=${orientation}&direction=${direction}`,
      );
      const carousel = page.getByRole("region", { name: "Composed slides" });
      const previous = carousel.getByRole("button", { name: "Previous slide" });
      const next = carousel.getByRole("button", { name: "Next slide" });
      const block = page.getByRole("button", { name: "Block next navigation" });
      const selected = page.getByTestId("carousel-selection");
      const forward =
        orientation === "horizontal"
          ? direction === "rtl"
            ? "ArrowLeft"
            : "ArrowRight"
          : "ArrowDown";
      const backward =
        orientation === "horizontal"
          ? direction === "rtl"
            ? "ArrowRight"
            : "ArrowLeft"
          : "ArrowUp";
      const crossAxis = orientation === "horizontal" ? "ArrowDown" : "ArrowRight";
      await expect(next).toBeEnabled();
      await expect(previous).toBeDisabled();
      await expect(selected).toHaveText("0");
      await expect(carousel).toHaveCSS("direction", direction);

      const rotation = orientation === "horizontal" && direction === "rtl" ? "180deg" : "none";
      await expect(previous.locator("svg")).toHaveCSS("rotate", rotation);
      await expect(next.locator("svg")).toHaveCSS("rotate", rotation);
      if (orientation === "horizontal") {
        const track = carousel.locator('[data-slot="carousel-content"] > div');
        const firstSlide = carousel.locator('[data-slot="carousel-item"]').first();
        await expect(track).toHaveCSS("margin-inline-start", "-16px");
        await expect(track).toHaveCSS("margin-inline-end", "0px");
        await expect(firstSlide).toHaveCSS("padding-inline-start", "16px");
        await expect(firstSlide).toHaveCSS("padding-inline-end", "0px");
        const bounds = (await carousel.boundingBox())!;
        const before = (await (direction === "rtl" ? next : previous).boundingBox())!;
        const after = (await (direction === "rtl" ? previous : next).boundingBox())!;
        expect(before.x + before.width).toBeLessThanOrEqual(bounds.x);
        expect(after.x).toBeGreaterThanOrEqual(bounds.x + bounds.width);
      }

      await carousel.focus();
      await carousel.press(crossAxis);
      await expect(selected).toHaveText("0");

      await block.click();
      await carousel.focus();
      await carousel.press(forward);
      await expect(selected).toHaveText("0");
      await expect(previous).toBeDisabled();
      await block.click();

      await carousel.focus();
      await carousel.press(forward);
      await expect(selected).toHaveText("1");
      await expect(previous).toBeEnabled();
      await next.focus();
      await next.press(forward);
      await expect(selected).toHaveText("2");
      await expect(next).toBeDisabled();
      await previous.focus();
      await previous.press(backward);
      await expect(selected).toHaveText("1");
      await expect(next).toBeEnabled();
      await carousel.focus();
      await carousel.press(backward);
      await expect(selected).toHaveText("0");
      await expect(previous).toBeDisabled();

      await next.click();
      await expect(selected).toHaveText("1");
      await expect(page.getByTestId("next-calls")).toHaveText("1");
      await previous.click();
      await expect(selected).toHaveText("0");
      await expect(page.getByTestId("previous-calls")).toHaveText("1");
    });
  }
}

test("Sidebar notifies uncontrolled changes, composes rail clicks and honors cancelled toggles", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Toggle Sidebar", exact: true }).first();
  const rail = page.locator('[data-slot="sidebar-rail"]');
  await trigger.click();
  await expect(page.getByTestId("sidebar-state")).toHaveText("expanded");
  await expect(page.getByTestId("sidebar-observed")).toHaveText("true");
  await page.getByRole("button", { name: "Cancel sidebar toggle" }).click();
  await trigger.click();
  await expect(page.getByTestId("sidebar-state")).toHaveText("expanded");
  await expect(page.getByTestId("sidebar-calls")).toHaveText("2");
  await rail.click();
  await expect(page.getByTestId("sidebar-state")).toHaveText("collapsed");
  await expect(page.getByTestId("sidebar-observed")).toHaveText("false");
  await expect(page.getByTestId("rail-calls")).toHaveText("1");
});

test("A tooltip does not make a disabled SidebarMenuButton actionable", async ({ page }) => {
  const button = page.getByRole("button", { name: "Unavailable action" });
  await expect(button).toBeDisabled();
  await button.evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByTestId("disabled-calls")).toHaveText("0");
  await button.focus();
  await expect(button).not.toBeFocused();
});

for (const control of ["menu", "action"]) {
  test(`Sidebar ${control} buttons submit forms only when explicitly requested`, async ({
    page,
  }) => {
    await page.goto(`${origin}?surface=sidebar-form&control=${control}`);
    const submissions = page.getByTestId("sidebar-form-submissions");
    for (const name of ["Default action", "Rendered action", "Callback action"]) {
      const button = page.getByRole("button", { name, exact: true });
      await expect(button).toHaveAttribute("type", "button");
      await button.click();
      await button.press("Enter");
      await expect(submissions).toHaveText("0");
    }

    await page.getByRole("button", { name: "Submit form", exact: true }).click();
    await expect(submissions).toHaveText("1");
    await page.getByRole("button", { name: "Submit from rendered button", exact: true }).click();
    await expect(submissions).toHaveText("2");

    const link = page.getByRole("link", { name: "Navigation link", exact: true });
    await expect(link).not.toHaveAttribute("type");
    await link.click();
    await expect(page).toHaveURL(`${origin}?surface=sidebar-form&control=${control}#destination`);
    await expect(submissions).toHaveText("2");
  });
}

test("Select forwards null changes and supports choosing again after clearing", async ({
  page,
}) => {
  await page.goto(`${origin}?surface=select-clear`);
  const trigger = page.getByRole("combobox", { name: "Selection", exact: true });
  await trigger.click();
  await page.getByRole("option", { name: "Clear selection", exact: true }).click();
  await expect(page.getByTestId("selection-value")).toHaveText("null");
  await expect(page.getByTestId("selection-calls")).toHaveText("[null]");
  await expect(page.locator('input[name="selection"]')).toHaveValue("");
  await expect(trigger).toContainText("No selection");
  await trigger.click();
  await page.getByRole("option", { name: "Bravo", exact: true }).click();
  await expect(page.getByTestId("selection-value")).toHaveText("b");
  await expect(page.getByTestId("selection-calls")).toHaveText('[null,"b"]');
  await expect(page.locator('input[name="selection"]')).toHaveValue("b");
});

test("Select clears controlled state when the selected option disappears", async ({ page }) => {
  await page.goto(`${origin}?surface=select-remove`);
  await page.getByRole("combobox", { name: "Selection", exact: true }).click();
  await expect(page.getByRole("option", { name: "Alpha", exact: true })).toBeVisible();
  // Model an option-data refresh while the modal popup remains open.
  await page
    .getByRole("button", { name: "Remove Alpha", exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByRole("option", { name: "Alpha", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("selection-value")).toHaveText("null");
  await expect(page.getByTestId("selection-calls")).toHaveText("[null]");
});

test("Select preserves native cancellation details when clearing", async ({ page }) => {
  await page.goto(`${origin}?surface=select-cancel`);
  const trigger = page.getByRole("combobox", { name: "Selection", exact: true });
  await trigger.click();
  await page.getByRole("option", { name: "Clear selection", exact: true }).click();
  await expect(page.getByTestId("selection-calls")).toHaveText("[null]");
  await expect(page.getByTestId("selection-value")).toHaveText("a");
  await expect(trigger).toContainText("Alpha");
  await expect(page.locator('input[name="selection"]')).toHaveValue("a");
});

for (const direction of ["ltr", "rtl"] as const) {
  for (const aligned of [true, false]) {
    test(`select: local ${direction} ${aligned ? "sections" : "floating sections"} preserve popup layout and keyboard selection`, async ({
      page,
    }) => {
      await page.goto(
        `${origin}?surface=select-direction&direction=${direction}&aligned=${aligned}`,
      );
      await expect(page.locator("body")).toHaveCSS("direction", "ltr");
      const trigger = page.getByRole("combobox", { name: "Directional selection", exact: true });
      await expect(trigger).toHaveCSS("direction", direction);
      await expect(trigger.locator('[data-slot="select-value"]')).toHaveCSS("text-align", "start");
      await trigger.press("Enter");

      const popup = page.locator('[data-slot="select-content"]');
      await expect(popup).toBeVisible();
      await expect(popup).toHaveCSS("direction", direction);
      await expect(popup.locator("..")).toHaveCSS("direction", direction);
      expect(
        await popup.evaluate((node) => node.closest('[data-testid="select-direction"]')),
      ).toBeNull();
      if (!aligned) {
        await expect
          .poll(async () => {
            const anchorBox = (await trigger.boundingBox())!;
            const popupBox = (await popup.boundingBox())!;
            return Math.abs(
              direction === "rtl"
                ? popupBox.x + popupBox.width - anchorBox.x - anchorBox.width
                : popupBox.x - anchorBox.x,
            );
          })
          .toBeLessThan(2);
        const anchorBox = (await trigger.boundingBox())!;
        const popupBox = (await popup.boundingBox())!;
        expect(popupBox.width).toBeGreaterThan(anchorBox.width + 40);
      }
      const selected = popup.getByRole("option", { name: "Alpha", exact: true });
      await expect(selected).toHaveAttribute("aria-selected", "true");
      await expect(selected).toBeFocused();
      const optionBox = (await selected.boundingBox())!;
      const indicatorBox = (await selected.locator("svg").boundingBox())!;
      const textBox = (await popup.getByTestId("select-a-text").boundingBox())!;
      expect(
        direction === "rtl"
          ? indicatorBox.x < optionBox.x + optionBox.width / 2
          : indicatorBox.x > optionBox.x + optionBox.width / 2,
      ).toBe(true);
      expect(
        direction === "rtl"
          ? indicatorBox.x + indicatorBox.width < textBox.x
          : textBox.x + textBox.width < indicatorBox.x,
      ).toBe(true);

      await page.keyboard.press("End");
      await expect(popup.getByRole("option", { name: "Bravo", exact: true })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(popup).toBeHidden();
      await expect(trigger).toContainText("Bravo");
      await expect(trigger).toBeFocused();
      await expect(page.locator('input[name="directional-selection"]')).toHaveValue("b");
    });
  }
}

test("Long Select lists fit short viewports and keep the final option reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 390 });
  for (const aligned of [false, true]) {
    await page.goto(`${origin}?surface=select-long&aligned=${aligned}`);
    const trigger = page.getByRole("combobox", { name: "Workspace", exact: true });
    await trigger.press("Enter");
    const popup = page.locator('[data-slot="select-content"]');
    await expect(popup).toBeVisible();
    if (aligned) {
      await expect(popup).toHaveAttribute("data-side", "none");
      await expect.poll(async () => (await popup.boundingBox())!.height).toBeGreaterThan(350);
    }
    await expect
      .poll(async () => {
        const box = await popup.boundingBox();
        return box !== null && box.y >= 0 && box.y + box.height <= 391;
      })
      .toBe(true);
    const list = popup.getByRole("listbox");
    await expect
      .poll(() => list.evaluate((node) => node.scrollHeight > node.clientHeight))
      .toBe(true);
    const finalOption = list.getByRole("option", { name: "Workspace 80", exact: true });
    await finalOption.scrollIntoViewIfNeeded();
    await expect(finalOption).toBeInViewport({ ratio: 1 });
    await finalOption.click();
    await expect(trigger).toContainText("Workspace 80");
  }
});

test("Command reports initially empty and refreshed empty option collections", async ({ page }) => {
  await page.goto(`${origin}?surface=command-empty`);
  const empty = page.locator('[data-slot="command-empty"]');
  await expect(empty).toHaveText("No options available");
  const input = page.getByRole("combobox", { name: "Find options", exact: true });
  await input.fill("missing");
  await expect(empty).toBeVisible();
  await input.clear();
  await expect(empty).toBeVisible();
  const toggle = page.getByRole("button", { name: "Toggle available options", exact: true });
  await toggle.click();
  await expect(page.getByRole("option", { name: "Loaded option", exact: true })).toBeVisible();
  await expect(empty).toHaveCount(0);
  await toggle.click();
  await expect(empty).toBeVisible();
});

test("Switch thumbs stay inside both sizes and move with LTR or RTL state", async ({ page }) => {
  await page.goto(`${origin}?surface=switch`);
  const switches = page.getByRole("switch");
  // Empty geometry must not count as a rendered fixture before the module loads.
  await expect(switches).toHaveCount(4);
  for (const control of await switches.all())
    await expect(control).toHaveAttribute("aria-checked", "true");
  const geometry = () =>
    switches.evaluateAll((nodes) =>
      nodes.map((node) => {
        const track = node.getBoundingClientRect();
        const thumb = node.querySelector('[data-slot="switch-thumb"]')!.getBoundingClientRect();
        return {
          name: node.getAttribute("aria-label")!,
          x: thumb.x,
          inside: thumb.x >= track.x && thumb.right <= track.right,
        };
      }),
    );
  await expect.poll(async () => (await geometry()).every((item) => item.inside)).toBe(true);
  const checked = await geometry();
  await page.getByRole("switch", { name: "rtl default", exact: true }).click();
  for (const control of await switches.all())
    await expect(control).toHaveAttribute("aria-checked", "false");
  await expect
    .poll(async () => {
      const unchecked = await geometry();
      return unchecked.every(
        (item, index) =>
          item.inside &&
          (item.name.startsWith("rtl") ? item.x > checked[index].x : item.x < checked[index].x),
      );
    })
    .toBe(true);
});

test("Long Alert Dialogs scroll within short viewports and restore trigger focus", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 390 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${origin}?surface=alert-long`);
    const trigger = page.getByRole("button", { name: "Open long confirmation", exact: true });
    await trigger.click();
    const dialog = page.getByRole("alertdialog", {
      name: "Archive all project records?",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        return box !== null && box.y >= 15 && box.y + box.height <= viewport.height - 15;
      })
      .toBe(true);
    await expect
      .poll(() => dialog.evaluate((node) => node.scrollHeight > node.clientHeight))
      .toBe(true);
    await dialog.evaluate((node) => {
      node.scrollTop = 0;
    });
    await expect(
      dialog.getByRole("heading", { name: "Archive all project records?" }),
    ).toBeInViewport({ ratio: 1 });
    const cancel = dialog.getByRole("button", { name: "Keep active", exact: true });
    await cancel.scrollIntoViewIfNeeded();
    await expect(cancel).toBeInViewport({ ratio: 1 });
    await cancel.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test("Chart content htmlProps preserve DOM refs and click handlers", async ({ page }) => {
  await page.goto(`${origin}?surface=chart-html-props`);
  await expect(page.getByTestId("chart-refs")).toHaveText("composition-tooltip,composition-legend");
  await page.locator("#composition-tooltip").click();
  await expect(page.getByTestId("tooltip-calls")).toHaveText("1");
  await expect(page.getByTestId("legend-calls")).toHaveText("0");
  await page.locator("#composition-legend").click();
  await expect(page.getByTestId("legend-calls")).toHaveText("1");
});
