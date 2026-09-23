import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export function writeServerComponentPages(directory, aliases, items) {
  for (const name of ["input-group", "calendar"]) {
    if (!items.some((item) => item.name === name)) continue;
    const source = fs.readFileSync(
      new URL(`./fixtures/server-${name}.tsx`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, /^["']use client["']/m);
    assert.match(source, /export const metadata =/);
    const pagePath = path.join(directory, `src/app/server-${name}/page.tsx`);
    fs.mkdirSync(path.dirname(pagePath), { recursive: true });
    fs.writeFileSync(pagePath, source.replaceAll("@/components/ui", aliases.ui));
  }
}

export async function verifyServerInputGroup({ page, origin, expect }) {
  const response = await page.goto(`${origin}/server-input-group`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Server input group verification");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Server-rendered input groups");
  const search = page.getByLabel("Search documentation", { exact: true });
  const notes = page.getByLabel("Notes", { exact: true });
  await expect(search).toHaveValue("Registry");
  await expect(notes).toHaveValue("Server composition");

  await notes.click();
  await page.getByTestId("server-search-addon").click();
  await expect(search).toBeFocused();
  await search.fill("Server page search");
  await page.getByTestId("server-notes-addon").click();
  await expect(notes).toBeFocused();
  await notes.fill("Textarea addon focus");

  const keep = page.getByRole("button", { name: "Keep search value", exact: true });
  await expect(keep).toHaveAttribute("type", "button");
  await keep.click();
  await expect(search).not.toBeFocused();
  await expect(page).toHaveURL(`${origin}/server-input-group`);
  await expect(search).toHaveValue("Server page search");
  await expect(notes).toHaveValue("Textarea addon focus");
}

export async function verifyServerCalendar({ page, origin, expect }) {
  const response = await page.goto(`${origin}/server-calendar`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Server calendar verification");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Server-rendered calendar");
  const calendar = page.locator('[data-slot="calendar"]');
  await expect(calendar).toContainText("September 2026");
  await calendar.getByRole("button", { name: /next month/i }).click();
  await expect(calendar).toContainText("October 2026");
  await calendar.getByRole("button", { name: /previous month/i }).press("Enter");
  await expect(calendar).toContainText("September 2026");
}
