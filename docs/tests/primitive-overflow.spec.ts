import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import tailwindcss from "@tailwindcss/vite";
import { createServer, type ViteDevServer } from "vite";

let server: ViteDevServer;
let origin: string;
const root = fileURLToPath(new URL("..", import.meta.url));
const cacheRoot = join(root, "test-results");
let cacheDirectory: string | undefined;

test.beforeAll(async () => {
  await mkdir(cacheRoot, { recursive: true });
  cacheDirectory = await mkdtemp(join(cacheRoot, "primitive-overflow-vite-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir: cacheDirectory,
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    server: { host: "127.0.0.1", port: 0 },
    appType: "custom",
    plugins: [tailwindcss()],
    optimizeDeps: { entries: ["tests/fixtures/primitive-overflow.tsx"] },
  });
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] !== "/") return next();
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Primitive locale and overflow</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/primitive-overflow.tsx"></script></body></html>',
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

test("Menubar orientation matches its visual layout and keyboard navigation", async ({ page }) => {
  for (const orientation of ["horizontal", "vertical"] as const) {
    await page.goto(`${origin}?surface=named-menus&kind=menubar&orientation=${orientation}`);
    const menu = page.getByRole("menubar");
    const first = menu.getByRole("menuitem", { name: "Menu commands" });
    const second = menu.getByRole("menuitem", { name: "View commands" });
    await expect(menu).toHaveAttribute("aria-orientation", orientation);
    await expect(menu).toHaveCSS("flex-direction", orientation === "vertical" ? "column" : "row");
    const firstBox = (await first.boundingBox())!;
    const secondBox = (await second.boundingBox())!;
    if (orientation === "vertical") {
      expect(secondBox.y).toBeGreaterThanOrEqual(firstBox.y + firstBox.height);
    } else {
      expect(secondBox.x).toBeGreaterThanOrEqual(firstBox.x + firstBox.width);
    }
    await first.focus();
    await first.press(orientation === "vertical" ? "ArrowDown" : "ArrowRight");
    await expect(second).toBeFocused();
  }
});

for (const kind of ["dropdown", "context", "menubar"] as const) {
  test(`Menu labels associate ${kind} item and radio groups`, async ({ page }) => {
    await page.goto(`${origin}?surface=named-menus&kind=${kind}`);
    if (kind === "context") {
      const target = page.getByText("Context commands", { exact: true });
      await target.focus();
      await target.press("Shift+F10");
    } else {
      await page
        .getByRole(kind === "menubar" ? "menuitem" : "button", {
          name: kind === "menubar" ? "Menu commands" : "Dropdown commands",
          exact: true,
        })
        .click();
    }

    const actions = page.getByRole("group", { name: "File actions", exact: true });
    const layout = page.getByRole("group", { name: "View layout", exact: true });
    await expect(actions).toBeVisible();
    await expect(layout).toBeVisible();
    await expect(actions).toHaveAttribute("aria-labelledby", `${kind}-actions`);
    const label = page.locator(`span#${kind}-actions`);
    await expect(label).toHaveText("File actions");
    await expect(label).toHaveClass(/native-menu-label/);
    await expect(label).toHaveAttribute("data-label-ref", "attached");
    const layoutLabel = await layout.getAttribute("aria-labelledby");
    expect(layoutLabel).toBeTruthy();
    expect(layoutLabel).not.toBe(`${kind}-actions`);
    expect(
      await page.evaluate((id) => document.getElementById(id!)?.textContent, layoutLabel),
    ).toBe("View layout");
    await expect(layout.getByRole("menuitemradio", { name: "Grid", exact: true })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  for (const direction of ["ltr", "rtl"] as const) {
    test(`Menu submenu ${kind} matches ${direction} placement and arrow navigation`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto(`${origin}?surface=named-menus&kind=${kind}&direction=${direction}`);
      await expect(page.locator("body")).toHaveCSS("direction", "ltr");
      await expect(page.getByTestId("menu-direction")).toHaveCSS("direction", direction);
      if (kind === "context") {
        const target = page.getByText("Context commands", { exact: true });
        await target.focus();
        await target.press("Shift+F10");
      } else {
        await page
          .getByRole(kind === "menubar" ? "menuitem" : "button", {
            name: kind === "menubar" ? "Menu commands" : "Dropdown commands",
            exact: true,
          })
          .click();
      }

      const parentMenu = page.getByRole("menu").first();
      await expect(parentMenu).toHaveAttribute("dir", direction);
      await expect(parentMenu.locator("..")).toHaveCSS("direction", direction);
      expect(
        await parentMenu.evaluate((element) => element.closest('[data-testid="menu-direction"]')),
      ).toBeNull();
      if (kind !== "context") {
        const opener = page.getByRole(kind === "menubar" ? "menuitem" : "button", {
          name: kind === "menubar" ? "Menu commands" : "Dropdown commands",
          exact: true,
        });
        await expect(parentMenu).toHaveAttribute("data-align", "start");
        await expect
          .poll(async () => {
            const triggerBox = await opener.boundingBox();
            const popupBox = await parentMenu.boundingBox();
            if (!triggerBox || !popupBox || popupBox.width <= triggerBox.width + 40) return false;
            const triggerEdge =
              direction === "rtl" ? triggerBox.x + triggerBox.width : triggerBox.x;
            const popupEdge = direction === "rtl" ? popupBox.x + popupBox.width : popupBox.x;
            return Math.abs(triggerEdge - popupEdge) < 2;
          })
          .toBe(true);
      }
      const trigger = page.getByRole("menuitem", { name: "Export", exact: true });
      const arrow = trigger.locator("svg");
      await expect(arrow).toHaveCSS("rotate", direction === "rtl" ? "180deg" : "none");
      const checkbox = page.getByRole("menuitemcheckbox", { name: "Show previews", exact: true });
      const indicator = checkbox.locator("svg");
      const checkboxBox = (await checkbox.boundingBox())!;
      const indicatorBox = (await indicator.boundingBox())!;
      expect(
        direction === "rtl"
          ? indicatorBox.x > checkboxBox.x + checkboxBox.width / 2
          : indicatorBox.x < checkboxBox.x + checkboxBox.width / 2,
      ).toBe(true);

      await trigger.focus();
      await trigger.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
      const firstCommand = page.getByRole("menuitem", { name: "JSON", exact: true });
      await expect(firstCommand).toBeFocused();
      const submenu = page.getByRole("menu").filter({ has: firstCommand });
      await expect(submenu).toHaveAttribute("dir", direction);
      await expect(submenu).toHaveAttribute("data-side", "inline-end");
      await expect
        .poll(async () => {
          const parentBox = await parentMenu.boundingBox();
          const childBox = await submenu.boundingBox();
          if (!parentBox || !childBox) return false;
          return direction === "rtl"
            ? childBox.x + childBox.width <= parentBox.x + 10
            : childBox.x >= parentBox.x + parentBox.width - 10;
        })
        .toBe(true);
      await firstCommand.press(direction === "rtl" ? "ArrowRight" : "ArrowLeft");
      await expect(firstCommand).toBeHidden();
      await expect(trigger).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(parentMenu).toBeHidden();
    });
  }
}

test("NavigationMenu keeps the current destination visible when another link is hovered", async ({
  page,
}) => {
  await page.goto(`${origin}?surface=navigation-menu`);
  await page.getByRole("button", { name: "Sections", exact: true }).click();
  const current = page.getByRole("link", { name: "Section 1", exact: true });
  const other = page.getByRole("link", { name: "Section 2", exact: true });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(current).toHaveCSS("text-decoration-line", "underline");
  await expect(other).not.toHaveAttribute("aria-current");
  await expect(other).toHaveCSS("text-decoration-line", "none");
  await other.hover();
  await expect(current).toHaveCSS("text-decoration-line", "underline");
});

for (const direction of ["ltr", "rtl"] as const) {
  test(`NavigationMenu preserves local ${direction} direction through its portal`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto(`${origin}?surface=navigation-direction&direction=${direction}`);
    await expect(page.locator("html")).toHaveCSS("direction", "ltr");
    const first = page.getByRole("button", { name: "Guides", exact: true });
    const second = page.getByRole("button", { name: "Resources", exact: true });
    await first.focus();
    await first.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
    await expect(second).toBeFocused();
    await second.press("ArrowDown");
    const link = page.getByRole("link", { name: "Resources Overview", exact: true });
    await expect(link).toBeVisible();
    await expect(second).toBeFocused();
    await second.press("Tab");
    await expect(link).toBeFocused();
    const popup = page.locator('[data-slot="navigation-menu-popup"]');
    const positioner = popup.locator("..");
    await expect(popup).toHaveCSS("direction", direction);
    await expect(positioner).toHaveCSS("direction", direction);
    await expect
      .poll(async () => {
        const anchor = await second.boundingBox();
        const floating = await positioner.boundingBox();
        if (!anchor || !floating) return Number.POSITIVE_INFINITY;
        return Math.abs(
          direction === "rtl"
            ? anchor.x + anchor.width - (floating.x + floating.width)
            : anchor.x - floating.x,
        );
      })
      .toBeLessThanOrEqual(2);
    await link.press("Escape");
    await expect(popup).toBeHidden();
    await expect(second).toBeFocused();
  });

  test(`Anchored popups preserve local ${direction} direction and start alignment`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    for (const kind of ["popover", "tooltip", "hover-card"] as const) {
      await test.step(kind, async () => {
        await page.goto(`${origin}?surface=portal-direction&direction=${direction}&kind=${kind}`);
        await expect(page.locator("html")).toHaveCSS("direction", "ltr");
        const trigger = page.locator(`[data-slot="${kind}-trigger"]`);
        if (kind === "popover") await trigger.press("Enter");
        else await trigger.focus();
        const popup = page.locator(`[data-slot="${kind}-content"]`);
        await expect(popup).toBeVisible();
        await expect(popup).toHaveCSS("direction", direction);
        const positioner = popup.locator("..");
        await expect(positioner).toHaveCSS("direction", direction);
        await expect
          .poll(async () => {
            const anchor = await trigger.boundingBox();
            const floating = await positioner.boundingBox();
            if (!anchor || !floating) return Number.POSITIVE_INFINITY;
            return Math.abs(
              direction === "rtl"
                ? anchor.x + anchor.width - (floating.x + floating.width)
                : anchor.x - floating.x,
            );
          })
          .toBeLessThanOrEqual(2);
        await page.keyboard.press("Escape");
        await expect(popup).toBeHidden();
      });
    }
  });

  test(`Modal popups preserve local ${direction} text direction`, async ({ page }) => {
    for (const kind of ["dialog", "alert-dialog", "sheet", "drawer"] as const) {
      await test.step(kind, async () => {
        await page.goto(`${origin}?surface=portal-direction&direction=${direction}&kind=${kind}`);
        await expect(page.locator("html")).toHaveCSS("direction", "ltr");
        const trigger = page.locator(`[data-slot="${kind}-trigger"]`);
        await trigger.click();
        const popup = page.locator(`[data-slot="${kind}-content"]`);
        await expect(popup).toBeVisible();
        await expect(popup).toHaveCSS("direction", direction);
        await expect(popup.getByRole("heading")).toHaveCSS("direction", direction);
        if (kind === "dialog" || kind === "sheet") {
          const close = popup.getByRole("button", { name: "Close", exact: true });
          await expect
            .poll(async () => {
              const contentBox = await popup.boundingBox();
              const closeBox = await close.boundingBox();
              if (!contentBox || !closeBox) return false;
              const closeCenter = closeBox.x + closeBox.width / 2;
              const contentCenter = contentBox.x + contentBox.width / 2;
              return direction === "rtl"
                ? closeCenter < contentCenter
                : closeCenter > contentCenter;
            })
            .toBe(true);
        }
        await page.keyboard.press("Escape");
        await expect(popup).toBeHidden();
        await expect(trigger).toBeFocused();
      });
    }
  });
}

test("NavigationMenu fits short viewports and scrolls to every link by pointer and keyboard", async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: 320, height: 390 });
  await page.goto(`${origin}?surface=navigation-menu`);
  const trigger = page.getByRole("button", { name: "Sections", exact: true });
  await trigger.click();
  const popup = page.locator('[data-slot="navigation-menu-popup"]');
  const content = page.locator('[data-slot="navigation-menu-content"]');
  await expect(popup).toBeVisible();
  await expect
    .poll(async () => {
      const box = await popup.boundingBox();
      return box !== null && box.y >= -1 && box.y + box.height <= 391;
    })
    .toBe(true);
  await expect(content).toHaveCSS("overflow-y", "auto");
  expect(await content.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);

  const first = content.getByRole("link", { name: "Section 1", exact: true });
  const last = content.getByRole("link", { name: "Section 40", exact: true });
  if (isMobile) {
    await last.scrollIntoViewIfNeeded();
  } else {
    const box = (await content.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect
      .poll(async () => {
        await page.mouse.wheel(0, 2000);
        return content.evaluate(
          (node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 1,
        );
      })
      .toBe(true);
  }
  await expect(last).toBeInViewport({ ratio: 1 });
  await first.focus();
  await first.press("ArrowUp");
  await expect(last).toBeFocused();
  await expect(last).toBeInViewport({ ratio: 1 });
  await last.press("ArrowDown");
  await expect(first).toBeFocused();
  await expect(first).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await first.press("Escape");
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("InputOTP readOnly blocks transformed paste and preserves caller capture", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${origin}?surface=otp-paste`);
  for (const readOnly of [true, false]) {
    const field = page.getByRole("region", { name: readOnly ? "Read-only OTP" : "Editable OTP" });
    const input = field.getByRole("textbox", { name: "Verification code" });
    await expect(input).toHaveValue("1234");
    await expect(input).toHaveJSProperty("readOnly", readOnly);
    const slots = field.locator('[data-slot="input-otp-slot"]');
    await expect(slots).toHaveCount(4);
    for (const slot of await slots.all()) {
      await expect(slot).toHaveCSS("transition-property", "none");
    }
    expect(await field.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(
      1,
    );
    await input.focus();
    await input.evaluate((node: HTMLInputElement) => {
      node.setSelectionRange(0, node.value.length);
      const paste = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: new DataTransfer(),
      });
      paste.clipboardData!.setData("text/plain", "98-76");
      node.dispatchEvent(paste);
    });
    await expect(input).toHaveValue(readOnly ? "1234" : "9876");
    await expect(field.getByTestId("paste-changes")).toHaveText(readOnly ? "0" : "1");
    await expect(field.getByTestId("paste-captures")).toHaveText("1");
  }
});

test("Calendar preserves focus through controlled navigation and parent updates", async ({
  page,
}) => {
  await page.goto(`${origin}?surface=calendar-controlled`);
  const calendar = page.locator('[data-slot="calendar"]');
  await expect(calendar).toBeVisible();
  const rootElement = await calendar.elementHandle();
  const month = calendar.locator(".rdp-months_dropdown");
  const year = calendar.locator(".rdp-years_dropdown");

  await month.focus();
  await month.selectOption("1");
  await expect(month).toHaveValue("1");
  await expect(month).toBeFocused();

  await year.focus();
  await year.selectOption("2025");
  await expect(year).toHaveValue("2025");
  await expect(year).toBeFocused();

  await page.getByRole("button", { name: "Refresh calendar props" }).dispatchEvent("click");
  await expect(page.getByTestId("calendar-parent-updates")).toHaveText("1");
  await expect(year).toBeFocused();
  expect(await rootElement!.evaluate((element) => element.isConnected)).toBe(true);
});

for (const direction of ["ltr", "rtl"] as const)
  for (const navLayout of ["default", "around"] as const) {
    test(`Calendar inline layout preserves ${direction} ${navLayout} navigation and range edges`, async ({
      page,
    }) => {
      await page.goto(
        `${origin}?surface=calendar-direction&direction=${direction}&navLayout=${navLayout}`,
      );
      await expect(page.locator("body")).toHaveCSS("direction", "ltr");
      const calendar = page.locator('[data-slot="calendar"]');
      await expect(calendar).toHaveCSS("direction", direction);
      const previous = calendar.getByRole("button", {
        name: "Go to the Previous Month",
        exact: true,
      });
      const next = calendar.getByRole("button", { name: "Go to the Next Month", exact: true });
      const previousBox = (await previous.boundingBox())!;
      const nextBox = (await next.boundingBox())!;
      expect(direction === "rtl" ? previousBox.x > nextBox.x : previousBox.x < nextBox.x).toBe(
        true,
      );
      for (const [button, pointsRight] of [
        [previous, direction === "rtl"],
        [next, direction === "ltr"],
      ] as const) {
        const horizontalDirection = await button
          .locator("svg path")
          .evaluate((path: SVGPathElement) => {
            const transform = path.getScreenCTM()!;
            const endpoint = path.getPointAtLength(0).matrixTransform(transform);
            const tip = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(transform);
            return tip.x - endpoint.x;
          });
        expect(Math.abs(horizontalDirection)).toBeGreaterThan(0);
        expect(horizontalDirection > 0).toBe(pointsRight);
      }

      const radius = await calendar.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--cell-radius").trim(),
      );
      expect(Number.parseFloat(radius)).toBeGreaterThan(0);
      for (const [day, edge] of [
        ["05", "start"],
        ["06", "end"],
        ["07", "start"],
        ["10", "end"],
      ] as const) {
        const cell = calendar.locator(`td[data-day="2024-01-${day}"]`);
        const roundedSide = (edge === "start") === (direction === "ltr") ? "left" : "right";
        const squareSide = roundedSide === "left" ? "right" : "left";
        await expect(cell).toHaveCSS(`border-top-${roundedSide}-radius`, radius);
        await expect(cell).toHaveCSS(`border-top-${squareSide}-radius`, "0px");
      }
      for (const [day, side] of [
        ["05", direction === "rtl" ? "left" : "right"],
        ["10", direction === "rtl" ? "right" : "left"],
      ] as const) {
        const edge = await calendar
          .locator(`td[data-day="2024-01-${day}"]`)
          .evaluate(
            (element, property) => getComputedStyle(element, "::after").getPropertyValue(property),
            side,
          );
        expect(edge).toBe("0px");
      }

      await next.click();
      await expect(calendar.locator(".rdp-caption_label")).toHaveText("February 2024");
      await previous.click();
      await expect(calendar.locator(".rdp-caption_label")).toHaveText("January 2024");
      const start = calendar.locator('button[data-day="2024-01-05"]');
      await start.focus();
      await start.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
      await expect(calendar.locator('button[data-day="2024-01-06"]')).toBeFocused();
    });
  }

for (const direction of ["ltr", "rtl"] as const) {
  test(`Calendar inline layout keeps ${direction} after controls in visual tab order`, async ({
    page,
  }) => {
    await page.goto(
      `${origin}?surface=calendar-direction&direction=${direction}&navLayout=after&captionLayout=dropdown`,
    );
    const calendar = page.locator('[data-slot="calendar"]');
    const month = calendar.locator(".rdp-months_dropdown");
    const year = calendar.locator(".rdp-years_dropdown");
    const previous = calendar.getByRole("button", {
      name: "Go to the Previous Month",
      exact: true,
    });
    const next = calendar.getByRole("button", { name: "Go to the Next Month", exact: true });
    await expect(calendar.getByRole("status")).toHaveText("January 2024");
    const controls = await Promise.all(
      [month, year, previous, next].map((control) => control.boundingBox()),
    );
    for (let i = 1; i < controls.length; i++) {
      const before = controls[i - 1]!;
      const after = controls[i]!;
      expect(
        direction === "ltr" ? after.x - before.x - before.width : before.x - after.x - after.width,
      ).toBeGreaterThanOrEqual(-1);
      expect(
        Math.abs(before.y + before.height / 2 - after.y - after.height / 2),
      ).toBeLessThanOrEqual(3);
    }
    await month.focus();
    for (const control of [year, previous, next]) {
      await page.keyboard.press("Tab");
      await expect(control).toBeFocused();
    }
    await page.keyboard.press("Enter");
    await expect(calendar.getByRole("status")).toHaveText("February 2024");
    await previous.click();
    await expect(calendar.getByRole("status")).toHaveText("January 2024");
  });

  test(`Calendar inline layout anchors ${direction} around controls to their own month`, async ({
    page,
  }) => {
    await page.goto(
      `${origin}?surface=calendar-direction&direction=${direction}&navLayout=around&months=2`,
    );
    const calendar = page.locator('[data-slot="calendar"]');
    const previous = calendar.getByRole("button", {
      name: "Go to the Previous Month",
      exact: true,
    });
    const next = calendar.getByRole("button", { name: "Go to the Next Month", exact: true });
    const captions = calendar.locator(".rdp-month_caption");
    for (const [button, caption, inlineStart] of [
      [previous, captions.first(), true],
      [next, captions.last(), false],
    ] as const) {
      const buttonBox = (await button.boundingBox())!;
      const captionBox = (await caption.boundingBox())!;
      expect(
        Math.abs(buttonBox.y + buttonBox.height / 2 - captionBox.y - captionBox.height / 2),
      ).toBeLessThanOrEqual(3);
      const expectedLeft = inlineStart === (direction === "ltr");
      expect(
        Math.abs(
          expectedLeft
            ? buttonBox.x - captionBox.x
            : buttonBox.x + buttonBox.width - captionBox.x - captionBox.width,
        ),
      ).toBeLessThanOrEqual(1);
    }
    await next.click();
    await expect(calendar.getByRole("status")).toHaveText(["February 2024", "March 2024"]);
    await previous.click();
    await expect(calendar.getByRole("status")).toHaveText(["January 2024", "February 2024"]);
  });
}

test("Calendar uses the native locale pipeline and stable dates in its time zone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(`${origin}?surface=calendar-locale`);
  const wrapper = page.getByTestId("localized-calendar");
  const native = page.getByTestId("native-calendar");
  const nativeMonths = native.locator(".rdp-months_dropdown option");
  const wrapperMonths = wrapper.locator(".rdp-months_dropdown option");
  await expect(nativeMonths).toHaveCount(12);
  await expect(wrapperMonths).toHaveText(await nativeMonths.allTextContents());
  await expect(wrapperMonths.first()).toHaveText("ژانویه");
  const dates = await wrapper.locator("button[data-day]").evaluateAll((buttons) =>
    buttons.map((button) => ({
      button: button.getAttribute("data-day"),
      cell: button.closest("td")?.getAttribute("data-day"),
    })),
  );
  expect(dates.length).toBeGreaterThan(0);
  expect(
    dates.every(({ button, cell }) => button === cell && /^\d{4}-\d{2}-\d{2}$/.test(button!)),
  ).toBe(true);
  await expect(
    page.getByTestId("zoned-calendar").locator('button[data-selected-single="true"]'),
  ).toHaveAttribute("data-day", "2024-01-01");
});

test("Calendar hydrates across Korean and English hosts without locale-dependent markup", async ({
  browser,
}) => {
  const host = await browser.newContext({ locale: "ko-KR", timezoneId: "UTC" });
  const client = await browser.newContext({ locale: "en-US", timezoneId: "UTC" });
  try {
    const hostPage = await host.newPage();
    const clientPage = await client.newPage();
    const hydrationMessages: string[] = [];
    const pageErrors: string[] = [];
    clientPage.on("pageerror", (error) => pageErrors.push(error.message));
    clientPage.on("console", (message) => {
      if (
        ["warning", "error"].includes(message.type()) &&
        /hydration|hydrated|server rendered/i.test(message.text())
      ) {
        hydrationMessages.push(message.text());
      }
    });
    for (const caption of ["label", "dropdown"]) {
      await hostPage.goto(`${origin}?surface=calendar-ssr&caption=${caption}`);
      const markup = await hostPage.getByTestId("calendar-ssr-markup").textContent();
      expect(markup).toContain('data-day="2024-01-01"');
      const url = `${origin}?surface=calendar-hydrate&caption=${caption}`;
      await clientPage.route(url, async (route) => {
        const response = await route.fetch();
        const html = (await response.text()).replace(
          '<div id="root"></div>',
          `<div id="root">${markup}</div>`,
        );
        await route.fulfill({ response, body: html });
      });
      await clientPage.goto(url);
      await expect(clientPage.getByTestId("calendar-hydrated")).toHaveText("complete");
      await expect(clientPage.locator("html")).toHaveAttribute("data-hydration-errors", "[]");
      await expect(clientPage.locator('button[data-day="2024-01-01"]')).toHaveCount(1);
      await clientPage.unroute(url);
    }
    expect(pageErrors).toEqual([]);
    expect(hydrationMessages).toEqual([]);
  } finally {
    await client.close();
    await host.close();
  }
});

for (const width of [320, 844]) {
  test(`Sheet Side example keeps content and close controls reachable at ${width}×390`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 390 });
    await page.goto(`${origin}?surface=sheet`);
    for (const side of ["top", "right", "bottom", "left"]) {
      const trigger = page.getByRole("button", { name: `${side} sheet`, exact: true });
      await trigger.click();
      const popup = page.getByRole("dialog", { name: `${side} panel review` });
      await expect(popup).toBeVisible();
      await expect
        .poll(async () => {
          const box = await popup.boundingBox();
          return box !== null && box.y >= -1 && box.y + box.height <= 391;
        })
        .toBe(true);
      await expect(popup.getByRole("heading", { name: `${side} panel review` })).toBeInViewport({
        ratio: 1,
      });
      const close = popup.getByRole("button", { name: "Close panel", exact: true });
      await expect(close).toBeInViewport({ ratio: 1 });
      const body = popup.locator("div.overflow-y-auto");
      expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
        true,
      );
      const lastNote = body.locator("p").last();
      await lastNote.scrollIntoViewIfNeeded();
      await expect(lastNote).toBeInViewport({ ratio: 1 });
      await expect(close).toBeInViewport({ ratio: 1 });
      await close.click();
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });
}

for (const contextMenu of [false, true]) {
  test(`${contextMenu ? "ContextMenu" : "DropdownMenu"} reaches the first and last of 40 items by scrolling and keyboard`, async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize({ width: 320, height: 390 });
    await page.goto(`${origin}?surface=menu`);
    const name = contextMenu ? "Context option" : "Option";
    const trigger = contextMenu
      ? page.getByText("Open context options", { exact: true })
      : page.getByRole("button", { name: "Open options", exact: true });
    await trigger.click(contextMenu ? { button: "right" } : {});
    const popup = page.getByRole("menu");
    await expect(popup).toBeVisible();
    await expect
      .poll(async () => {
        const box = await popup.boundingBox();
        return box !== null && box.y >= -1 && box.y + box.height <= 391;
      })
      .toBe(true);
    expect(await popup.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
      true,
    );
    await expect(popup).toHaveCSS("overflow-y", "auto");
    const first = popup.getByRole("menuitem", { name: `${name} 1`, exact: true });
    const last = popup.getByRole("menuitem", { name: `${name} 40`, exact: true });
    if (isMobile) {
      // Mobile WebKit has no mouse-wheel input; exercise the native scroll container instead.
      await last.scrollIntoViewIfNeeded();
    } else {
      const box = (await popup.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect
        .poll(async () => {
          // Firefox limits one wheel gesture to part of the visible scroll area.
          await page.mouse.wheel(0, 2000);
          return popup.evaluate(
            (element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 1,
          );
        })
        .toBe(true);
    }
    await expect(last).toBeInViewport({ ratio: 1 });
    expect(await popup.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await first.focus();
    await first.press("End");
    await expect(last).toBeFocused();
    await expect(last).toBeInViewport({ ratio: 1 });
    await last.press("Home");
    await expect(first).toBeFocused();
    await expect(first).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await first.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
