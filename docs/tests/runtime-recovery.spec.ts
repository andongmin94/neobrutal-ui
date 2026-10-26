import { expect, test } from "@playwright/test";

for (const blockedOperation of ["read", "write"] as const) {
  test(`theme remains usable when preference ${blockedOperation} is blocked`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((operation) => {
      const method = operation === "read" ? "getItem" : "setItem";
      const original = Storage.prototype[method];
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value: function (this: Storage, key: string, ...values: string[]) {
          if (key === "neobrutal-ui-theme") {
            throw new DOMException("Preference storage is blocked", "SecurityError");
          }
          return Reflect.apply(original, this, [key, ...values]);
        },
      });
      window.addEventListener("neobrutal-ui:theme", () => {
        document.documentElement.dataset.observedTheme = document.documentElement.dataset.theme;
      });
    }, blockedOperation);

    await page.goto("/");
    const initialTheme = info.project.use.colorScheme === "dark" ? "dark" : "light";
    const nextTheme = initialTheme === "dark" ? "light" : "dark";
    const root = page.locator("html");
    await expect(root).toHaveAttribute("data-hydrated", "true");
    await expect(root).toHaveAttribute("data-theme", initialTheme);
    await page.getByRole("button", { name: `Use ${nextTheme} theme`, exact: true }).click();
    await expect(root).toHaveAttribute("data-theme", nextTheme);
    await expect(root).toHaveAttribute("data-observed-theme", nextTheme);
    await page.getByRole("button", { name: `Use ${initialTheme} theme`, exact: true }).click();
    await expect(root).toHaveAttribute("data-theme", initialTheme);
    expect(errors).toEqual([]);
  });
}

for (const failure of ["download", "render"] as const) {
  test(`a failed preview ${failure} offers reload and recovers the real example`, async ({
    page,
  }, info) => {
    let requests = 0;
    let failing = true;
    await page.route("**/assets/components-*.js", async (route) => {
      requests++;
      if (!failing) {
        await route.continue();
      } else if (failure === "download") {
        await route.abort("failed");
      } else {
        await route.fulfill({
          contentType: "application/javascript",
          body: 'export default [{name:"Button",exampleComponent:async()=>({default:()=>{throw new Error("Temporary preview render failure")}})}];',
        });
      }
    });

    await page.goto("/docs/button");
    const preview = page.locator('.component-preview--primary [data-react-host="component"]');
    const alert = preview.getByRole("alert");
    await expect(alert).toContainText("Preview could not be loaded.");
    const tabs = page.getByRole("tablist", { name: "button primary preview", exact: true });
    await tabs.getByRole("tab", { name: "Code", exact: true }).click();
    await tabs.getByRole("tab", { name: "Preview", exact: true }).click();
    await expect(alert).toBeVisible();
    await preview.screenshot({ path: info.outputPath(`preview-${failure}-recovery.png`) });

    failing = false;
    await Promise.all([
      page.waitForNavigation(),
      alert.getByRole("button", { name: "Reload page", exact: true }).click(),
    ]);
    await expect(preview.getByRole("button", { name: "Download", exact: true })).toBeVisible();
    await expect(preview.getByRole("alert")).toHaveCount(0);
    expect(requests).toBeGreaterThan(1);
  });
}
