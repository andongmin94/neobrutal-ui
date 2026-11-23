import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const output = new URL("../../registry/public/r/", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("registry.json", output), "utf8")) as {
  items: { name: string }[];
};

test("the local documentation serves the complete generated registry", async ({ request }) => {
  for (const name of ["registry", ...catalog.items.map((item) => item.name)]) {
    const response = await request.get(`/r/${name}.json`);
    expect(response.status(), name).toBe(200);
    expect(response.headers()["content-type"], name).toMatch(/application\/json/i);
    expect(await response.json(), name).toEqual(
      JSON.parse(readFileSync(new URL(`${name}.json`, output), "utf8")),
    );
  }
});

test("manual installation commands match the served registry and copy their exact versions", async ({
  page,
  request,
}) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const name of ["chart", "form", "card"]) {
    const response = await request.get(`/r/${name}.json`);
    expect(response.ok()).toBe(true);
    const { dependencies = [] } = (await response.json()) as { dependencies?: string[] };
    await page.goto(`/docs/${name}`);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const installation = page.locator(".installation-tabs");
    await installation.getByRole("tab", { name: "Manual", exact: true }).click();
    const manual = installation.getByRole("tabpanel", { name: "Manual", exact: true });
    await expect(manual).toBeVisible();
    if (dependencies.length === 0) {
      await expect(manual.locator("code").filter({ hasText: /^npm install\b/ })).toHaveCount(0);
      continue;
    }
    const expected = `npm install ${dependencies.join(" ")}`;
    const command = manual.locator(".docs-code").first();
    await expect(command.locator("code")).toHaveText(expected);
    await command.getByRole("button", { name: "Copy", exact: true }).click();
    await expect(command.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  }
});
