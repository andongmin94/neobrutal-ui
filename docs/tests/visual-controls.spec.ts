import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("chart selectors expose styled options, selection, and keyboard focus", async ({
  page,
}, info) => {
  await page.goto("/docs/chart-release-activity");
  const chart = page.locator('.component-preview [data-chart-recipe="activity"]');
  const control = chart.getByRole("combobox", { name: "Activity measure", exact: true });
  await expect(control).toBeVisible();
  expect(await control.evaluate((node) => node.tagName)).toBe("BUTTON");
  await control.click();
  const popup = page.locator('[data-slot="select-content"]');
  await expect(popup).toBeVisible();
  const selected = popup.getByRole("option", { name: "Event counts", exact: true });
  await expect(selected).toHaveAttribute("aria-selected", "true");
  await expect(selected.locator("svg")).toBeVisible();
  const bounds = await popup.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await info.attach("chart-select-open", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(control).toContainText("Share of each release");
  await expect(control).toBeFocused();
  await expect(popup).toBeHidden();
  await expect(chart.locator("figure")).toContainText("100%");
  await control.click();
  await expect(control).toHaveAttribute("aria-expanded", "true");
  await expect(popup).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(control).toBeFocused();
  const result = await new AxeBuilder({ page })
    .include(".component-preview")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("chart install and source actions share one compact row", async ({ page }, info) => {
  await page.goto("/charts#area-chart");
  const chart = page.locator('[data-chart-recipe="activity"]').locator("..");
  const install = chart.getByRole("link", { name: "Install recipe", exact: true });
  const source = chart.getByRole("button", { name: "View source", exact: true });
  await expect(install).toBeVisible();
  await expect(source).toBeVisible();
  const installBox = (await install.boundingBox())!;
  const sourceBox = (await source.boundingBox())!;
  expect(Math.abs(installBox.y - sourceBox.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(installBox.height - sourceBox.height)).toBeLessThanOrEqual(1);
  expect(sourceBox.x).toBeGreaterThan(installBox.x + installBox.width);
  await info.attach("chart-actions-one-row", {
    body: await chart.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
});

test("date picker stays anchored, uses a neutral surface, and restores focus", async ({
  page,
}, info) => {
  await page.goto("/docs/date-picker");
  const preview = page.locator(".component-preview").first();
  const trigger = preview.getByRole("button", { name: "Project date", exact: true });
  await expect(trigger).toBeVisible();
  await trigger.evaluate((node) => {
    window.scrollBy(0, node.getBoundingClientRect().top - 160);
  });
  await trigger.click();
  const calendar = page.locator('[data-slot="popover-content"] [data-slot="calendar"]');
  await expect(calendar).toBeVisible();
  const anchor = (await trigger.boundingBox())!;
  const bounds = (await calendar.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(anchor.y + anchor.height);
  expect(Math.abs(bounds.x - anchor.x)).toBeLessThanOrEqual(4);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  const canvas = (await preview.locator(".component-preview__canvas").boundingBox())!;
  expect(bounds.y + bounds.height + 4).toBeLessThanOrEqual(canvas.y + canvas.height);
  const expectedSurface = await calendar.evaluate((node) => {
    const probe = document.createElement("span");
    node.append(probe);
    probe.style.color = "var(--secondary-background)";
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(calendar).toHaveCSS("background-color", expectedSurface);
  await info.attach("date-picker-open", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  const caption = calendar.locator(".rdp-caption_label");
  const initialMonth = await caption.textContent();
  await calendar.getByRole("button", { name: /next month/i }).click();
  await expect(caption).not.toHaveText(initialMonth!);
  const day = calendar.locator("button[data-day]:not([disabled])").nth(10);
  await calendar.getByRole("button", { name: /previous month/i }).click();
  await day.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(calendar).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(preview.locator("output")).toContainText("Selected:");
  await preview.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(preview.locator("output")).toHaveText("No date selected");
  await expect(trigger).toBeFocused();
});

test("warm mono is optional and never replaces the cool default", async ({ page }, info) => {
  const response = await page.request.get("/r/theme-mono-warm.json");
  expect(response.ok()).toBe(true);
  const warm = await response.json();
  expect(warm.cssVars.light.background).toBe("#f5f4f0");
  expect(warm.cssVars.light.main).toBe("#292b29");
  expect(warm.cssVars.light["main-foreground"]).toBe("#f5f4f0");
  expect(warm.cssVars.dark.main).toBe("#e5e2d9");
  const base = await (await page.request.get("/r/neobrutal-ui.json")).json();
  expect(base.cssVars.light.background).toBe("#f4f5f7");
  await page.goto("/styling");
  const palette = page.getByLabel("Palette", { exact: true });
  await expect(palette).toHaveValue("mono");
  await palette.selectOption("mono-warm");
  await expect(page.locator("[data-theme-preview] .theme-workbench__stage-label")).toContainText(
    "mono-warm",
  );
  await info.attach("mono-warm-customizer", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  await page.getByRole("button", { name: "Reset defaults", exact: true }).click();
  await expect(palette).toHaveValue("mono");
});

test("code previews and chart source use real Dark+ syntax colors", async ({ page }, info) => {
  await page.goto("/docs/button");
  const preview = page.locator(".component-preview").first();
  await preview.getByRole("tab", { name: "Code", exact: true }).click();
  const pre = preview.locator(".docs-code pre");
  await expect(pre).toBeVisible();
  await expect(pre).toHaveCSS("background-color", "rgb(30, 30, 30)");
  const colors = await pre
    .locator("span")
    .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color));
  expect(colors).toContain("rgb(206, 145, 120)");
  await info.attach("dark-plus-component-source", {
    body: await preview.screenshot(),
    contentType: "image/png",
  });
  let sourceRequests = 0;
  await page.route("**/chart-source/*.json", async (route) => {
    sourceRequests += 1;
    if (sourceRequests === 1) await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.continue();
  });
  await page.goto("/charts#area-chart");
  const chart = page.locator('[data-chart-recipe="activity"]').locator("..");
  await expect(chart.locator(".recharts-surface")).toBeVisible();
  expect(sourceRequests).toBe(0);
  await chart.getByRole("button", { name: "View source", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("Could not load this source");
  await dialog.getByRole("button", { name: "Retry source", exact: true }).click();
  const source = dialog.locator(".docs-code pre");
  await expect(source.locator("code span").first()).toBeVisible();
  expect(sourceRequests).toBe(2);
  await expect(source).toContainText("ChartSelect");
  await expect(source).toHaveCSS("background-color", "rgb(30, 30, 30)");
  const item = await (await page.request.get("/r/chart-release-activity.json")).json();
  expect((await source.textContent())?.trimEnd()).toBe(item.files[0].content.trimEnd());
  await info.attach("dark-plus-chart-source", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});

for (const [slug, slot] of [
  ["select", "select-content"],
  ["popover", "popover-content"],
  ["combobox", "popover-content"],
  ["dropdown-menu", "dropdown-menu-content"],
]) {
  test(`related popup remains visible and within the viewport: ${slug}`, async ({ page }, info) => {
    await page.goto(`/docs/${slug}`);
    const preview = page.locator(".component-preview").first();
    const trigger = preview
      .getByRole(slug === "select" || slug === "combobox" ? "combobox" : "button")
      .first();
    await trigger.click();
    const popup = page.locator(`[data-slot="${slot}"]`).last();
    await expect(popup).toBeVisible();
    const bounds = (await popup.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(-1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    await info.attach(`${slug}-open`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
