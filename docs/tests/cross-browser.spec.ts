import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const representativeRoutes = [
  "/",
  "/docs/button",
  "/docs/installation",
  "/styling",
  "/charts",
  "/templates/blog",
];

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

  return errors;
}

async function expectHydrated(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
}

async function expectHealthyLayout(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok(), `${route}: HTTP response`).toBe(true);
  await expect(page.locator("main").first()).toBeVisible();
  await expectHydrated(page);
  await expect(page.locator(".special-page-loading")).toHaveCount(0);
  const preview = page.locator(".component-preview--primary [data-react-host]");
  for (const host of await preview.all()) {
    await host.scrollIntoViewIfNeeded();
    await expect(host).not.toHaveAttribute("aria-busy", "true");
    await expect(host.locator(".react-host__mount > *").first()).toBeAttached();
  }
  await expect(page.locator(".react-host__error")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);

  const viewport = page.viewportSize()!;
  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    brokenLocalImages: [...document.images]
      .filter(
        (image) =>
          image.complete &&
          image.naturalWidth === 0 &&
          new URL(image.src).origin === location.origin,
      )
      .map((image) => image.getAttribute("src")),
  }));

  expect(layout.scrollWidth, `${route}: horizontal overflow`).toBeLessThanOrEqual(
    viewport.width + 1,
  );
  expect(layout.clientWidth, `${route}: document width`).toBeLessThanOrEqual(viewport.width + 1);
  expect(layout.brokenLocalImages, `${route}: broken local images`).toEqual([]);
}

// These are independent document checks, not a client-side navigation journey.
// Each route owns a page so an outgoing preview load cannot restart its old URL
// during the next hard navigation in Firefox.
for (const route of representativeRoutes) {
  test(`representative route loads: ${route}`, async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await expectHealthyLayout(page, route);
    expect(errors).toEqual([]);
  });
}

test("dialog initial focus and focus return work across browser engines", async ({ page }) => {
  await page.goto("/docs/dialog");
  await expectHydrated(page);
  const preview = page.locator(".component-preview").first();
  const trigger = preview.getByRole("button", { name: "Edit profile" });

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Name", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("select keyboard behavior works across browser engines", async ({ page }) => {
  await page.goto("/docs/select");
  await expectHydrated(page);
  const preview = page.locator(".component-preview").first();
  const trigger = preview.getByRole("combobox");

  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(preview.getByRole("status")).toHaveText("Selected value: published");
});

test("installation tabs support roving keyboard focus", async ({ page }) => {
  await page.goto("/docs/button");
  await expectHydrated(page);
  const installation = page.locator(".installation-tabs").first();
  const cli = installation.getByRole("tab", { name: "shadcn CLI", exact: true });
  const manual = installation.getByRole("tab", { name: "Manual", exact: true });

  await manual.click();
  await expect(manual).toHaveAttribute("aria-selected", "true");
  await cli.click();
  await expect(cli).toHaveAttribute("aria-selected", "true");

  await cli.press("ArrowRight");
  await expect(manual).toBeFocused();
  await expect(manual).toHaveAttribute("aria-selected", "true");
  await manual.press("ArrowLeft");
  await expect(cli).toBeFocused();
  await expect(cli).toHaveAttribute("aria-selected", "true");
});

test("WCAG text spacing does not create page overflow", async ({ page }) => {
  await page.goto("/docs/installation");
  await expectHydrated(page);
  await page.addStyleTag({
    content: `
      * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
      p { margin-bottom: 2em !important; }
    `,
  });
  await expect(page.getByRole("heading", { name: "Requirements" })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize()!;
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
  await expect(
    page.locator("pre").filter({ hasText: "npx shadcn@latest init" }).first(),
  ).toBeVisible();
});

test("representative accessibility rules pass across browser engines", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main").first()).toBeVisible();
  await expectHydrated(page);
  await page.evaluate(() => document.fonts.ready);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations.map(({ id, impact, help }) => ({ id, impact, help }))).toEqual([]);
});
