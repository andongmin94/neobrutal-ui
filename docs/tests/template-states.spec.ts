import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import tailwindcss from "@tailwindcss/vite";
import { createServer, type ViteDevServer } from "vite";
import TEMPLATES from "../src/data/templates";
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

test.describe("template consumer data", () => {
  let server: ViteDevServer;
  let origin: string;
  let cacheDirectory: string | undefined;
  const root = fileURLToPath(new URL("..", import.meta.url));
  const cacheRoot = join(root, "test-results");

  test.beforeAll(async () => {
    await mkdir(cacheRoot, { recursive: true });
    cacheDirectory = await mkdtemp(join(cacheRoot, "template-data-vite-"));
    server = await createServer({
      configFile: false,
      root,
      cacheDir: cacheDirectory,
      resolve: { alias: { "@": join(root, "src") } },
      server: { host: "127.0.0.1", port: 0 },
      appType: "custom",
      plugins: [tailwindcss()],
      oxc: { jsx: { runtime: "automatic" } },
      optimizeDeps: { entries: ["tests/fixtures/template-data.tsx"] },
    });
    server.middlewares.use((request, response, next) => {
      if (request.url?.split("?")[0] !== "/") return next();
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Template consumer data</title></head><body><div id="root"></div><script type="module" src="/tests/fixtures/template-data.tsx"></script></body></html>',
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

  test("Blog filters supplied topics and updates when application posts change", async ({
    page,
  }) => {
    await page.goto(origin);
    const blog = page.getByRole("region", { name: "Consumer blog", exact: true });
    const filters = blog.getByRole("group", { name: "Filter posts by topic" });
    const articles = blog.getByRole("article");
    await expect(articles).toHaveCount(2);
    await expect(articles.first()).toContainText("Consumer research note");
    await filters.getByRole("button", { name: "All", exact: true }).click();
    await expect(articles).toHaveCount(1);
    await expect(articles).toContainText("Consumer all topic");
    await expect(filters.getByRole("button", { name: "All topics", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await filters.getByRole("button", { name: "All topics", exact: true }).click();
    await blog.getByRole("searchbox", { name: "Search posts" }).fill("research");
    await expect(articles).toHaveCount(1);
    await expect(articles).toContainText("Consumer research note");
    await blog.getByRole("button", { name: "Clear search", exact: true }).click();
    await blog.getByRole("combobox").selectOption("oldest");
    await expect(articles.first()).toContainText("Consumer all topic");
    await filters.getByRole("button", { name: "All", exact: true }).click();
    await page.getByRole("button", { name: "Load updated data", exact: true }).click();
    await expect(articles).toHaveCount(1);
    await expect(articles).toContainText("Updated application post");
    await expect(filters.getByRole("button", { name: "All", exact: true })).toHaveCount(0);
    await expect(filters.getByRole("button", { name: "Release", exact: true })).toBeVisible();
    await expect(
      blog.getByRole("link", { name: "Updated application post", exact: true }),
    ).toHaveAttribute("href", "/journal/updated-note");
    await page.getByRole("button", { name: "Clear data", exact: true }).click();
    await expect(articles).toHaveCount(0);
    await expect(blog.getByText("No posts found.", { exact: true })).toBeVisible();
  });

  test("Link Hub derives groups and copies the current profile email", async ({ page }) => {
    await page.addInitScript(() => {
      let copied = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            copied = text;
          },
          readText: async () => copied,
        },
      });
    });
    await page.goto(origin);
    const hub = page.getByRole("region", { name: "Consumer link hub", exact: true });
    const filters = hub.getByRole("group", { name: "Filter links" });
    await expect(hub.getByRole("heading", { name: "Mina Park", exact: true })).toBeVisible();
    await expect(hub.getByRole("listitem")).toHaveCount(2);
    await expect(filters.getByRole("button", { name: "Work", exact: true })).toHaveCount(0);
    await filters.getByRole("button", { name: "All", exact: true }).click();
    await expect(hub.getByRole("listitem")).toHaveCount(1);
    await expect(hub.getByRole("link", { name: /Consumer guide/ })).toHaveAttribute(
      "href",
      "/guide",
    );
    await hub.getByRole("button", { name: "Copy email", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe("mina+docs@example.org");
    await page.getByRole("button", { name: "Load updated data", exact: true }).click();
    await expect(hub.getByRole("heading", { name: "Jae Kim", exact: true })).toBeVisible();
    await expect(filters.getByRole("button", { name: "Research", exact: true })).toHaveCount(0);
    await expect(filters.getByRole("button", { name: "Community", exact: true })).toBeVisible();
    await expect(hub.getByRole("link", { name: /Community/ })).toHaveAttribute(
      "href",
      "/community",
    );
    await expect(hub.getByRole("region", { name: "Contact" }).getByRole("status")).toBeEmpty();
    await hub.getByRole("button", { name: "Copy email", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe("jae@example.org");
    await page.getByRole("button", { name: "Clear data", exact: true }).click();
    await expect(hub.getByRole("listitem")).toHaveCount(0);
    await expect(hub.getByRole("region", { name: "Contact" })).toHaveCount(0);
  });

  test("template details expose a keyboard-copyable install command outside the demo", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      let copied = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            copied = text;
          },
          readText: async () => copied,
        },
      });
    });
    for (const slug of ["blog", "links"] as const) {
      const template = TEMPLATES.find((entry) => entry.slug === slug)!;
      await openTemplate(page, slug);
      const installation = page.getByRole("region", {
        name: `Install ${template.title} template`,
        exact: true,
      });
      await expect(installation.locator("code")).toHaveText(template.installCommand);
      await expect(
        installation.getByRole("link", { name: "Set up the shared base once" }),
      ).toHaveAttribute("href", "/docs/installation");
      await expect(installation.locator("[data-template-preview]")).toHaveCount(0);
      const copy = installation.getByRole("button", { name: "Copy", exact: true });
      await copy.focus();
      await copy.press("Enter");
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(template.installCommand);
      await expect(installation.getByRole("button", { name: "Copied", exact: true })).toBeFocused();
    }
  });
});

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

test("dashboard task changes update summaries and filtered rows recover keyboard focus", async ({
  page,
}, info) => {
  await openTemplate(page, "dashboard");
  const search = page.getByRole("searchbox", { name: "Find a task" });
  const filters = page.getByRole("group", { name: "Filter tasks by status" });
  const openMetric = page
    .getByText("Open tasks", { exact: true })
    .locator("..")
    .locator("dd")
    .first();
  const completion = page
    .getByText("Completion", { exact: true })
    .locator("..")
    .locator("dd")
    .first();
  await expect(openMetric).toHaveText("4");
  await expect(completion).toHaveText("43%");
  await filters.getByRole("button", { name: "Open", exact: true }).click();
  const task = page.getByRole("checkbox", { name: "Build the core pages", exact: true });
  await task.focus();
  await task.press("Space");
  await expect(task).toHaveCount(0);
  await expect(search).toBeFocused();
  await expect(openMetric).toHaveText("3");
  await expect(completion).toHaveText("57%");
  await expect(page.getByRole("progressbar", { name: "Website refresh" })).toHaveAttribute(
    "aria-valuenow",
    "67",
  );
  await expect(filters.getByRole("button", { name: "Open", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await search.fill("no-matching-task-7319");
  await expect(page.getByRole("heading", { name: "No matching tasks" })).toBeVisible();
  const clear = page.getByRole("button", { name: "Clear filters", exact: true });
  await clear.focus();
  await clear.press("Enter");
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await expect(
    page.getByRole("checkbox", { name: "Build the core pages", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("region", { name: "Your work", exact: true }).getByRole("checkbox"),
  ).toHaveCount(7);
  await info.attach("dashboard-updated-tasks", {
    body: await page.getByRole("region", { name: "Your work", exact: true }).screenshot(),
    contentType: "image/png",
  });
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(search).toBeFocused();
  await expect(openMetric).toHaveText("4");
  await expect(completion).toHaveText("43%");
  await expect(
    page.getByRole("checkbox", { name: "Build the core pages", exact: true }),
  ).not.toBeChecked();
  await expectHealthyTemplate(page);
});

test("landing billing and plan selection show the actual billed amount without a checkout", async ({
  page,
}, info) => {
  await openTemplate(page, "landing");
  const pricing = page.locator("#pricing");
  const yearly = page.getByRole("switch", { name: "Yearly billing", exact: true });
  await expect(yearly).not.toBeChecked();
  await expect(pricing.getByText("$12 per person, billed monthly", { exact: true })).toBeVisible();
  await pricing.getByRole("button", { name: "Choose Team", exact: true }).click();
  const selectedTeam = pricing.getByRole("button", { name: "Team selected", exact: true });
  await expect(selectedTeam).toHaveAttribute("aria-pressed", "true");
  await yearly.focus();
  await yearly.press("Space");
  await expect(yearly).toBeChecked();
  await expect(pricing.getByText("$10", { exact: true })).toBeVisible();
  await expect(pricing.getByText("$120 per person, billed yearly", { exact: true })).toBeVisible();
  await expect(pricing.getByRole("status")).toContainText(
    "Team selected. $120 per person, billed yearly.",
  );
  await expect(pricing.getByRole("status")).toContainText(
    "does not create an account or charge you",
  );
  await expect(selectedTeam).toHaveAttribute("aria-pressed", "true");
  await info.attach("landing-yearly-selection", {
    body: await pricing.screenshot(),
    contentType: "image/png",
  });
  await pricing.getByRole("button", { name: "Choose Starter", exact: true }).click();
  await expect(
    pricing.getByRole("button", { name: "Starter selected", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(pricing.getByRole("button", { name: "Choose Team", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(pricing.getByRole("status")).toContainText("Free for up to 5 people");
  await expectHealthyTemplate(page);
});

test("landing navigation and FAQ remain usable by keyboard at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openTemplate(page, "landing");
  const pricingLink = page.getByRole("link", { name: "Find your plan", exact: true });
  await pricingLink.focus();
  await pricingLink.press("Enter");
  await expect(page).toHaveURL(/#pricing$/);
  const details = page.locator("#questions details").last();
  const summary = details.locator("summary");
  await summary.focus();
  await summary.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("p")).toContainText("does not create an account");
  await expect(summary).toBeFocused();
  await expectHealthyTemplate(page);
  await summary.press("Space");
  await expect(details).not.toHaveAttribute("open", "");
});
