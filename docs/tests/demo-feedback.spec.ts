import { expect, test } from "@playwright/test";

test("tabs retain saved account values and describe local-only form submission", async ({
  page,
}, info) => {
  await page.goto("/docs/tabs");
  const preview = page.locator(".component-preview").first();

  await preview.getByLabel("Name", { exact: true }).fill("Alex Rivera");
  await preview.getByLabel("Username", { exact: true }).fill("@alexrivera");
  await preview.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(preview.getByRole("status")).toHaveText("Account preview updated locally.");
  await info.attach("tabs-account-saved", {
    body: await preview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });

  await preview.getByRole("tab", { name: "Password", exact: true }).click();
  await expect(preview.getByLabel("Name", { exact: true })).toHaveCount(0);
  await preview.getByLabel("Current password", { exact: true }).fill("current-preview-value");
  await preview.getByLabel("New password", { exact: true }).fill("new-preview-value");
  await preview.getByRole("button", { name: "Save password", exact: true }).click();
  await expect(preview.getByRole("status")).toHaveText(
    "Password form submitted locally. No credentials were sent.",
  );
  await info.attach("tabs-password-submitted", {
    body: await preview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });
  await preview.getByRole("tab", { name: "Account", exact: true }).click();
  await expect(preview.getByLabel("Name", { exact: true })).toHaveValue("Alex Rivera");
  await expect(preview.getByLabel("Username", { exact: true })).toHaveValue("@alexrivera");
  await preview.getByLabel("Name", { exact: true }).fill("Unsaved edit");
  await preview.getByRole("tab", { name: "Password", exact: true }).click();
  await expect(preview.getByLabel("Name", { exact: true })).toHaveCount(0);
  await preview.getByRole("tab", { name: "Account", exact: true }).click();
  await expect(preview.getByLabel("Name", { exact: true })).toHaveValue("Alex Rivera");
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
  const sheet = page.getByRole("dialog", { name: "Edit profile", exact: true });
  await sheet.getByLabel("Name", { exact: true }).fill("Morgan Lee");
  await sheet.getByLabel("Username", { exact: true }).fill("@morganlee");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(sheet).toHaveCount(0);
  await expect(sheetPreview.getByRole("status")).toHaveText("Profile preview updated locally.");
  await info.attach("sheet-saved", {
    body: await sheetPreview.locator(".component-preview__canvas").screenshot(),
    contentType: "image/png",
  });
  await sheetPreview.getByRole("button", { name: "Open sheet", exact: true }).click();
  await expect(sheet.getByLabel("Name", { exact: true })).toHaveValue("Morgan Lee");
  await expect(sheet.getByLabel("Username", { exact: true })).toHaveValue("@morganlee");
  await sheet.getByLabel("Name", { exact: true }).fill("Unsaved edit");
  await sheet
    .locator('[data-slot="sheet-footer"]')
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  await sheetPreview.getByRole("button", { name: "Open sheet", exact: true }).click();
  await expect(sheet.getByLabel("Name", { exact: true })).toHaveValue("Morgan Lee");
  await expect(sheet.getByLabel("Username", { exact: true })).toHaveValue("@morganlee");
});
