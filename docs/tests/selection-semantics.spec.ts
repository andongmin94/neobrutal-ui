import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("user search matches names while preserving user IDs for selection", async ({ page }) => {
  await page.goto("/docs/combobox");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const preview = page.locator('.component-preview[data-component="combobox"]').filter({
    has: page.getByRole("tablist", { name: "combobox users preview", exact: true }),
  });
  await preview.locator("[data-react-host]").scrollIntoViewIfNeeded();
  const trigger = preview.getByRole("combobox", { name: "Select a user", exact: true });
  await expect(trigger).toContainText("johndoe");
  await trigger.press("Enter");
  const input = page.getByRole("combobox", { name: "Search user...", exact: true });
  const popup = page.getByRole("dialog", { name: "Choose a user", exact: true });
  await expect(popup).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAttribute("aria-controls", (await popup.getAttribute("id"))!);
  await expect(popup.getByRole("combobox", { name: "Search user...", exact: true })).toBeVisible();
  const options = page.locator('[data-slot="command-list"]').getByRole("option");
  await input.fill("janedoe");
  await expect(options).toHaveCount(1);
  await expect(options).toContainText("janedoe");
  await input.press("Enter");
  await expect(input).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("janedoe");
  await trigger.press("Enter");
  await input.fill("alexsmith");
  await expect(options).toHaveCount(1);
  await expect(options).toContainText("alexsmith");
  await options.click();
  await expect(input).toBeHidden();
  await expect(trigger).toContainText("alexsmith");
});

test("timezone search matches displayed GMT offsets and selects the original zone", async ({
  page,
}) => {
  await page.goto("/docs/combobox");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const preview = page.locator('.component-preview[data-component="combobox"]').filter({
    has: page.getByRole("tablist", { name: "combobox timezones preview", exact: true }),
  });
  await preview.locator("[data-react-host]").scrollIntoViewIfNeeded();
  const trigger = preview.getByRole("combobox", { name: "Select a timezone", exact: true });
  await trigger.press("Enter");
  const input = page.getByRole("combobox", { name: "Search timezone...", exact: true });
  const popup = page.getByRole("dialog", { name: "Choose a timezone", exact: true });
  await expect(popup).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAttribute("aria-controls", (await popup.getAttribute("id"))!);
  await expect(
    popup.getByRole("combobox", { name: "Search timezone...", exact: true }),
  ).toBeVisible();
  const options = page.locator('[data-slot="command-list"]').getByRole("option");
  await input.fill("GMT-5");
  await expect(options).toHaveCount(2);
  await expect(options).toContainText(["(GMT-5) New York", "(GMT-5) Toronto"]);
  await options.filter({ hasText: "(GMT-5) Toronto" }).click();
  await expect(input).toBeHidden();
  await expect(trigger).toContainText("(GMT-5) Toronto");
  await trigger.press("Enter");
  await input.fill("America/Toronto");
  await expect(options).toHaveCount(1);
  await expect(options).toContainText("(GMT-5) Toronto");
  await input.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("(GMT-5) Toronto");
});

test("multiple selections survive navigation, filtering, reopening and deselection", async ({
  page,
}, info) => {
  await page.goto("/docs/combobox");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const preview = page.locator('.component-preview[data-component="combobox"]').filter({
    has: page.getByRole("tablist", { name: "combobox multiselect preview", exact: true }),
  });
  await preview.locator("[data-react-host]").scrollIntoViewIfNeeded();
  const trigger = preview.getByRole("combobox", { name: "Select frameworks", exact: true });
  await trigger.press("ArrowDown");
  const popup = page.locator('[data-slot="combobox-popup"]');
  const input = popup.getByRole("combobox", { name: "Search frameworks", exact: true });
  const list = popup.getByRole("listbox", { name: "Frameworks", exact: true });
  const first = list.getByRole("option", { name: "Next.js", exact: true });
  const second = list.getByRole("option", { name: "SvelteKit", exact: true });
  const third = list.getByRole("option", { name: "Nuxt.js", exact: true });
  await expect(input).toBeFocused();
  await expect(list).toHaveAttribute("aria-multiselectable", "true");
  await first.click();
  await second.click();
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("aria-selected", "true");
  await page.mouse.move(0, 0);
  await input.focus();
  for (let step = 0; step < 5; step++) {
    await input.press("ArrowDown");
    if ((await third.getAttribute("data-highlighted")) !== null) break;
  }
  await expect(third).toHaveAttribute("data-highlighted", "");
  await expect(input).toHaveAttribute("aria-activedescendant", (await third.getAttribute("id"))!);
  await expect(third).toHaveAttribute("aria-selected", "false");
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(list.getByRole("option", { selected: true })).toHaveCount(2);
  await expect(first.locator("svg")).toBeVisible();
  await expect(second.locator("svg")).toBeVisible();
  await expect(third.locator("svg")).toBeHidden();
  const accessibility = await new AxeBuilder({ page })
    .include('[data-slot="combobox-popup"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await info.attach("two-selected-third-highlighted", {
    body: await popup.screenshot(),
    contentType: "image/png",
  });

  await input.fill("Nuxt");
  await expect(list.getByRole("option")).toHaveCount(1);
  await expect(third).toHaveAttribute("aria-selected", "false");
  await input.fill("no-such-framework-7362");
  await expect(popup.getByText("No framework found.", { exact: true })).toBeVisible();
  await input.fill("");
  await expect(list.getByRole("option")).toHaveCount(5);
  await expect(list.getByRole("option", { selected: true })).toHaveCount(2);
  await input.press("Escape");
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("Next.js, SvelteKit");
  await trigger.press("ArrowDown");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("aria-selected", "true");
  await second.click();
  await expect(second).toHaveAttribute("aria-selected", "false");
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(list.getByRole("option", { selected: true })).toHaveCount(1);
  await input.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("Next.js");
  await expect(trigger).not.toContainText("SvelteKit");
});

test("data table distinguishes empty, mixed and fully selected checkboxes", async ({
  page,
}, info) => {
  await page.goto("/docs/data-table");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const preview = page.locator('.component-preview[data-component="data-table"]').first();
  const all = preview.getByRole("checkbox", { name: "Select all", exact: true });
  const rows = preview.getByRole("checkbox", { name: "Select row", exact: true });
  await expect(rows).toHaveCount(5);
  await expect(all).toHaveAttribute("aria-checked", "false");
  await expect(all.locator("svg")).toBeHidden();
  await rows.first().click();
  await expect(all).toHaveAttribute("aria-checked", "mixed");
  await expect(all.locator('[data-slot="checkbox-mixed-mark"]')).toBeVisible();
  await expect(all.locator('[data-slot="checkbox-checked-mark"]')).toHaveCount(0);
  await expect(preview).toContainText("1 of 5 row(s) selected.");
  await info.attach("partial-selection", {
    body: await all.screenshot(),
    contentType: "image/png",
  });
  await all.press("Space");
  await expect(all).toHaveAttribute("aria-checked", "true");
  await expect(all.locator('[data-slot="checkbox-checked-mark"]')).toBeVisible();
  await expect(all.locator('[data-slot="checkbox-mixed-mark"]')).toHaveCount(0);
  await expect(preview).toContainText("5 of 5 row(s) selected.");
  for (const row of await rows.all()) await expect(row).toBeChecked();
  await info.attach("complete-selection", {
    body: await all.screenshot(),
    contentType: "image/png",
  });
  await all.press("Space");
  await expect(all).toHaveAttribute("aria-checked", "false");
  await expect(all.locator("svg")).toBeHidden();
  await expect(preview).toContainText("0 of 5 row(s) selected.");
  for (const row of await rows.all()) await expect(row).not.toBeChecked();
});
