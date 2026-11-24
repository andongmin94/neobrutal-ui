import { expect, test } from "@playwright/test";

test("theme copy feedback follows the current export and lasts from the latest copy", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => {} },
    });
  });
  await page.goto("/styling");
  const palette = page.getByLabel("Palette", { exact: true });
  const command = page.locator(".theme-workbench__export > .docs-code");
  const copy = command.getByRole("button");
  await palette.selectOption("red");
  await expect(command.locator("code")).toHaveText("npx shadcn@latest add @neobrutal-ui/theme-red");
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);

  await copy.click();
  await expect(copy).toHaveAccessibleName("Copied");
  await palette.selectOption("blue");
  await expect(command.locator("code")).toHaveText(
    "npx shadcn@latest add @neobrutal-ui/theme-blue",
  );
  await expect(copy).toHaveAccessibleName("Copy");
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error("Clipboard unavailable");
    };
  });
  await copy.click();
  await expect(copy).toHaveAccessibleName("Copy failed");
  await palette.selectOption("red");
  await expect(copy).toHaveAccessibleName("Copy");

  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {};
  });
  await copy.click();
  await expect(copy).toHaveAccessibleName("Copied");
  await page.clock.runFor(1000);
  await copy.click();
  await expect(copy).toHaveAccessibleName("Copied");
  await page.clock.runFor(600);
  await expect(copy).toHaveAccessibleName("Copied");
  await page.clock.runFor(1000);
  await expect(copy).toHaveAccessibleName("Copy");
});

for (const outcome of ["success", "failure"] as const) {
  test(`theme copy ignores a late ${outcome} from the previous export`, async ({ page }) => {
    type ClipboardWindow = typeof window & {
      pendingCopies: { text: string; resolve: () => void; reject: (reason: Error) => void }[];
    };
    await page.addInitScript(() => {
      const pendingCopies: ClipboardWindow["pendingCopies"] = [];
      Object.defineProperty(window, "pendingCopies", { value: pendingCopies });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: (text: string) =>
            new Promise<void>((resolve, reject) => {
              pendingCopies.push({ text, resolve, reject });
            }),
        },
      });
    });
    await page.goto("/styling");
    const palette = page.getByLabel("Palette", { exact: true });
    const command = page.locator(".theme-workbench__export > .docs-code");
    const copy = command.getByRole("button");
    await palette.selectOption("red");
    await expect(command.locator("code")).toHaveText(
      "npx shadcn@latest add @neobrutal-ui/theme-red",
    );
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await copy.click();
    await expect
      .poll(() => page.evaluate(() => (window as ClipboardWindow).pendingCopies.length))
      .toBe(1);
    await palette.selectOption("blue");
    await expect(command.locator("code")).toHaveText(
      "npx shadcn@latest add @neobrutal-ui/theme-blue",
    );
    await copy.click();
    await expect
      .poll(() => page.evaluate(() => (window as ClipboardWindow).pendingCopies.length))
      .toBe(2);
    expect(
      await page.evaluate(() =>
        (window as ClipboardWindow).pendingCopies.map((write) => write.text),
      ),
    ).toEqual([
      "npx shadcn@latest add @neobrutal-ui/theme-red",
      "npx shadcn@latest add @neobrutal-ui/theme-blue",
    ]);

    await page.evaluate(() => {
      (window as ClipboardWindow).pendingCopies[1].resolve();
    });
    await expect(copy).toHaveAccessibleName("Copied");
    await page.evaluate((result) => {
      const previous = (window as ClipboardWindow).pendingCopies[0];
      if (result === "success") previous.resolve();
      else previous.reject(new Error("Previous copy failed"));
    }, outcome);
    await page.clock.runFor(50);
    await expect(copy).toHaveAccessibleName("Copied");
    await page.clock.runFor(1600);
    await expect(copy).toHaveAccessibleName("Copy");
  });
}

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
