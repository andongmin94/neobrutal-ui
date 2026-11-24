import { expect, test } from "@playwright/test";
import colors from "../src/data/colors";

const series = [
  { id: "examples", title: "Decision workbench", count: 3 },
  { id: "area-chart", title: "Release activity", count: 1 },
  { id: "bar-chart", title: "Delivery planning", count: 1 },
  { id: "line-chart", title: "Build performance", count: 1 },
  { id: "pie-chart", title: "Work allocation", count: 1 },
  { id: "tooltip", title: "Install diagnostics", count: 1 },
];

for (const group of series) {
  test(`chart gallery and every source dialog: ${group.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/charts");
    await page
      .getByRole("navigation", { name: "Chart series" })
      .getByRole("button", { name: new RegExp(group.title) })
      .click();
    const section = page.locator(`section#${group.id}`);
    const heading = section.getByRole("heading", {
      name: group.title,
      exact: true,
      level: 2,
    });
    await expect(heading).toBeVisible();
    const examples = section.locator("[data-chart-example]");
    await expect(examples).toHaveCount(group.count);
    await expect(section.getByRole("button", { name: "View source", exact: true })).toHaveCount(
      group.count,
    );
    await expect(section.getByRole("link", { name: "Install recipe", exact: true })).toHaveCount(
      group.count,
    );
    for (let index = 0; index < group.count; index++) {
      const example = examples.nth(index);
      const button = example.getByRole("button", { name: "View source", exact: true });
      await example.scrollIntoViewIfNeeded();
      await expect(example.locator(".recharts-surface").first()).toBeVisible();
      await button.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.locator("pre").first()).toContainText("import");
      const bounds = await dialog.boundingBox();
      expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      expect(bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width + 1,
    );
    expect(errors).toEqual([]);
  });
}

test("every palette has an isolated live preview", async ({ page }) => {
  await page.goto("/styling");
  const select = page.getByLabel("Palette", { exact: true });
  const preview = page.locator("[data-theme-preview]");
  const shell = await page
    .locator("html")
    .evaluate((node) => getComputedStyle(node).getPropertyValue("--main"));
  for (const color of colors) {
    await select.selectOption(color.name);
    await expect(select).toHaveValue(color.name);
    await expect(preview.locator(".theme-workbench__stage-label")).toContainText(color.name);
    expect(
      await page
        .locator("html")
        .evaluate((node) => getComputedStyle(node).getPropertyValue("--main")),
    ).toBe(shell);
  }
});

test("clipboard denial shows honest feedback without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied for regression test");
        },
      },
    });
  });
  await page.goto("/templates");
  const card = page.locator(".not-prose > article").first();
  await card.getByRole("button", { name: "Copy command", exact: true }).click();
  await expect(card.getByRole("button", { name: "Copy failed", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("template clipboard feedback lasts from the latest completed copy", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => {} },
    });
  });
  await page.goto("/templates");
  const copy = page.locator(".not-prose > article").first().getByRole("button");
  await expect(copy).toBeVisible();
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);

  await copy.click();
  await expect(copy).toHaveAccessibleName("Copied");
  await page.clock.runFor(1000);
  await copy.click();
  await expect(copy).toHaveAccessibleName("Copied");
  await page.clock.runFor(600);
  await expect(copy).toHaveAccessibleName("Copied");
  await page.clock.runFor(1000);
  await expect(copy).toHaveAccessibleName("Copy command");
});

test("template clipboard feedback ignores older success and failure completions", async ({
  page,
}) => {
  type ClipboardWindow = typeof window & {
    pendingCopies: { resolve: () => void; reject: (reason: Error) => void }[];
  };
  await page.addInitScript(() => {
    const pendingCopies: ClipboardWindow["pendingCopies"] = [];
    Object.defineProperty(window, "pendingCopies", { value: pendingCopies });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve, reject) => {
            pendingCopies.push({ resolve, reject });
          }),
      },
    });
  });
  await page.goto("/templates");
  const copy = page.locator(".not-prose > article").first().getByRole("button");
  await expect(copy).toBeVisible();
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);

  for (const [index, outcome] of (["failure", "success"] as const).entries()) {
    await copy.click();
    await expect
      .poll(() => page.evaluate(() => (window as ClipboardWindow).pendingCopies.length))
      .toBe(index * 2 + 1);
    await copy.click();
    await expect
      .poll(() => page.evaluate(() => (window as ClipboardWindow).pendingCopies.length))
      .toBe(index * 2 + 2);
    await page.evaluate((result) => {
      const latest = (window as ClipboardWindow).pendingCopies.at(-1)!;
      if (result === "success") latest.resolve();
      else latest.reject(new Error("Latest copy failed"));
    }, outcome);
    const feedback = outcome === "success" ? "Copied" : "Copy failed";
    await expect(copy).toHaveAccessibleName(feedback);

    await page.evaluate((result) => {
      const previous = (window as ClipboardWindow).pendingCopies.at(-2)!;
      if (result === "success") previous.reject(new Error("Previous copy failed"));
      else previous.resolve();
    }, outcome);
    await page.clock.runFor(50);
    await expect(copy).toHaveAccessibleName(feedback);
  }
});

test("CMS status filter is a flush segmented control", async ({ page }) => {
  await page.goto("/templates/cms");
  const group = page.getByRole("group", { name: "Filter posts by status" });
  const all = group.getByRole("button", { name: "All", exact: true });
  const draft = group.getByRole("button", { name: "Draft", exact: true });
  await expect(group).toBeVisible();
  await expect(group.getByRole("button")).toHaveCount(3);
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(draft).toHaveAttribute("aria-pressed", "false");
  const frame = await group.evaluate((node) => getComputedStyle(node).borderTopWidth);
  const selected = await all.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      borderBottom: style.borderBottomWidth,
      borderLeft: style.borderLeftWidth,
      borderRadius: style.borderRadius,
      borderTop: style.borderTopWidth,
    };
  });
  const inactiveBackground = await draft.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(frame).toBe("2px");
  expect(selected.borderTop).toBe("0px");
  expect(selected.borderBottom).toBe("0px");
  expect(selected.borderLeft).toBe("0px");
  expect(selected.borderRadius).toBe("0px");
  expect(selected.background).not.toBe(inactiveBackground);
  await draft.click();
  await expect(draft).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  const posts = page.getByRole("region", { name: "Posts", exact: true });
  await expect(posts.getByText("July product update", { exact: true })).toHaveCount(0);
  await expect(posts.getByText("Organize your first team space", { exact: true })).toBeVisible();
  await expect(posts.getByText("Public page checklist", { exact: true })).toBeVisible();
});

test("marquee pause and reduced motion stop both strips", async ({ page }) => {
  await page.goto("/docs/marquee");
  const preview = page.locator(".component-preview").first();
  const pause = preview.getByRole("button", { name: "Pause", exact: true });
  await pause.click();
  const resume = preview.getByRole("button", { name: "Resume", exact: true });
  await expect(resume).not.toHaveAttribute("aria-pressed");
  for (const selector of [".animate-marquee", ".animate-marquee2"]) {
    await expect(preview.locator(selector)).toHaveCSS("animation-play-state", "paused");
  }
  await resume.click();
  await expect(pause).not.toHaveAttribute("aria-pressed");
  for (const selector of [".animate-marquee", ".animate-marquee2"]) {
    await expect(preview.locator(selector)).toHaveCSS("animation-play-state", "running");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(pause).toBeHidden();
  await expect(preview.locator(".animate-marquee")).toHaveCSS("animation-name", "none");
  await expect(preview.locator(".animate-marquee2")).toBeHidden();
});

test("navigation and search can be dismissed with focus restored", async ({ page }) => {
  await page.goto("/");
  if (page.viewportSize()!.width < 1024) {
    const menu = page.locator(".mobile-menu-button");
    await menu.click();
    await expect(page.locator(".docs-sidebar.is-open")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".docs-sidebar.is-open")).toHaveCount(0);
    await expect(menu).toBeFocused();
  }
  const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
  await trigger.click();
  const input = page.getByRole("combobox", { name: "Search docs and components", exact: true });
  await expect(input).toBeVisible();
  await input.fill("button");
  await expect(page.locator(".search-dialog").getByRole("option").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("card preview does not claim an account operation occurred", async ({ page }) => {
  await page.goto("/docs/card");
  const preview = page.locator(".component-preview").first();
  await preview.getByRole("button", { name: "Forgot your password?", exact: true }).click();
  await expect(preview.getByRole("status")).toContainText("No email was sent");
  await preview.getByRole("button", { name: "Login with Google", exact: true }).click();
  await expect(preview.getByRole("status")).toContainText("No authentication was started");
});
