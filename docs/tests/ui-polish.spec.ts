import AxeBuilder from "@axe-core/playwright";
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

test("reference tables preserve short identifiers and type names", async ({ page }) => {
  await openReady(page, "/docs/stars");
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const text of ["strokeWidth", "pathClassName", "number"]) {
      const cell = page.getByRole("cell", { name: text, exact: true }).first();
      const lines = await cell.evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
      });
      expect(lines, `${text} at ${width}px`).toBe(1);
    }
  }
});

test("blog article lists show their bullet markers", async ({ page }) => {
  await openReady(page, "/templates/blog/small-interfaces");
  const list = page.locator("main article section ul").first();
  await expect(list).toBeVisible();
  await expect(list).toHaveCSS("list-style-type", "square");
});

test("image-card preview preserves the full screenshot at narrow and wide widths", async ({
  page,
}) => {
  await openReady(page, "/docs/image-card");
  const image = page.locator(".component-preview").first().getByRole("img", {
    name: "neobrutal-ui documentation preview",
  });
  await expect(image).toBeVisible();
  await image.evaluate((node) => (node as HTMLImageElement).decode());
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(image).toHaveCSS("aspect-ratio", "auto");
    const dimensions = await image.evaluate((node) => {
      const image = node as HTMLImageElement;
      const bounds = image.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      };
    });
    expect(dimensions.naturalWidth).toBeGreaterThan(0);
    expect(dimensions.naturalHeight).toBeGreaterThan(0);
    const expectedHeight =
      (dimensions.width * dimensions.naturalHeight) / dimensions.naturalWidth;
    expect(Math.abs(dimensions.height - expectedHeight), `${width}px`).toBeLessThanOrEqual(1);
  }
});

for (const overlay of [
  {
    name: "hover-card",
    route: "/docs/hover-card",
    role: "link",
    trigger: "Explore the component registry",
    surface: "[data-slot='hover-card-content']",
    action: "hover",
  },
  {
    name: "popover",
    route: "/docs/popover",
    role: "button",
    trigger: "View release status",
    surface: "[data-slot='popover-content']",
    action: "click",
  },
  {
    name: "context-menu",
    route: "/docs/context-menu",
    role: "button",
    trigger: "Open component card context menu",
    surface: "[data-slot='context-menu-content']",
    action: "right",
  },
] as const) {
  test(`open ${overlay.name} stays above document content with readable text`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openReady(page, overlay.route);
    const preview = page.locator(".component-preview").first();
    const trigger = preview.getByRole(overlay.role, {
      name: overlay.trigger,
      exact: true,
    });
    await expect(preview.locator(".component-preview__canvas")).toHaveCSS("isolation", "auto");
    if (overlay.action === "hover") await trigger.hover();
    else await trigger.click({ button: overlay.action === "right" ? "right" : "left" });
    const surface = page.locator(overlay.surface);
    await expect(surface).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include(overlay.surface)
      .withRules(["color-contrast"])
      .analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, nodes }))).toEqual([]);
    // Sample overlapping headings, including their top borders, rather than only popup centers.
    const obscuredHeadings = await surface.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return [...document.querySelectorAll("h2.md-heading")].flatMap((heading) => {
        const headingBounds = heading.getBoundingClientRect();
        const left = Math.max(bounds.left + 4, headingBounds.left, 0);
        const right = Math.min(bounds.right - 4, headingBounds.right, innerWidth);
        const top = Math.max(bounds.top + 4, headingBounds.top + 0.5, 0);
        const bottom = Math.min(bounds.bottom - 4, headingBounds.bottom, innerHeight);
        if (right <= left || bottom <= top) return [];
        const topmost = document.elementFromPoint((left + right) / 2, top);
        return node.contains(topmost) ? [] : [heading.textContent];
      });
    });
    expect(obscuredHeadings).toEqual([]);
  });
}
