import { expect, test } from "@playwright/test";

for (const startPath of ["/", "/docs/resizable"]) {
  test(`table search from ${startPath} shows readable cells and opens a visible, focused section`, async ({
    page,
  }) => {
    await page.goto(startPath);
    const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
    await dialog.getByRole("combobox").fill("ResizablePanelGroup.orientation");
    const result = dialog
      .getByRole("option")
      .filter({ hasText: "ResizablePanelGroup.orientation" });
    await expect(result.locator("strong")).toHaveText(
      "ResizablePanelGroup.orientation · Split direction · horizontal",
    );
    await result.click();
    await expect(page).toHaveURL(/\/docs\/resizable#api-reference$/);
    await expect(dialog).toBeHidden();
    await expect(page.locator("#main-content")).toBeFocused();
    const heading = page.locator("#api-reference");
    await expect(heading).toBeInViewport();
    await expect
      .poll(async () => {
        const section = await heading.boundingBox();
        const header = await page.locator(".site-header").boundingBox();
        return section !== null && header !== null && section.y >= header.y + header.height;
      })
      .toBe(true);

    await trigger.click();
    await dialog.getByRole("combobox").press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("failed full-text loading is visible and retry recovers without losing local navigation", async ({
  page,
}) => {
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
  await input.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
    bubbles: true,
  });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await input.press("Enter");
  await expect(page).toHaveURL(/\/docs\/button$/);
  await expect(dialog).toBeHidden();
});

test("search stays disabled before hydration and responds to its first enabled click", async ({
  page,
}) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") await scriptsReady;
    await route.continue();
  });

  const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeDisabled();
    await expect(page.locator("html")).not.toHaveAttribute("data-hydrated", "true");
  } finally {
    releaseScripts();
  }

  await expect(trigger).toBeEnabled();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
  await expect(dialog.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
