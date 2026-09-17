import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

async function expectHealthyLayout(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok(), `${route}: HTTP response`).toBe(true);
  await expect(page.locator("main").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const viewport = page.viewportSize()!;
  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    brokenLocalImages: [...document.images]
      .filter(
        (image) =>
          image.complete && image.naturalWidth === 0 && new URL(image.src).origin === location.origin,
      )
      .map((image) => image.getAttribute("src")),
  }));

  expect(layout.scrollWidth, `${route}: horizontal overflow`).toBeLessThanOrEqual(
    viewport.width + 1,
  );
  expect(layout.clientWidth, `${route}: document width`).toBeLessThanOrEqual(viewport.width + 1);
  expect(layout.brokenLocalImages, `${route}: broken local images`).toEqual([]);
}

test("representative routes render without runtime or layout failures", async ({ page }) => {
  const errors = collectRuntimeErrors(page);

  for (const route of representativeRoutes) await expectHealthyLayout(page, route);

  expect(errors).toEqual([]);
});

test("dialog focus management works outside Chromium", async ({ page }) => {
  await page.goto("/docs/dialog");
  const preview = page.locator(".component-preview").first();
  const trigger = preview.getByRole("button", { name: "Edit profile" });

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("select keyboard behavior works outside Chromium", async ({ page }) => {
  await page.goto("/docs/select");
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
  const installation = page.locator(".installation-tabs").first();
  const cli = installation.getByRole("tab", { name: "shadcn CLI", exact: true });
  const manual = installation.getByRole("tab", { name: "Manual", exact: true });

  await cli.focus();
  await page.keyboard.press("ArrowRight");
  await expect(manual).toBeFocused();
  await expect(manual).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(cli).toBeFocused();
  await expect(cli).toHaveAttribute("aria-selected", "true");
});

test("representative accessibility rules pass outside Chromium", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(
    results.violations.map(({ id, impact, help }) => ({ id, impact, help })),
  ).toEqual([]);
});
