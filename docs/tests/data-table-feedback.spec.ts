import { expect, test } from "@playwright/test";

for (const denied of [false, true]) {
  test(`payment ID copy reports ${denied ? "failure" : "success"}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((rejectCopy) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            if (rejectCopy) throw new Error("Clipboard denied for regression test");
            document.documentElement.dataset.copiedPayment = value;
          },
        },
      });
    }, denied);
    await page.goto("/docs/data-table");
    const preview = page.locator('.component-preview[data-component="data-table"]').first();
    const row = preview.locator("tbody tr").first();
    await row.getByRole("button", { name: "Open menu", exact: true }).click();
    const menu = page.getByRole("menu");
    await expect(menu.getByRole("menuitem")).toHaveCount(1);
    await menu.getByRole("menuitem", { name: "Copy payment ID", exact: true }).click();
    await expect(row.getByRole("status")).toHaveText(
      denied ? "Copy failed. Payment ID: m5gr84i9" : "Copied payment ID.",
    );
    if (!denied) {
      await expect(page.locator("html")).toHaveAttribute("data-copied-payment", "m5gr84i9");
    }
    await info.attach("copy-result", { body: await row.screenshot(), contentType: "image/png" });
    expect(errors).toEqual([]);
  });
}

test("table sorting and empty states follow visible columns", async ({ page }) => {
  await page.goto("/docs/data-table");
  const preview = page.locator('.component-preview[data-component="data-table"]').first();
  const sortButton = preview.getByRole("button", { name: "Email", exact: true });
  const header = preview.getByRole("columnheader", { name: "Email", exact: true });
  await sortButton.click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  await sortButton.click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
  await preview.getByRole("button", { name: "Columns", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "amount", exact: true }).click();
  await page.keyboard.press("Escape");
  await preview.getByLabel("Filter email records").fill("nobody@example.invalid");
  const empty = preview.getByRole("cell", { name: "No results.", exact: true });
  await expect(empty).toHaveAttribute("colspan", "4");
});
