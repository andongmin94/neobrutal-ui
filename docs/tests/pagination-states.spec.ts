import { expect, test } from "@playwright/test";

test("pagination wraps in narrow containers and mirrors directional icons", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/pagination");
  const navigation = page
    .locator('.component-preview[data-component="pagination"]')
    .first()
    .locator('[data-slot="pagination"]');
  await expect(navigation.locator('[aria-current="page"]')).toHaveText("2");
  await navigation.evaluate((element) => {
    element.style.maxWidth = "220px";
    element.dir = "rtl";
  });
  const list = navigation.locator('[data-slot="pagination-content"]');
  await expect(list).toHaveCSS("flex-wrap", "wrap");
  expect(
    await list.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  for (const part of ["previous", "next"]) {
    const link = navigation.locator(`[data-slot="pagination-${part}"]`);
    await expect(link.locator("svg")).toHaveCSS("rotate", "180deg");
    await expect(link).toHaveCSS("transition-duration", "0s");
  }
});

test("pagination restores linked pages and preserves modified-click navigation", async ({
  page,
  context,
}) => {
  await page.goto("/docs/pagination?page=7");
  const canvas = page
    .locator('.component-preview[data-component="pagination"]')
    .first()
    .locator(".component-preview__canvas");
  const current = canvas.locator('a[aria-current="page"]');
  await expect(current).toHaveText("7");
  await expect(canvas.locator('[data-slot="pagination-next"]')).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await canvas.locator('[data-slot="pagination-previous"]').click();
  await expect(current).toHaveText("6");
  await expect(page).toHaveURL(/\/docs\/pagination\?page=6$/);
  await page.reload();
  await expect(current).toHaveText("6");

  const originalUrl = page.url();
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    canvas.getByRole("link", { name: "Go to page 1", exact: true }).click({
      modifiers: ["ControlOrMeta"],
    }),
  ]);
  try {
    await expect(popup).toHaveURL(/\/docs\/pagination\?page=1$/);
    await expect(
      popup
        .locator('.component-preview[data-component="pagination"] a[aria-current="page"]')
        .first(),
    ).toHaveText("1");
    await expect(page).toHaveURL(originalUrl);
    await expect(current).toHaveText("6");
  } finally {
    await popup.close();
  }
});

test("pagination current and unavailable states stay distinct", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/pagination");
  const preview = page.locator('.component-preview[data-component="pagination"]').first();
  const canvas = preview.locator(".component-preview__canvas");
  const current = canvas.locator('a[aria-current="page"]');
  const previous = canvas.locator('[data-slot="pagination-previous"]');
  const next = canvas.locator('[data-slot="pagination-next"]');
  await expect(current).toHaveText("2");

  for (const value of [2, 1, 7]) {
    if (value !== 2) {
      await canvas.getByRole("link", { name: `Go to page ${value}`, exact: true }).click();
    }
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(String(value));
    await expect(current).toHaveCSS("text-decoration-line", "underline");
    await expect(current).toHaveCSS("text-decoration-thickness", "2px");
    await expect(previous).toHaveAttribute("aria-disabled", String(value === 1));
    await expect(next).toHaveAttribute("aria-disabled", String(value === 7));
    await expect(previous).toHaveCSS("opacity", value === 1 ? "0.5" : "1");
    await expect(next).toHaveCSS("opacity", value === 7 ? "0.5" : "1");
    const unavailable = value === 1 ? previous : value === 7 ? next : null;
    if (unavailable) {
      await expect(unavailable).not.toHaveAttribute("href");
      const historyCalls = await unavailable.evaluate((element) => {
        const replaceState = window.history.replaceState;
        let calls = 0;
        window.history.replaceState = function (...args: Parameters<History["replaceState"]>) {
          calls += 1;
          return replaceState.apply(this, args);
        };
        try {
          (element as HTMLElement).click();
          return calls;
        } finally {
          window.history.replaceState = replaceState;
        }
      });
      expect(historyCalls).toBe(0);
      await expect(current).toHaveText(String(value));
    }
    await info.attach(`pagination-page-${value}`, {
      body: await canvas.screenshot({
        animations: "disabled",
        style: ".site-header, .site-header * { visibility: hidden !important; }",
      }),
      contentType: "image/png",
    });
  }

  await previous.click();
  await expect(current).toHaveText("6");
  await expect(next).toHaveAttribute("aria-disabled", "false");
  await expect(next).toHaveCSS("opacity", "1");
});
