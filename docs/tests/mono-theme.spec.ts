import { expect, test } from "@playwright/test";

test("mono matches installation in both modes", async ({ page }, info) => {
  const baseResponse = await page.request.get("/r/neobrutal-ui.json");
  const monoResponse = await page.request.get("/r/theme-mono.json");
  expect(baseResponse.ok()).toBe(true);
  expect(monoResponse.ok()).toBe(true);
  const base = await baseResponse.json();
  const mono = await monoResponse.json();
  expect(base.cssVars).toEqual(mono.cssVars);
  expect(mono.cssVars.light.main).toBe("#292b29");
  expect(mono.cssVars.light["main-foreground"]).toBe("#f5f4f0");
  expect(mono.cssVars.dark.main).toBe("#e5e2d9");

  const initial = info.project.use.colorScheme === "dark" ? "dark" : "light";
  const alternate = initial === "light" ? "dark" : "light";
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-hydrated", "true");
  await expect(html).toHaveAttribute("data-theme", initial);

  for (const mode of [initial, alternate]) {
    if (mode !== initial) {
      await page.getByRole("button", { name: `Use ${mode} theme`, exact: true }).click();
    }
    await expect(html).toHaveAttribute("data-theme", mode);
    await expect(html).toHaveCSS("color-scheme", mode);
    const vars = mono.cssVars[mode];
    for (const token of ["background", "main", "main-foreground", "chart-1", "chart-2"]) {
      await expect(html).toHaveCSS(`--${token}`, vars[token]);
    }
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      vars.background,
    );
    const button = page.getByRole("button", { name: "Save workspace", exact: true });
    const applied = await button.evaluate((node) => {
      const style = getComputedStyle(node);
      const probe = document.createElement("span");
      node.append(probe);
      probe.style.color = "var(--main)";
      const background = getComputedStyle(probe).color;
      probe.style.color = "var(--main-foreground)";
      const foreground = getComputedStyle(probe).color;
      probe.remove();
      return {
        background: style.backgroundColor,
        foreground: style.color,
        expectedBackground: background,
        expectedForeground: foreground,
      };
    });
    expect(applied.background).toBe(applied.expectedBackground);
    expect(applied.foreground).toBe(applied.expectedForeground);
    expect(applied.foreground).not.toBe(applied.background);
    await info.attach(`mono-home-${mode}`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }

  await page.reload();
  await expect(html).toHaveAttribute("data-hydrated", "true");
  await expect(html).toHaveAttribute("data-theme", alternate);
  await expect(html).toHaveCSS("--background", mono.cssVars[alternate].background);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    mono.cssVars[alternate].background,
  );
});
