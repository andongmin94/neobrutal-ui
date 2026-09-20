import { expect, test } from "@playwright/test";

test("promise toast aligns its loading icon in reduced motion", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/sonner");
  const preview = page.locator('.component-preview[data-component="sonner"]').last();
  await preview.locator("[data-react-host]").scrollIntoViewIfNeeded();
  const trigger = preview.getByRole("button", { name: "Promise", exact: true });
  await trigger.click();
  const toast = page.locator("[data-sonner-toast]").first();
  const icon = toast.locator("[data-icon] svg");
  await expect(toast).toContainText("Loading...");
  await expect(icon).toBeVisible();
  await expect(icon).toHaveCSS("animation-name", "none");
  const placement = await icon.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const container = node.closest("[data-sonner-toast]")!;
    const surface = container.getBoundingClientRect();
    const title = container.querySelector("[data-title]")!.getBoundingClientRect();
    return {
      inset: box.left - surface.left,
      offset: Math.abs(box.top + box.height / 2 - (title.top + title.height / 2)),
    };
  });
  expect(placement.inset).toBeGreaterThanOrEqual(12);
  expect(placement.offset).toBeLessThanOrEqual(2);
  await info.attach("aligned-loading-toast", {
    body: await toast.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  await expect(trigger).toBeEnabled();
  await expect(toast).toContainText("Sonner toast has been added");
  await info.attach("resolved-toast", {
    body: await toast.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
});
