import { expect, test } from "@playwright/test";

test("preview tabs respond to the first enabled click after hydration", async ({ page }) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") await scriptsReady;
    await route.continue();
  });

  const preview = page.locator('.component-preview[data-component="button"]').first();
  const codeTab = preview.getByRole("tab", { name: "Code", exact: true });
  const previewTab = preview.getByRole("tab", { name: "Preview", exact: true });
  try {
    await page.goto("/docs/button", { waitUntil: "commit" });
    await expect(codeTab).toBeVisible();
    await expect(codeTab).toBeDisabled();
    await expect(previewTab).toBeDisabled();
    await expect(page.locator("html")).not.toHaveAttribute("data-hydrated", "true");
  } finally {
    releaseScripts();
  }

  await expect(codeTab).toBeEnabled();
  await codeTab.click();
  await expect(codeTab).toHaveAttribute("aria-selected", "true");
  await expect(preview.locator(".docs-code pre")).toBeVisible();
  await codeTab.press("ArrowLeft");
  await expect(previewTab).toBeFocused();
  await expect(previewTab).toHaveAttribute("aria-selected", "true");
  await expect(preview.locator(".docs-code pre")).toBeHidden();
});
