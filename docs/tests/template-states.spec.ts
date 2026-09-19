import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import type { TemplateEntry } from "../src/data/templates";

async function openTemplate(page: Page, name: TemplateEntry["slug"]) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.goto(`/templates/${name}`);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator(".special-page-loading")).toHaveCount(0);
  await expect(page.locator(".special-content")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function expectHealthyTemplate(page: Page) {
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  const result = await new AxeBuilder({ page })
    .include(".special-content")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, nodes }))).toEqual([]);
}

test("CMS editing a searched title keeps the same editor and input focus", async ({ page }) => {
  await openTemplate(page, "cms");
  await page.getByRole("searchbox", { name: "Search posts" }).fill("July product update");
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("A revised release");
  await expect(title).toHaveValue("A revised release");
  await expect(title).toBeFocused();
  await expect(page.locator(".special-content").getByRole("status")).toContainText(
    "Your edits are still here",
  );
  await page.getByRole("textbox", { name: "Summary", exact: true }).fill("The edited summary");
  const save = page.getByRole("button", { name: "Save", exact: true });
  await save.click();
  await expect(save).toBeDisabled();
  await expect(title).toHaveValue("A revised release");
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Search posts" })).toHaveValue("");
  await expect(
    page
      .getByRole("region", { name: "Posts", exact: true })
      .getByRole("button", { name: /A revised release/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expectHealthyTemplate(page);
});

test("CMS editing publication status does not switch to the next filtered post", async ({
  page,
}) => {
  await openTemplate(page, "cms");
  await page
    .getByRole("group", { name: "Filter posts by status" })
    .getByRole("button", { name: "Draft", exact: true })
    .click();
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  await expect(title).toHaveValue("Organize your first team space");
  const published = page.getByRole("switch", { name: "Published", exact: true });
  await published.click();
  await expect(title).toHaveValue("Organize your first team space");
  await expect(published).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  const posts = page.getByRole("region", { name: "Posts", exact: true });
  await expect(
    posts.getByRole("button", { name: /Organize your first team space/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(posts.getByRole("button", { name: /Public page checklist/ })).toContainText("Draft");
  await expectHealthyTemplate(page);
});

test("CMS empty filters recover to a post or a focused new draft", async ({ page }) => {
  await openTemplate(page, "cms");
  const search = page.getByRole("searchbox", { name: "Search posts" });
  await search.fill("no-such-post-7319");
  await expect(page.getByRole("heading", { name: "No post selected" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Title", exact: true })).toHaveValue(
    "July product update",
  );
  await search.fill("no-such-post-7319");
  await page
    .getByRole("region", { name: "No post selected" })
    .getByRole("button", { name: "New post", exact: true })
    .click();
  await expect(search).toHaveValue("");
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  await expect(title).toHaveValue("Untitled post");
  await expect(title).toBeFocused();
  await expectHealthyTemplate(page);
});

test("blog empty results keep a usable search and keyboard recovery", async ({ page }) => {
  await openTemplate(page, "blog");
  const search = page.getByRole("searchbox", { name: "Search posts" });
  await search.fill("no-such-post-7319");
  await expect(page.getByText("No posts found.", { exact: true })).toBeVisible();
  await expect(search).toBeFocused();
  await search.press("Tab");
  const clear = page.getByRole("button", { name: "Clear search", exact: true });
  await expect(clear).toBeFocused();
  await clear.press("Enter");
  await expect(search).toBeFocused();
  await expect(page.locator(".special-content article").first()).toBeVisible();
  await expectHealthyTemplate(page);
});

test("portfolio details open and close by keyboard without losing their trigger", async ({
  page,
}) => {
  await openTemplate(page, "portfolio");
  const details = page.locator(".special-content details").first();
  const summary = details.locator("summary");
  await summary.focus();
  await summary.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("p")).toBeVisible();
  await expect(summary).toBeFocused();
  await expectHealthyTemplate(page);
  await summary.press("Space");
  await expect(details).not.toHaveAttribute("open", "");
  await expect(details.locator("p")).toBeHidden();
  await expect(summary).toBeFocused();
});

test("link hub keeps raised links readable and contained at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openTemplate(page, "links");
  const links = page.locator(".special-content main ul a");
  await expect(links).toHaveCount(6);
  for (const link of await links.all()) {
    const bounds = await link.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    await expect(link).not.toHaveCSS("box-shadow", "none");
  }
  if (await page.evaluate(() => matchMedia("(hover: hover)").matches)) {
    const first = links.first();
    const resting = await first.evaluate((node) => getComputedStyle(node).boxShadow);
    await first.hover();
    await expect(first).not.toHaveCSS("box-shadow", resting);
    const hovering = await first.evaluate((node) => getComputedStyle(node).boxShadow);
    await page.mouse.down();
    try {
      await expect(first).not.toHaveCSS("box-shadow", hovering);
    } finally {
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }
  }
  await expectHealthyTemplate(page);
});
