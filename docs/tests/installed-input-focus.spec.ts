import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { expectContrast } from "./helpers/contrast";

let fixture: { css: string; html: string };
test.beforeAll(async () => {
  // Use the project's React transform rather than Playwright's component JSX transform.
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ["--import", "tsx", "tests/fixtures/installed-input-focus.tsx"],
    {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: { ...process.env, TSX_DISABLE_CACHE: "1" },
    },
  );
  fixture = JSON.parse(stdout);
});

for (const mode of ["light", "dark"] as const) {
  test(`installed text controls show distinct ${mode} keyboard focus without docs CSS`, async ({
    page,
  }) => {
    await page.setContent(
      `<!doctype html><html class="${mode === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width"><style>${fixture.css}</style></head><body>${fixture.html}</body></html>`,
    );
    await page.locator("#start").focus();
    for (const id of ["file", "email", "notes", "group", "group-notes"]) {
      const field = page.locator(`#${id}`);
      const indicator = id.startsWith("group") ? field.locator("..") : field;
      await expect(indicator).toHaveCSS("outline-style", "none");
      await page.keyboard.press("Tab");
      await expect(field).toBeFocused();
      await expect.poll(() => field.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
      await expect(indicator).toHaveCSS("outline-offset", "2px");
      await expectContrast(indicator, "outline", `${mode}/${id}: installed focus`);
      if (id.startsWith("group")) await expect(field).toHaveCSS("outline-style", "none");
    }
  });
}
