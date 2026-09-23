import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 320, height: 390 },
  { width: 844, height: 390 },
]) {
  test(`long dialog examples fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/docs/dialog");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

    for (const { triggerName, title, sticky } of [
      { triggerName: "Scrollable Content", title: "Project review notes", sticky: false },
      { triggerName: "Sticky Footer", title: "Review checklist", sticky: true },
    ]) {
      const trigger = page.locator(".component-preview").getByRole("button", {
        name: triggerName,
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: title, exact: true });
      await expect(dialog).toBeVisible();
      await expect
        .poll(async () => {
          const box = await dialog.boundingBox();
          return (
            box !== null &&
            box.x >= 15 &&
            box.y >= 15 &&
            box.x + box.width <= viewport.width - 15 &&
            box.y + box.height <= viewport.height - 15
          );
        })
        .toBe(true);
      const close = dialog.getByRole("button", {
        name: sticky ? "Close review" : "Close",
        exact: true,
      });
      await expect(close).toBeInViewport({ ratio: 1 });
      const scroll = dialog.locator("div.overflow-y-auto");
      await expect(scroll).toHaveCount(1);
      await expect
        .poll(() => scroll.evaluate((node) => node.scrollHeight > node.clientHeight))
        .toBe(true);
      const lastNote = scroll.locator("p").last();
      await lastNote.scrollIntoViewIfNeeded();
      await expect(lastNote).toBeInViewport({ ratio: 1 });
      await expect(close).toBeInViewport({ ratio: 1 });
      await testInfo.attach(`${triggerName}-${viewport.width}x${viewport.height}`, {
        body: await dialog.screenshot(),
        contentType: "image/png",
      });
      await close.click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });
}
