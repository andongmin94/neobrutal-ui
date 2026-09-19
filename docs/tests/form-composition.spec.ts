import { expect, test, type Locator } from "@playwright/test";

async function descriptions(control: Locator) {
  return control.evaluate((node) =>
    (node.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => ({ id, text: document.getElementById(id)?.textContent ?? null })),
  );
}

test("optional help, custom IDs, refs, events, and field errors remain independent", async ({
  page,
}) => {
  await page.goto("/docs/form");
  const preview = page.getByRole("form", { name: "Optional field composition" });
  await page.locator('.component-preview[data-component="form"]').last().scrollIntoViewIfNeeded();
  const first = preview.getByRole("textbox", { name: "First value", exact: true });
  const second = preview.getByRole("textbox", { name: "Second value", exact: true });
  await expect(first).toBeVisible();
  expect(await descriptions(first)).toEqual([
    {
      id: await first.getAttribute("aria-describedby"),
      text: "This help belongs to the application.",
    },
  ]);
  await expect(second).not.toHaveAttribute("aria-describedby");
  await preview.getByRole("button", { name: "Show help", exact: true }).click();
  await expect
    .poll(async () => (await descriptions(first)).map(({ text }) => text))
    .toEqual(["This help belongs to the application.", "Optional field help."]);
  await preview.getByRole("button", { name: "Hide help", exact: true }).click();
  expect((await descriptions(first)).length).toBe(1);
  await preview.getByRole("button", { name: "Validate fields", exact: true }).click();
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-invalid", "true");
  await expect(second).toHaveAttribute("aria-invalid", "true");
  expect((await descriptions(first)).map(({ text }) => text)).toContain("Enter the first value.");
  expect((await descriptions(second)).map(({ text }) => text)).toEqual(["Enter the second value."]);
  await first.fill("한글 / 日本語");
  await expect(first).toHaveAttribute("aria-invalid", "false");
  await expect(second).toHaveAttribute("aria-invalid", "true");
  await second.focus();
  await expect(preview).toContainText("First field blur events: 1");
  await expect(preview).toContainText("First field touched: yes");
  await preview.getByRole("button", { name: "Focus first field", exact: true }).click();
  await expect(first).toBeFocused();
  await second.fill("Second field");
  await preview.getByRole("button", { name: "Validate fields", exact: true }).click();
  await expect(preview.getByRole("status")).toContainText("Both fields are valid");
  expect((await descriptions(first)).length).toBe(1);
  expect(await descriptions(second)).toEqual([]);
  for (const control of await preview.locator("input").all()) {
    expect((await descriptions(control)).every(({ text }) => text !== null)).toBe(true);
  }
});
