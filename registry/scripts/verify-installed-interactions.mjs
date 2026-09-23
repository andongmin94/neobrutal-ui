import path from "node:path";

export async function verifyInstalledInteractions({
  page,
  expect,
  reportDirectory,
  engine,
  theme,
}) {
  const viewport = page.viewportSize();
  const preview = page.getByRole("region", { name: "Installed interactions", exact: true });
  const navigation = preview.getByRole("navigation", { name: "Installed navigation" });
  const start = navigation.getByRole("button", { name: "Start", exact: true });
  const reference = navigation.getByRole("button", { name: "Reference", exact: true });
  const first = page.getByRole("link", { name: "First destination", exact: true });
  const second = page.getByRole("link", { name: "Second destination", exact: true });
  const capture = async (locator, state) => {
    if (engine !== "chromium") return;
    const size = page.viewportSize();
    await locator.screenshot({
      path: path.join(
        reportDirectory,
        `${engine}-${size.width}x${size.height}-${theme}-${state}.png`,
      ),
    });
  };

  // Pointer focus stays quiet. Keyboard focus must survive the installed CSS,
  // including the popup content's ancestor selectors and the selected palette.
  await start.click();
  await expect(start).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Escape");
  await preview.getByRole("button", { name: "Before navigation" }).click();
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await expectKeyboardFocus(start, expect);
  await start.press("ArrowRight");
  await expectKeyboardFocus(reference, expect);
  await reference.press("ArrowLeft");
  await expectKeyboardFocus(start, expect);
  await capture(start, "navigation-trigger-focus");
  await start.press("ArrowDown");
  await expectKeyboardFocus(first, expect);
  await first.press("Tab");
  await expectKeyboardFocus(second, expect);
  await capture(page.locator('[data-slot="navigation-menu-popup"]'), "navigation-link-focus");
  await second.press("Escape");
  await expect(first).toBeHidden();
  await expect(start).toBeFocused();

  const panelTrigger = preview.getByRole("button", { name: "Open panel", exact: true });
  await panelTrigger.click();
  const panel = page.getByRole("dialog", { name: "Installed panel", exact: true });
  await expect(panel).toBeVisible();
  const options = panel.getByRole("button", { name: "Panel options", exact: true });
  await options.click();
  const popup = page.getByRole("dialog", { name: "Panel options", exact: true });
  await popup.getByRole("button", { name: "Choose option", exact: true }).click();
  await expect(popup.getByRole("button", { name: "Option selected" })).toBeVisible();
  await capture(popup, "nested-popover");
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(options).toBeFocused();
  await capture(panel, "sheet-open");
  await page.mouse.click(8, 8);
  await expect(panel).toBeHidden();
  await expect(panelTrigger).toBeFocused();

  try {
    await page.setViewportSize({ width: viewport.width < 700 ? 320 : 844, height: 390 });
    const dialogTrigger = preview.getByRole("button", { name: "Long dialog", exact: true });
    await dialogTrigger.click();
    const dialog = page.getByRole("dialog", { name: "Installed long dialog", exact: true });
    const firstAction = dialog.getByRole("button", { name: "Start of review", exact: true });
    const finish = dialog.getByRole("button", { name: "Finish review", exact: true });
    await expect(dialog).toBeVisible();
    await expect(firstAction).toBeFocused();
    await expect(dialog).toHaveCSS("overflow-y", "auto");
    await expect
      .poll(() => dialog.evaluate((node) => node.scrollHeight > node.clientHeight))
      .toBe(true);
    await expectInsideViewport(dialog, page, expect);
    await capture(dialog, "dialog-start");
    await firstAction.press("Tab");
    await expect(finish).toBeFocused();
    await expect(finish).toBeInViewport({ ratio: 1 });
    await capture(dialog, "dialog-end");
    await finish.click();
    await expect(dialog).toBeHidden();
    await expect(dialogTrigger).toBeFocused();
    await dialogTrigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(dialogTrigger).toBeFocused();
  } finally {
    await page.setViewportSize(viewport);
  }
}

async function expectKeyboardFocus(locator, expect) {
  await expect(locator).toBeFocused();
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-offset", "-4px");
  await expect
    .poll(() =>
      locator.evaluate((node) => {
        const style = getComputedStyle(node);
        return style.outlineColor === style.color;
      }),
    )
    .toBe(true);
}

async function expectInsideViewport(locator, page, expect) {
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      const viewport = page.viewportSize();
      return (
        box !== null &&
        box.x >= 15 &&
        box.y >= 15 &&
        box.x + box.width <= viewport.width - 15 &&
        box.y + box.height <= viewport.height - 15
      );
    })
    .toBe(true);
}
