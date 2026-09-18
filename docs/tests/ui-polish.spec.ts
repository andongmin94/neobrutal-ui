import { expect, test, type Page } from "@playwright/test";

async function openReady(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator(".special-page-loading")).toHaveCount(0);
}

test("reference tables do not force horizontal scrolling on small screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of ["/docs/button", "/docs/design-tokens", "/docs/stars"]) {
    await openReady(page, route);
    const shells = page.locator(".md-table-shell");
    expect(await shells.count()).toBeGreaterThan(0);
    for (const shell of await shells.all()) {
      await shell.scrollIntoViewIfNeeded();
      const dimensions = await shell.evaluate((node) => ({
        available: node.clientWidth,
        content: node.scrollWidth,
      }));
      expect(dimensions.content, route).toBeLessThanOrEqual(dimensions.available + 1);
    }
  }
});

test("data table tools and pagination reflow without squeezing the search field", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openReady(page, "/docs/data-table");
  const preview = page.locator(".component-preview").first();
  const input = preview.getByRole("textbox", { name: "Filter email records" });
  const columns = preview.getByRole("button", { name: "Columns", exact: true });
  await expect(input).toBeVisible();
  const inputBox = (await input.boundingBox())!;
  const columnsBox = (await columns.boundingBox())!;
  expect(inputBox.width).toBeGreaterThan(200);
  expect(columnsBox.y - inputBox.y - inputBox.height).toBeGreaterThanOrEqual(11);
  const count = (await preview.getByText(/row\(s\) selected\./).boundingBox())!;
  const previous = (await preview
    .getByRole("button", { name: "Previous", exact: true })
    .boundingBox())!;
  const next = (await preview.getByRole("button", { name: "Next", exact: true }).boundingBox())!;
  expect(previous.y - count.y - count.height).toBeGreaterThanOrEqual(11);
  expect(Math.abs(previous.y - next.y)).toBeLessThanOrEqual(1);
  expect(next.x - previous.x - previous.width).toBeGreaterThanOrEqual(7);
  expect(next.x + next.width).toBeLessThanOrEqual(320);
});

test("CMS keeps a selected fill and a distinct keyboard focus", async ({ page }) => {
  await openReady(page, "/templates/cms");
  const group = page.getByRole("group", { name: "Filter posts by status" });
  const all = group.getByRole("button", { name: "All", exact: true });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  const selectedBackground = await all.evaluate((node) => getComputedStyle(node).backgroundColor);
  await all.hover();
  await all.evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
  await expect(all).toHaveCSS("background-color", selectedBackground);
  const selectedPost = page
    .getByRole("region", { name: "Posts", exact: true })
    .getByRole("button")
    .first();
  await page.keyboard.press("Tab");
  await selectedPost.focus();
  await expect(selectedPost).toBeFocused();
  await expect
    .poll(() => selectedPost.evaluate((node) => getComputedStyle(node).boxShadow))
    .toContain("inset");
  const publishSwitch = page.locator("#post-published");
  await expect(publishSwitch).toBeVisible();
  expect((await publishSwitch.boundingBox())!.height).toBeGreaterThanOrEqual(24);
});

test("blog search has one clear action and returns focus after clearing", async ({ page }) => {
  await openReady(page, "/templates/blog");
  const search = page.getByRole("searchbox", { name: "Search posts" });
  // A text input with search semantics cannot add a second native search-clear button.
  await expect(search).toHaveAttribute("type", "text");
  await expect(search).toHaveAttribute("enterkeyhint", "search");
  await search.fill("no-results-for-ui-regression");
  await expect(page.getByText("No posts found.", { exact: true })).toBeVisible();
  const clear = page.getByRole("button", { name: "Clear search", exact: true });
  await expect(clear).toHaveCount(1);
  await clear.click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(clear).toHaveCount(0);
  await expect(page.getByText("No posts found.", { exact: true })).toHaveCount(0);
});

test("template card actions align despite different description lengths", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await openReady(page, "/templates");
  const cards = page.locator("main article article");
  await expect(cards).toHaveCount(4);
  const first = cards.nth(0);
  const second = cards.nth(1);
  await first.locator("p").evaluate((node) => {
    node.textContent +=
      " Extra descriptive text verifies that a taller introduction does not shift this card's actions above its neighbor's actions.";
  });
  const firstCard = (await first.boundingBox())!;
  const secondCard = (await second.boundingBox())!;
  expect(Math.abs(firstCard.y - secondCard.y)).toBeLessThanOrEqual(1);
  const firstAction = (await first.getByRole("link", { name: "Open", exact: true }).boundingBox())!;
  const secondAction = (await second
    .getByRole("link", { name: "Open", exact: true })
    .boundingBox())!;
  expect(Math.abs(firstAction.y - secondAction.y)).toBeLessThanOrEqual(1);
});
