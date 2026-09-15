import { expect, test, type Locator } from "@playwright/test";

async function expectCompactCode(block: Locator) {
  await expect(block).toBeVisible();
  const dimensions = await block.evaluate((node) => {
    const pre = node.querySelector("pre")!;
    const code = pre.querySelector("code")!;
    const button = node.querySelector(".code-copy-button")!;
    const frame = node.getBoundingClientRect();
    return {
      codeTop: code.getBoundingClientRect().top - frame.top,
      preRight: pre.getBoundingClientRect().right,
      copyLeft: button.getBoundingClientRect().left,
      copyTop: button.getBoundingClientRect().top - frame.top,
      paddingTop: parseFloat(getComputedStyle(pre).paddingTop),
    };
  });
  expect(dimensions.paddingTop).toBeLessThanOrEqual(20);
  expect(dimensions.codeTop).toBeGreaterThanOrEqual(12);
  expect(dimensions.codeTop).toBeLessThanOrEqual(24);
  expect(dimensions.copyTop).toBeLessThanOrEqual(14);
  expect(dimensions.preRight).toBeLessThanOrEqual(dimensions.copyLeft + 1);
}

test("installation notice, tabs and command have separate, usable layouts", async ({ page }, info) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/sheet");
  const installation = page.locator(".installation-tabs").first();
  const notice = installation.locator(".installation-tabs__notice");
  const frame = installation.locator(".installation-tabs__frame");
  await expect(notice.getByRole("link", { name: "Install the base theme" })).toHaveAttribute("href", "/docs/installation");
  const noticeBounds = await notice.boundingBox();
  const frameBounds = await frame.boundingBox();
  expect(frameBounds!.y - noticeBounds!.y - noticeBounds!.height).toBeGreaterThanOrEqual(12);
  expect(await notice.evaluate((node) => parseFloat(getComputedStyle(node).paddingLeft))).toBeGreaterThanOrEqual(12);
  const cli = installation.getByRole("tab", { name: "shadcn CLI", exact: true });
  const manual = installation.getByRole("tab", { name: "Manual", exact: true });
  expect((await cli.boundingBox())!.width).toBeLessThan(180);
  await installation.getByRole("button", { name: "Copy installation command", exact: true }).click();
  await expect(installation.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    (await installation.locator(".installation-tabs__command code").innerText()),
  );
  await installation.screenshot({ path: info.outputPath("installation.png"), animations: "disabled" });
  await cli.focus();
  await page.keyboard.press("ArrowRight");
  await expect(manual).toBeFocused();
  await expect(manual).toHaveAttribute("aria-selected", "true");
  await expect(installation.locator(".installation-tabs__command")).toBeHidden();
  await expectCompactCode(installation.locator(".installation-tabs__manual .docs-code").first());
  await installation.screenshot({ path: info.outputPath("manual.png"), animations: "disabled" });
  await page.keyboard.press("ArrowLeft");
  await expect(cli).toBeFocused();
  await expect(installation.locator(".installation-tabs__manual")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});

test("code starts on the first row and never scrolls beneath its copy control", async ({ page }, info) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/sheet");
  const usage = page.locator(".docs-code:visible").first();
  await expectCompactCode(usage);
  const content = await usage.locator("pre").innerText();
  await usage.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(usage.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect((await page.evaluate(() => navigator.clipboard.readText())).trim()).toBe(content.trim());
  await usage.screenshot({ path: info.outputPath("usage.png"), animations: "disabled" });

  const preview = page.locator(".component-preview").first();
  await preview.getByRole("tab", { name: "Code", exact: true }).click();
  const previewCode = preview.locator(".docs-code").first();
  await expectCompactCode(previewCode);
  await previewCode.screenshot({ path: info.outputPath("preview-source.png"), animations: "disabled" });

  await page.setViewportSize({ width: 320, height: 844 });
  await expectCompactCode(previewCode);
  await previewCode.locator("pre").evaluate((node) => { node.scrollLeft = node.scrollWidth; });
  const pre = await previewCode.locator("pre").boundingBox();
  const copy = await previewCode.locator(".code-copy-button").boundingBox();
  expect(pre!.x + pre!.width).toBeLessThanOrEqual(copy!.x + 1);
  await expect(previewCode.locator(".code-copy-button")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  await previewCode.screenshot({ path: info.outputPath("narrow-source.png"), animations: "disabled" });
});
