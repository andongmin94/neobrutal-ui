import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("home hydrates, submits the demo, and opens installation docs", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByRole("heading", { name: /Bold by design/ })).toBeVisible();
  await page.getByLabel("Workspace name", { exact: true }).fill("Deployment check");
  await page.getByRole("button", { name: "Save workspace" }).click();
  await expect(page.locator(".home-showcase").getByRole("status")).toContainText(
    "Nothing was sent",
  );
  await page.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/installation\/?$/);
  await expect(page.getByRole("heading", { name: "Requirements" })).toBeVisible();
});

test("a component preview opens and closes its dialog", async ({ page }) => {
  const response = await page.goto("/docs/dialog");
  expect(response?.status()).toBe(200);
  const preview = page.locator(".component-preview").first();
  const trigger = preview.getByRole("button", { name: "Edit profile" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Name", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the catalog, shared styles, and dialog registry endpoints match the build", async ({
  request,
}) => {
  const output = new URL("../../../registry/public/r/", import.meta.url);
  for (const name of ["registry", "neobrutal-ui", "dialog"]) {
    const response = await request.get(`/r/${name}.json`);
    expect(response.status(), name).toBe(200);
    expect(response.headers()["content-type"], name).toMatch(/application\/json/i);
    expect(await response.json(), name).toEqual(
      JSON.parse(readFileSync(new URL(`${name}.json`, output), "utf8")),
    );
  }
});
