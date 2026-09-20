import { expect, test } from "@playwright/test";

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
