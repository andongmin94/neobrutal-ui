import { expect, test } from "@playwright/test";

test("table of contents preserves native navigation, focus, and modified clicks", async ({
  page,
  context,
  isMobile,
}) => {
  await page.goto("/docs/button");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const toc = page.locator(isMobile ? ".docs-toc-inline" : ".docs-toc");
  if (isMobile) await toc.locator("summary").click();
  const usage = toc.getByRole("link", { name: "Usage", exact: true });
  const backToTop = toc.getByRole("link", { name: "Back to top", exact: true });

  await usage.click();
  await expect(page).toHaveURL(/\/docs\/button#usage$/);
  const heading = page.locator("#usage");
  await expect(heading).toBeInViewport();
  await expect
    .poll(async () => {
      const section = await heading.boundingBox();
      const header = await page.locator(".site-header").boundingBox();
      return section !== null && header !== null && section.y >= header.y + header.height;
    })
    .toBe(true);

  await backToTop.press("Enter");
  await expect(page).toHaveURL(/\/docs\/button#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  const originalUrl = page.url();
  for (const [link, hash] of [
    [usage, "#usage"],
    [backToTop, "#main-content"],
  ] as const) {
    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      link.click({ modifiers: ["ControlOrMeta"] }),
    ]);
    try {
      await expect(popup).toHaveURL(new URL(hash, originalUrl).href);
      await expect(page).toHaveURL(originalUrl);
    } finally {
      await popup.close();
    }
  }
});

test("home has a working showcase, installation path, and URL-backed directory", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bold by design/ })).toBeVisible();
  await page.getByLabel("Workspace name", { exact: true }).fill("Docs review");
  await page.getByRole("button", { name: "Save workspace" }).click();
  await expect(page.locator(".home-showcase").getByRole("status")).toContainText(
    "Nothing was sent",
  );
  await expect(page.getByRole("link", { name: "Get started", exact: true })).toHaveAttribute(
    "href",
    "/docs/installation",
  );
  await page.getByRole("searchbox", { name: "Search component directory" }).fill("calendar");
  await expect(page).toHaveURL(/q=calendar/);
  const card = page
    .locator(".directory-card")
    .filter({ has: page.getByRole("heading", { name: "Calendar", exact: true }) });
  const cardBounds = await card.boundingBox();
  expect(cardBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await card.click();
  // The directory card already has a Calendar heading; it cannot confirm navigation.
  await expect(page).toHaveURL(/\/docs\/calendar\/?$/);
  await expect(
    page.locator(".docs-page-header").getByRole("heading", { name: "Calendar", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/\?q=calendar$/);
  await expect(page.getByRole("searchbox", { name: "Search component directory" })).toHaveValue(
    "calendar",
  );
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
});

test("markdown list and link styling does not leak into the breadcrumb preview", async ({
  page,
}) => {
  await page.goto("/docs/breadcrumb");
  const list = page
    .locator('[data-react-component="breadcrumb"] [data-slot="breadcrumb-list"]')
    .first();
  await expect(list).toBeVisible();
  const differences = await list.evaluate((node) => {
    const properties = [
      "marginTop",
      "marginBottom",
      "paddingLeft",
      "listStyleType",
      "fontWeight",
    ] as const;
    const before = getComputedStyle(node);
    const snapshot = Object.fromEntries(properties.map((key) => [key, before[key]]));
    const clone = node.cloneNode(true) as HTMLElement;
    document.body.append(clone);
    const outside = getComputedStyle(clone);
    const diff = properties.filter((key) => snapshot[key] !== outside[key]);
    clone.remove();
    return diff;
  });
  expect(differences).toEqual([]);
  expect(await list.evaluate((node) => getComputedStyle(node).listStyleType)).toBe("none");
});

test("button preview applies variants and stays compact", async ({ page }) => {
  await page.goto("/docs/button");
  const preview = page.locator(".component-preview").first();
  await expect(preview.locator('[data-slot="button"]').first()).toBeVisible();
  expect(
    await preview
      .getByRole("button", { name: "destructive", exact: true })
      .evaluate((node) => getComputedStyle(node).backgroundColor),
  ).not.toBe("rgba(0, 0, 0, 0)");
  expect(
    await preview
      .locator(".component-preview__canvas")
      .evaluate((node) => parseFloat(getComputedStyle(node).minHeight)),
  ).toBeLessThan(180);
});

test("preview tabs wrap keyboard navigation and keep separate examples independent", async ({
  page,
}) => {
  await page.goto("/docs/dialog");
  const primary = page.locator(".component-preview").first();
  const secondary = page.locator(".component-preview").nth(1);
  const preview = primary.getByRole("tab", { name: "Preview", exact: true });
  const code = primary.getByRole("tab", { name: "Code", exact: true });

  await expect(preview).toBeEnabled();
  await preview.press("ArrowLeft");
  await expect(code).toBeFocused();
  await expect(code).toHaveAttribute("aria-selected", "true");
  await expect(code).toHaveAttribute("tabindex", "0");
  await expect(preview).toHaveAttribute("tabindex", "-1");
  await expect(primary.getByRole("tabpanel", { name: "Code", exact: true })).toBeVisible();
  await expect(primary.getByRole("tabpanel", { name: "Preview", exact: true })).toBeHidden();

  await code.press("ArrowRight");
  await expect(preview).toBeFocused();
  await expect(preview).toHaveAttribute("aria-selected", "true");
  await preview.press("ArrowRight");
  await expect(code).toBeFocused();
  await code.press("ArrowLeft");
  await expect(preview).toBeFocused();
  await preview.press("End");
  await expect(code).toBeFocused();
  await code.press("Home");
  await expect(preview).toBeFocused();
  await preview.press("End");

  const secondPreview = secondary.getByRole("tab", { name: "Preview", exact: true });
  const secondCode = secondary.getByRole("tab", { name: "Code", exact: true });
  await expect(secondPreview).toHaveAttribute("aria-selected", "true");
  await secondPreview.press("ArrowLeft");
  await expect(secondCode).toBeFocused();
  await secondCode.press("ArrowRight");
  await expect(secondPreview).toBeFocused();
  await expect(secondPreview).toHaveAttribute("aria-selected", "true");
  await expect(code).toHaveAttribute("aria-selected", "true");
});

test("dialog supports Escape, focus return, and real local form submission", async ({ page }) => {
  await page.goto("/docs/dialog");
  const primary = page.locator(".component-preview").first();
  const trigger = primary.getByRole("button", { name: "Edit profile" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Docs tester");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(primary.getByRole("status")).toHaveText("Saved: Docs tester");
});

test("controlled select supports keyboard choice", async ({ page }) => {
  await page.goto("/docs/select");
  const primary = page.locator(".component-preview").first();
  const trigger = primary.getByRole("combobox");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(primary.getByRole("status")).toHaveText("Selected value: published");
});

test("command navigation owns its shortcuts before documentation handlers", async ({ page }) => {
  await page.goto("/docs/command");
  const trigger = page.getByRole("button", { name: "Open command menu", exact: true });
  await trigger.click();
  const command = page.getByRole("dialog", { name: "Command Palette", exact: true });
  const input = command.getByRole("combobox");
  const search = page.getByRole("dialog", { name: "Search documentation", exact: true });

  await expect(input).toBeFocused();
  await expect(command.locator('[data-slot="command-list"]')).toHaveCSS("scrollbar-width", "none");
  await expect(command.getByRole("option", { name: "Calendar", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await input.press("Control+j");
  await expect(command.getByRole("option", { name: "Search Emoji", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(command).toBeVisible();
  await input.press("Control+k");
  await expect(command.getByRole("option", { name: "Calendar", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(search).toBeHidden();
  await expect(input).toBeFocused();
  await input.dispatchEvent("keydown", {
    key: "j",
    ctrlKey: true,
    isComposing: true,
    bubbles: true,
  });
  await expect(command).toBeVisible();

  await input.press("Escape");
  await expect(command).toBeHidden();
  await trigger.press("Control+j");
  await expect(input).toBeFocused();
  await input.press("Escape");
  await expect(command).toBeHidden();
  await trigger.press("Control+k");
  await expect(search.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).toBeHidden();
});

test("customizer uses scoped tokens, full CSS export, and reversible defaults", async ({
  page,
}) => {
  await page.goto("/styling");
  await expect(page.getByLabel("Palette", { exact: true })).toHaveValue("mono");
  const shellBefore = await page
    .locator("html")
    .evaluate((node) => getComputedStyle(node).getPropertyValue("--main"));
  await page.getByLabel("Palette", { exact: true }).selectOption("red");
  const radius = page.getByRole("slider", { name: /Corner radius/ });
  await radius.press("Home");
  for (let i = 0; i < 12; i++) await radius.press("ArrowRight");
  await expect(page.locator("[data-theme-preview]")).toHaveCSS("--radius", "12px");
  expect(
    await page
      .locator("html")
      .evaluate((node) => getComputedStyle(node).getPropertyValue("--main")),
  ).toBe(shellBefore);
  await page.getByText("Customized CSS — light and dark included", { exact: true }).click();
  await expect(page.locator("[data-theme-css]")).toContainText("--radius: 12px;");
  await expect(page.locator("[data-theme-css]")).toContainText("--color-primary: var(--primary);");
  await expect(page.locator("[data-theme-css]")).toContainText("--color-sidebar: var(--sidebar);");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .locator(".theme-workbench__export details")
    .getByRole("button", { name: "Copy", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("--radius: 12px;");
  await page.getByRole("button", { name: "Reset defaults" }).click();
  await expect(page.getByLabel("Palette", { exact: true })).toHaveValue("mono");
  await expect(page.locator("[data-theme-preview]")).toHaveCSS("--radius", "5px");
});
