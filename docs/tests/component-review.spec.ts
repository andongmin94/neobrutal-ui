import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

async function readyCanvas(preview: Locator) {
  const canvas = preview.locator(".component-preview__canvas");
  const host = canvas.locator("[data-react-host]");
  await host.scrollIntoViewIfNeeded();
  await expect(host).not.toHaveAttribute("aria-busy", "true");
  await expect(host.locator(".react-host__mount > *").first()).toBeAttached();
  return canvas;
}

async function openCanvas(page: Page, component: string) {
  await page.goto(`/docs/${component}`);
  await page.evaluate(() => document.fonts.ready);
  return readyCanvas(page.locator(`.component-preview[data-component="${component}"]`).first());
}

async function capture(surface: Locator, name: string, info: TestInfo) {
  await expect(surface).toBeVisible();
  await info.attach(name, {
    body: await surface.screenshot({
      animations: "disabled",
      // Hide only the surrounding docs chrome while taking scoped evidence.
      style: ".site-header, .site-header * { visibility: hidden !important; }",
    }),
    contentType: "image/png",
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("alert messages wrap and their inline undo action remains usable", async ({ page }, info) => {
  await page.goto("/docs/alert");
  const previews = page.locator('.component-preview[data-component="alert"]');
  for (let index = 0; index < (await previews.count()); index++) {
    const canvas = await readyCanvas(previews.nth(index));
    const text = canvas.locator('[data-slot="alert-title"], [data-slot="alert-description"]');
    for (const part of await text.all()) {
      await expect(part).toHaveCSS("-webkit-line-clamp", "none");
      const fits = await part.evaluate(
        (node) =>
          node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1,
      );
      expect(fits, `alert example ${index + 1}: message must not be clipped`).toBe(true);
    }
  }
  const canvas = await readyCanvas(previews.last());
  const undo = canvas.getByRole("button", { name: "Undo", exact: true });
  const title = canvas.locator('[data-slot="alert-title"] > span');
  const textBox = (await title.boundingBox())!;
  const actionBox = (await undo.boundingBox())!;
  expect(textBox.x + textBox.width).toBeLessThanOrEqual(actionBox.x);
  await capture(canvas, "alert-action-before", info);
  await undo.click();
  await expect(title).toHaveText("The selected emails have been restored to the inbox.");
  await expect(canvas.getByRole("button", { name: "Undone", exact: true })).toBeDisabled();
  await capture(canvas, "alert-action-undone", info);
});

test("radio indicators inherit the selected card foreground", async ({ page }, info) => {
  const canvas = await openCanvas(page, "radio-group");
  const selected = canvas.getByRole("radio", { checked: true });
  for (const state of ["initial", "changed"]) {
    if (state === "changed") {
      await canvas.getByRole("radio").first().click();
      await expect(canvas.getByRole("radio").first()).toBeChecked();
    }
    const expected = await selected.locator("..").evaluate((node) => getComputedStyle(node).color);
    const dot = selected.locator('[data-slot="radio-group-indicator"] > span');
    await expect(selected).toHaveCSS("border-top-color", expected);
    await expect(dot).toHaveCSS("background-color", expected);
    await expect(dot).toBeVisible();
    await capture(canvas, `radio-${state}`, info);
  }
});

test("table totals follow data and selected rows remain readable", async ({ page }, info) => {
  const canvas = await openCanvas(page, "table");
  const amounts = await canvas.locator("tbody tr td:last-child").allTextContents();
  const total = amounts.reduce((sum, amount) => sum + Number(amount.replace(/[$,]/g, "")), 0);
  expect(total).toBe(2250);
  await expect(canvas.locator("tfoot tr td:last-child")).toHaveText(
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total),
  );
  const row = canvas.locator("tbody tr").first();
  // Exercise TableRow's public styling state, independently of DataTable's overrides.
  await row.evaluate((node) => node.setAttribute("data-state", "selected"));
  const caption = canvas.locator("caption");
  const foreground = await caption.evaluate((node) => getComputedStyle(node).color);
  await expect(row).toHaveCSS("color", foreground);
  for (const cell of await row.locator("td").all()) {
    await expect(cell).toHaveCSS("color", foreground);
  }
  await capture(canvas, "table-selected-row", info);
  await canvas.locator('[data-slot="table-container"]').evaluate((node) => {
    node.scrollLeft = node.scrollWidth;
  });
  await capture(canvas, "table-amounts-and-total", info);
});

for (const component of ["checkbox", "switch"]) {
  test(`${component}: changed selection remains visible`, async ({ page }, info) => {
    const canvas = await openCanvas(page, component);
    const control = canvas.locator(`[role="${component}"]:not([disabled])`).first();
    const checked = await control.isChecked();
    await control.click();
    await expect(control).toBeChecked({ checked: !checked });
    await capture(canvas, `${component}-changed`, info);
    await control.click();
    await expect(control).toBeChecked({ checked });
  });
}

test("breadcrumb overflow menu exposes its intermediate pages", async ({ page }, info) => {
  const canvas = await openCanvas(page, "breadcrumb");
  const trigger = canvas.getByRole("button", { name: "Show intermediate pages" });
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem")).toHaveCount(3);
  await capture(menu, "breadcrumb-intermediate-pages", info);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("scroll area reveals the last published activity", async ({ page }, info) => {
  const canvas = await openCanvas(page, "scroll-area");
  const viewport = canvas.locator('[data-slot="scroll-area-viewport"]');
  // Lazy mounting changes the host height after the initial page scroll.
  await viewport.scrollIntoViewIfNeeded();
  await expect(viewport).toBeInViewport({ ratio: 1 });
  await viewport.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect
    .poll(() => viewport.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop))
    .toBeLessThanOrEqual(1);
  await expect(viewport.getByText("Next.js App Router pages generated")).toBeInViewport({
    ratio: 1,
  });
  await capture(canvas, "scroll-area-last-activity", info);
});

test("sidebar collapsed, mobile, disclosure and menu states work", async ({ page }, info) => {
  const canvas = await openCanvas(page, "sidebar");
  const toggle = canvas.locator('button[data-sidebar="trigger"]');
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toHaveAccessibleName("Toggle Sidebar");
  const mobile = Boolean(info.project.use.isMobile);
  const sidebar = mobile
    ? page.locator('[data-slot="sidebar"][data-mobile="true"]')
    : canvas.locator('[data-slot="sidebar"]').first();
  await toggle.click();
  if (mobile) {
    await expect(sidebar).toBeVisible();
    await capture(sidebar, "sidebar-mobile-open", info);
  } else {
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await capture(canvas, "sidebar-collapsed", info);
    await toggle.click();
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
  }
  const team = sidebar.getByRole("button", { name: /Northstar Studio/ });
  await team.click();
  let menu = page.getByRole("menu");
  await capture(menu, "sidebar-teams", info);
  await menu.getByRole("menuitem", { name: /Draft Lab/ }).click();
  await expect(menu).toBeHidden();
  await expect(sidebar.getByRole("button", { name: /Draft Lab/ })).toBeVisible();
  await sidebar.getByRole("button", { name: "Models", exact: true }).click();
  await expect(sidebar.getByRole("link", { name: "Genesis", exact: true })).toBeVisible();
  await capture(sidebar, "sidebar-models-and-team-selection", info);
  const project = sidebar.locator('[data-sidebar="menu-item"]').filter({
    has: page.getByRole("link", { name: "Design Engineering", exact: true }),
  });
  const projectAction = project.getByRole("button", { name: "More", exact: true });
  await expect(projectAction).toHaveCount(1);
  await projectAction.click();
  menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem")).toHaveText([
    "View Project",
    "Share Project",
    "Delete Project",
  ]);
  await capture(menu, "sidebar-project-actions", info);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(projectAction).toBeFocused();
  await sidebar.getByRole("button", { name: /hello@example.com/ }).click();
  await capture(menu, "sidebar-account-actions", info);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  if (mobile) {
    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
    await expect(toggle).toBeFocused();
  }
});

test("dropdown nested menu exposes all published themes", async ({ page }, info) => {
  const canvas = await openCanvas(page, "dropdown-menu");
  await canvas.getByRole("button", { name: "Registry actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Apply theme", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Yellow", exact: true })).toBeVisible();
  await capture(page.getByRole("menu").last(), "dropdown-theme-submenu", info);
});

test("menubar selections survive closing and reopening their menus", async ({ page }, info) => {
  const canvas = await openCanvas(page, "menubar");
  const view = canvas.getByText("View", { exact: true });
  await view.click();
  const previews = page.getByRole("menuitemcheckbox", { name: "Show component previews" });
  await expect(previews).toHaveAttribute("aria-checked", "true");
  await previews.click();
  await expect(page.getByRole("menu")).toBeHidden();
  await view.click();
  await expect(previews).toHaveAttribute("aria-checked", "false");
  await capture(page.getByRole("menu"), "menubar-checkbox-changed", info);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  const environment = canvas.getByText("Environment", { exact: true });
  await environment.click();
  await page.getByRole("menuitemradio", { name: "Local", exact: true }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  await environment.click();
  await expect(page.getByRole("menuitemradio", { name: "Local", exact: true })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await capture(page.getByRole("menu"), "menubar-radio-changed", info);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await canvas.getByText("Project", { exact: true }).click();
  await page.getByRole("menuitem", { name: "Export", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Theme CSS", exact: true })).toBeVisible();
  await capture(page.getByRole("menu").last(), "menubar-export-submenu", info);
});

test("context menu selections survive closing and reopening", async ({ page }, info) => {
  const canvas = await openCanvas(page, "context-menu");
  const trigger = canvas.getByRole("button", { name: "Open component card context menu" });
  async function openMenu() {
    await trigger.focus();
    await page.keyboard.press("Shift+F10");
    await expect(page.getByRole("menu")).toBeVisible();
  }
  await openMenu();
  const pin = page.getByRole("menuitemcheckbox", { name: "Pin to workspace" });
  await expect(pin).toHaveAttribute("aria-checked", "true");
  await pin.click();
  await expect(page.getByRole("menu")).toBeHidden();
  await openMenu();
  await expect(pin).toHaveAttribute("aria-checked", "false");
  await capture(page.getByRole("menu"), "context-menu-unpinned", info);
  await page.getByRole("menuitemradio", { name: "Private", exact: true }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  await openMenu();
  await expect(page.getByRole("menuitemradio", { name: "Private", exact: true })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await capture(page.getByRole("menu"), "context-menu-private", info);
  await page.getByRole("menuitem", { name: "Move to collection", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Forms", exact: true })).toBeVisible();
  await capture(page.getByRole("menu").last(), "context-collection-submenu", info);
});
