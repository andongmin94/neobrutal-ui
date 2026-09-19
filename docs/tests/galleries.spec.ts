import { expect, test } from "@playwright/test";
import colors from "../src/data/colors";

const series = [
  { id: "examples", title: "Registry pulse", count: 3 },
  { id: "area-chart", title: "Release activity", count: 8 },
  { id: "bar-chart", title: "Catalog coverage", count: 9 },
  { id: "line-chart", title: "Build performance", count: 10 },
  { id: "pie-chart", title: "Registry composition", count: 8 },
  { id: "tooltip", title: "Install diagnostics", count: 9 },
];

for (const group of series) {
  test(`chart gallery and every source dialog: ${group.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/charts");
    await page
      .getByRole("navigation", { name: "Chart series" })
      .getByRole("button", { name: new RegExp(group.title) })
      .click();
    const section = page.locator(`section#${group.id}`);
    await expect(section.getByRole("heading", { name: group.title, exact: true })).toBeVisible();
    const sources = section.getByRole("button", { name: "View source", exact: true });
    await expect(sources).toHaveCount(group.count);
    for (let index = 0; index < group.count; index++) {
      const button = sources.nth(index);
      await button.scrollIntoViewIfNeeded();
      await expect(button.locator("..").locator(".recharts-surface").first()).toBeVisible();
      await button.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.locator("pre").first()).toContainText("import");
      const bounds = await dialog.boundingBox();
      expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      expect(bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width + 1,
    );
    expect(errors).toEqual([]);
  });
}

test("every palette has an isolated live preview", async ({ page }) => {
  await page.goto("/styling");
  const select = page.getByLabel("Palette", { exact: true });
  const preview = page.locator("[data-theme-preview]");
  const shell = await page
    .locator("html")
    .evaluate((node) => getComputedStyle(node).getPropertyValue("--main"));
  for (const color of colors) {
    await select.selectOption(color.name);
    await expect(select).toHaveValue(color.name);
    await expect(preview.locator(".theme-workbench__stage-label")).toContainText(color.name);
    expect(
      await page
        .locator("html")
        .evaluate((node) => getComputedStyle(node).getPropertyValue("--main")),
    ).toBe(shell);
  }
});

test("clipboard denial shows honest feedback without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied for regression test");
        },
      },
    });
  });
  await page.goto("/templates");
  const card = page.locator("main article article").first();
  await card.getByRole("button", { name: /Copy/ }).click();
  await expect(card.getByRole("button", { name: "Copy failed", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("CMS status filter is a flush segmented control", async ({ page }) => {
  await page.goto("/templates/cms");
  const group = page.getByRole("group", { name: "Filter posts by status" });
  const all = group.getByRole("button", { name: "All", exact: true });
  const draft = group.getByRole("button", { name: "Draft", exact: true });

  await expect(group).toBeVisible();
  await expect(group.getByRole("button")).toHaveCount(3);
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(draft).toHaveAttribute("aria-pressed", "false");

  const frame = await group.evaluate((node) => getComputedStyle(node).borderTopWidth);
  const selected = await all.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      borderBottom: style.borderBottomWidth,
      borderLeft: style.borderLeftWidth,
      borderRadius: style.borderRadius,
      borderTop: style.borderTopWidth,
    };
  });
  const inactiveBackground = await draft.evaluate((node) => getComputedStyle(node).backgroundColor);

  expect(frame).toBe("2px");
  expect(selected.borderTop).toBe("0px");
  expect(selected.borderBottom).toBe("0px");
  expect(selected.borderLeft).toBe("0px");
  expect(selected.borderRadius).toBe("0px");
  expect(selected.background).not.toBe(inactiveBackground);

  await draft.click();
  await expect(draft).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("July product update", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Organize your first team space", { exact: true })).toBeVisible();
  await expect(page.getByText("Public page checklist", { exact: true })).toBeVisible();
});

test("marquee pause and reduced motion stop both strips", async ({ page }) => {
  await page.goto("/docs/marquee");
  const preview = page.locator(".component-preview").first();
  const button = preview.getByRole("button", { name: "Pause animation", exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  for (const selector of [".animate-marquee", ".animate-marquee2"]) {
    await expect(preview.locator(selector)).toHaveCSS("animation-play-state", "paused");
  }
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(button).toBeHidden();
  await expect(preview.locator(".animate-marquee")).toHaveCSS("animation-name", "none");
  await expect(preview.locator(".animate-marquee2")).toBeHidden();
});

test("navigation and search can be dismissed with focus restored", async ({ page }) => {
  await page.goto("/");
  if (page.viewportSize()!.width < 1024) {
    const menu = page.locator(".mobile-menu-button");
    await menu.click();
    await expect(page.locator(".docs-sidebar.is-open")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".docs-sidebar.is-open")).toHaveCount(0);
    await expect(menu).toBeFocused();
  }
  const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
  await trigger.click();
  const input = page.getByRole("combobox", { name: "Search docs and components", exact: true });
  await expect(input).toBeVisible();
  await input.fill("button");
  await expect(page.locator(".search-dialog").getByRole("option").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("card preview does not claim an account operation occurred", async ({ page }) => {
  await page.goto("/docs/card");
  const preview = page.locator(".component-preview").first();
  await preview.getByRole("button", { name: "Forgot your password?", exact: true }).click();
  await expect(preview.getByRole("status")).toContainText("No email was sent");
  await preview.getByRole("button", { name: "Login with Google", exact: true }).click();
  await expect(preview.getByRole("status")).toContainText("No authentication was started");
});
