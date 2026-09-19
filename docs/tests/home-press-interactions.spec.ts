import { expect, test } from "@playwright/test";

async function interactionState(locator: import("@playwright/test").Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return { boxShadow: style.boxShadow, translate: style.translate };
  });
}

test("home shortcuts use the shared raised and pressed interaction", async ({ page }) => {
  await page.goto("/");

  const cms = page.getByRole("link", { name: "Try the CMS demo", exact: true });
  const shortcuts = [
    page.getByRole("link", { name: "Get started", exact: true }),
    page.getByRole("link", { name: /Browse \d+ components/ }),
    cms,
    page.getByRole("link", { name: /Explore complete templates/ }),
    page.locator(".directory-card").first(),
  ];

  for (const shortcut of shortcuts) {
    await expect(shortcut).toBeVisible();
    expect((await interactionState(shortcut)).boxShadow).not.toBe("none");
  }
  await expect(cms).toHaveAttribute("href", "/templates/cms");

  const card = page.locator(".directory-card").first();
  await expect(card).toHaveClass(/pressable/);

  const canHover = await page.evaluate(() => matchMedia("(hover: hover)").matches);
  if (!canHover) return;

  const raised = await interactionState(card);
  await card.hover();
  await page.waitForTimeout(180);
  const hovered = await interactionState(card);
  expect(hovered.translate).not.toBe(raised.translate);
  expect(hovered.boxShadow).not.toBe(raised.boxShadow);

  const bounds = await card.boundingBox();
  if (!bounds) throw new Error("Component card is not measurable.");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(180);
  const pressed = await interactionState(card);
  expect(pressed.translate).not.toBe(hovered.translate);
  expect(pressed.boxShadow).not.toBe(hovered.boxShadow);
  await page.mouse.move(0, 0);
  await page.mouse.up();
});
