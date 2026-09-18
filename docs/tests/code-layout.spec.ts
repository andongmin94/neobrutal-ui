import { expect, test, type Locator } from "@playwright/test";

type CodeOverflow = "contained" | "natural";

async function expectCompactCode(block: Locator, overflow: CodeOverflow = "natural") {
  await expect(block).toBeVisible();
  const dimensions = await block.evaluate((node) => {
    const pre = node.querySelector("pre")!;
    const code = pre.querySelector("code")!;
    const button = node.querySelector(".code-copy-button")!;
    const frame = node.getBoundingClientRect();
    const preBox = pre.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    const style = getComputedStyle(pre);

    return {
      clientHeight: pre.clientHeight,
      codeTop: code.getBoundingClientRect().top - frame.top,
      copyLeft: buttonBox.left - frame.left,
      copyRightInset: frame.right - buttonBox.right,
      copyTop: buttonBox.top - frame.top,
      frameWidth: frame.width,
      maxHeight: style.maxHeight,
      overflowY: style.overflowY,
      paddingRight: parseFloat(style.paddingRight),
      paddingTop: parseFloat(style.paddingTop),
      preWidth: preBox.width,
      scrollHeight: pre.scrollHeight,
    };
  });

  expect(dimensions.paddingTop).toBeLessThanOrEqual(20);
  expect(dimensions.paddingRight).toBeGreaterThanOrEqual(60);
  expect(dimensions.codeTop).toBeGreaterThanOrEqual(12);
  expect(dimensions.codeTop).toBeLessThanOrEqual(24);
  expect(dimensions.copyTop).toBeGreaterThanOrEqual(7);
  expect(dimensions.copyTop).toBeLessThanOrEqual(14);
  expect(dimensions.copyLeft).toBeGreaterThan(0);
  expect(dimensions.copyRightInset).toBeGreaterThanOrEqual(7);
  expect(dimensions.preWidth).toBeGreaterThanOrEqual(dimensions.frameWidth - 4);

  if (overflow === "natural") {
    expect(dimensions.maxHeight).toBe("none");
    expect(dimensions.overflowY).toBe("hidden");
    expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight + 1);
  } else {
    expect(dimensions.maxHeight).not.toBe("none");
    expect(dimensions.overflowY).toBe("auto");
  }
}

test("installation notice, tabs and command have separate, usable layouts", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/sheet");
  const installation = page.locator(".installation-tabs").first();
  const notice = installation.locator(".installation-tabs__notice");
  const frame = installation.locator(".installation-tabs__frame");
  await expect(notice.getByRole("link", { name: "Install the shared base once" })).toHaveAttribute(
    "href",
    "/docs/installation",
  );
  const noticeBounds = await notice.boundingBox();
  const frameBounds = await frame.boundingBox();
  expect(frameBounds!.y - noticeBounds!.y - noticeBounds!.height).toBeGreaterThanOrEqual(12);
  expect(
    await notice.evaluate((node) => parseFloat(getComputedStyle(node).paddingLeft)),
  ).toBeGreaterThanOrEqual(12);
  const cli = installation.getByRole("tab", { name: "shadcn CLI", exact: true });
  const manual = installation.getByRole("tab", { name: "Manual", exact: true });
  expect((await cli.boundingBox())!.width).toBeLessThan(180);
  await installation
    .getByRole("button", { name: "Copy installation command", exact: true })
    .click();
  await expect(installation.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await installation.locator(".installation-tabs__command code").innerText(),
  );
  await cli.focus();
  await page.keyboard.press("ArrowRight");
  await expect(manual).toBeFocused();
  await expect(manual).toHaveAttribute("aria-selected", "true");
  await expect(installation.locator(".installation-tabs__command")).toBeHidden();
  await expectCompactCode(installation.locator(".installation-tabs__manual .docs-code").first());
  await page.keyboard.press("ArrowLeft");
  await expect(cli).toBeFocused();
  await expect(installation.locator(".installation-tabs__manual")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width + 1,
  );
});

test("usage code grows naturally while full source remains contained", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/drawer");
  const usage = page.locator(".docs-code:visible").first();
  await expectCompactCode(usage);
  const content = await usage.locator("pre").innerText();
  await usage.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(usage.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect((await page.evaluate(() => navigator.clipboard.readText())).trim()).toBe(content.trim());

  const preview = page.locator(".component-preview").first();
  await preview.getByRole("tab", { name: "Code", exact: true }).click();
  const previewCode = preview.locator(".docs-code").first();
  await expectCompactCode(previewCode, "contained");

  await page.setViewportSize({ width: 320, height: 844 });
  await expectCompactCode(previewCode, "contained");
  const copyBeforeScroll = await previewCode.locator(".code-copy-button").boundingBox();
  await previewCode.locator("pre").evaluate((node) => {
    node.scrollLeft = node.scrollWidth;
  });
  const copyAfterScroll = await previewCode.locator(".code-copy-button").boundingBox();
  const frame = await previewCode.boundingBox();
  expect(Math.abs(copyAfterScroll!.x - copyBeforeScroll!.x)).toBeLessThanOrEqual(1);
  expect(copyAfterScroll!.x + copyAfterScroll!.width).toBeLessThanOrEqual(
    frame!.x + frame!.width - 7,
  );
  await expect(previewCode.locator(".code-copy-button")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
});
