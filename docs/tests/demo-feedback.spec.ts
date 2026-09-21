import { expect, test } from "@playwright/test";

test("tabs forms describe local-only updates", async ({ page }, info) => {
  await page.goto("/docs/tabs");
  const preview = page.locator(".component-preview").first();

  await preview.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(preview.getByRole("status")).toHaveText("Account preview updated locally.");
  await info.attach("tabs-account-saved", {
    body: await preview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });

  await preview.getByRole("tab", { name: "Password", exact: true }).click();
  await preview.getByLabel("Current password", { exact: true }).fill("current-preview-value");
  await preview.getByLabel("New password", { exact: true }).fill("new-preview-value");
  await preview.getByRole("button", { name: "Save password", exact: true }).click();
  await expect(preview.getByRole("status")).toHaveText(
    "Password preview updated locally. No credentials were sent.",
  );
  await info.attach("tabs-password-saved", {
    body: await preview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });
});

test("drawer and sheet do not claim remote persistence", async ({ page }, info) => {
  await page.goto("/docs/drawer");
  const drawerPreview = page.locator(".component-preview").first();
  await drawerPreview.getByRole("button", { name: "Open drawer", exact: true }).click();
  await page.getByRole("button", { name: "Submit demo", exact: true }).click();
  await expect(drawerPreview.getByRole("status")).toHaveText("Demo action submitted locally.");
  await info.attach("drawer-submitted", {
    body: await drawerPreview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });

  await page.goto("/docs/sheet");
  const sheetPreview = page.locator(".component-preview").first();
  await sheetPreview.getByRole("button", { name: "Open sheet", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(sheetPreview.getByRole("status")).toHaveText("Profile preview updated locally.");
  await info.attach("sheet-saved", {
    body: await sheetPreview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });
});
