import { expect, test, type Page } from "@playwright/test";

async function expectNavbar(page: Page) {
  const header = page.locator("[data-site-navbar]");
  await expect(header).toHaveCount(1);
  await expect(header).toBeVisible();
  await expect(header).toBeInViewport({ ratio: 1 });
  await expect(header).toHaveCSS("position", "sticky");
  const bounds = (await header.boundingBox())!;
  expect(Math.abs(bounds.y)).toBeLessThanOrEqual(1);
  expect(bounds.height).toBeGreaterThan(40);
  expect(bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  return header;
}

for (const slug of ["blog", "portfolio", "cms", "links"]) {
  test(`template navigation keeps the shared header: ${slug}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/templates");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await expect(page.locator("[data-template-preview]")).toHaveCount(4);
    await expectNavbar(page);
    if (slug === "blog") {
      await info.attach("template-gallery-header", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    }

    await page.locator(`.template-preview-link[href="/templates/${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/templates/${slug}$`));
    await expect(page.locator(`[data-template-preview="${slug}"]`)).toBeVisible();
    await expectNavbar(page);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await expect(page.locator(`[data-template-preview="${slug}"]`)).toBeVisible();
    await expectNavbar(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expectNavbar(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    const header = await expectNavbar(page);
    await info.attach(`template-${slug}-header`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    const search = header.getByRole("button", { name: "Search documentation", exact: true });
    await search.click();
    const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(search).toBeFocused();
    const menu = header.locator(".mobile-menu-button");
    if (await menu.isVisible()) {
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      const navigation = page.locator(".docs-sidebar--site.is-open");
      await expect(navigation).toBeVisible();
      await expect(navigation.locator(".docs-nav a").first()).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toBeFocused();
    } else {
      await expect(
        header.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", {
          name: "Templates",
          exact: true,
        }),
      ).toHaveAttribute("aria-current", "page");
    }

    if (slug === "blog") {
      const post = page.locator('#posts article a[href^="/templates/blog/"]').first();
      const postPath = await post.getAttribute("href");
      expect(postPath).toBeTruthy();
      await post.click();
      await expect.poll(() => new URL(page.url()).pathname).toBe(postPath);
      await expect(page.locator('[data-template-preview="blog"]')).toBeVisible();
      await expectNavbar(page);
      await info.attach("template-blog-post-header", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
      await page.goBack();
      await expect(page).toHaveURL(/\/templates\/blog$/);
      await expectNavbar(page);
    }

    await header.getByRole("link", { name: "neobrutal-ui home", exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/templates/${slug}$`));
    await expect(page.locator(`[data-template-preview="${slug}"]`)).toBeVisible();
    await expectNavbar(page);
    expect(errors).toEqual([]);
  });
}
