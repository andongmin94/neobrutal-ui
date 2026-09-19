import { expect, test } from "@playwright/test";

test("failed full-text loading is visible and retry recovers without losing local navigation", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/search*", async (route) => {
    requests++;
    if (requests === 1) await route.abort("failed");
    else await route.continue();
  });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
  const input = dialog.getByRole("combobox");
  await input.fill("button");
  await expect(dialog.getByRole("status")).toContainText("Full-text search is unavailable");
  await expect(dialog.getByRole("option").filter({ hasText: "Button" }).first()).toBeVisible();
  await dialog.getByRole("button", { name: "Retry full-text search", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveCount(0);
  expect(requests).toBeGreaterThan(1);
  await input.fill("no-result-8bd152-한글");
  await expect(dialog.getByText(/No matches for/)).toBeVisible();
  await expect(input).not.toHaveAttribute("aria-activedescendant");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("composition Enter does not navigate; ordinary Enter does", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
  const input = dialog.getByRole("combobox");
  await input.fill("button");
  await expect(dialog.getByRole("option").first()).toBeVisible();
  await input.dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true, bubbles: true });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await input.press("Enter");
  await expect(page).toHaveURL(/\/docs\/button$/);
  await expect(dialog).toBeHidden();
});
