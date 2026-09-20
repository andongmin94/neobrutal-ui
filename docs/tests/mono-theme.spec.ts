import { expect, test } from "@playwright/test";

test("mono matches installation in both modes", async ({ page }, info) => {
  const baseResponse = await page.request.get("/r/neobrutal-ui.json");
  const monoResponse = await page.request.get("/r/theme-mono.json");
  expect(baseResponse.ok()).toBe(true);
  expect(monoResponse.ok()).toBe(true);
  const base = await baseResponse.json();
  const mono = await monoResponse.json();
  expect(base.cssVars).toEqual(mono.cssVars);
  expect(mono.cssVars.light.main).toBe("#27282b");
  expect(mono.cssVars.light["main-foreground"]).toBe("#f4f5f7");
  expect(mono.cssVars.light.background).toBe("#f4f5f7");
  expect(mono.cssVars.dark.main).toBe("#e4e7ec");
  expect(mono.cssVars.dark.background).toBe("#18191c");

  const initial = info.project.use.colorScheme === "dark" ? "dark" : "light";
  const alternate = initial === "light" ? "dark" : "light";
  await page.goto("/");
  const html = page.locator("html");
  const chrome = page.locator('meta[name="theme-color"]');
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
    await expect(chrome).toHaveCount(1);
    await expect(chrome).toHaveAttribute("content", vars.background);
    const button = page.getByRole("button", { name: "Save workspace", exact: true });
    const expected = await button.evaluate((node) => {
      const probe = document.createElement("span");
      node.append(probe);
      probe.style.color = "var(--main)";
      const background = getComputedStyle(probe).color;
      probe.style.color = "var(--main-foreground)";
      const foreground = getComputedStyle(probe).color;
      probe.remove();
      return { background, foreground };
    });
    await expect(button).toHaveCSS("background-color", expected.background);
    await expect(button).toHaveCSS("color", expected.foreground);
    expect(expected.foreground).not.toBe(expected.background);
    await info.attach(`mono-home-${mode}`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }

  await page.reload();
  await expect(html).toHaveAttribute("data-hydrated", "true");
  await expect(html).toHaveAttribute("data-theme", alternate);
  await expect(html).toHaveCSS("--background", mono.cssVars[alternate].background);
  await expect(chrome).toHaveCount(1);
  await expect(chrome).toHaveAttribute("content", mono.cssVars[alternate].background);
});
