from pathlib import Path
import re

p = Path('registry/src/data/theme-styles.ts')
s = p.read_text()
start = s.index('export function serializeThemeCss(')
s = s[:start] + r'''
export function serializeThemeVariables(color: ColorPalette = defaultColor, settings: ThemeSettings = defaultThemeSettings) {
  const vars = createCustomizedTheme(color, settings);
  const block = (selector: string, values: Record<string, string>) => `${selector} {\n${Object.entries(values).map(([name, value]) => `  --${name}: ${value};`).join("\n")}\n}`;
  return [block(":root", vars.light), block(".dark", vars.dark), block("@theme inline", vars.theme)].join("\n\n") + "\n";
}

export function serializeThemeCss(color: ColorPalette = defaultColor, settings: ThemeSettings = defaultThemeSettings) {
  const imports = Object.fromEntries(Object.entries(themeCss).filter(([key]) => key.startsWith("@import")));
  return [
    '@import "tailwindcss";', cssRules(imports), '@custom-variant dark (&:is(.dark *));',
    serializeThemeVariables(color, settings).trimEnd(),
    cssRules({ "@layer base": themeCss["@layer base"] }),
  ].join("\n\n") + "\n";
}
'''
p.write_text(s)

p = Path('registry/src/scripts/sync-docs-public.ts')
s = p.read_text()
s = 'import { serializeThemeVariables } from "@/data/theme-styles";\n' + s
s += '\nfs.writeFileSync(path.join(docsSourceDir, "styling", "theme.css"), serializeThemeVariables());\n'
p.write_text(s)

p = Path('docs/src/styling/globals.css')
s = p.read_text()
rest = s[s.index('@layer utilities {'):]
p.write_text('''@import "tailwindcss";
@import "tw-animate-css";
@import "./theme.css";

@source "..";
@source "../../app";
@source "../../content";
@custom-variant dark (&:is(.dark *));

:root {
  --site-font-body: "Pretendard Variable", Pretendard, sans-serif;
  --site-font-display: "Pretendard Variable", Pretendard, sans-serif;
  --site-font-code: Consolas, "Liberation Mono", monospace;
  --chart-active-dot: #000;
}
.dark { --chart-active-dot: #fff; }

@theme inline {
  --shadow-nav: 4px 4px 0px 0px var(--border);
  --spacing-container: 1300px;
  --animate-marquee: marquee 5s linear infinite;
  --animate-marquee2: marquee2 5s linear infinite;
  @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
  @keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
}

''' + rest)

p = Path('docs/scripts/docs-contract.test.ts')
s = p.read_text().replace('serializeThemeCss, defaultThemeSettings', 'serializeThemeCss, serializeThemeVariables, defaultThemeSettings')
s += r'''
test("the docs stylesheet is generated from the same default theme", () => {
  const normalize = (value: string) => value.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => hex.toLowerCase()).replace(/\s+/g, "");
  assert.equal(normalize(fs.readFileSync("src/styling/theme.css", "utf8")), normalize(serializeThemeVariables()));
});
'''
p.write_text(s)

for name in [
    'docs/app/components/home-showcase.tsx',
    'docs/src/special-pages/styling/controls.tsx',
    'docs/src/examples/ui/dialog/index.tsx',
    'docs/src/examples/ui/select/index.tsx',
]:
    p = Path(name)
    p.write_text(re.sub(r'<p role="status"([^>]*)>([\s\S]*?)</p>', r'<output\1>\2</output>', p.read_text()))

p = Path('docs/app/styles/index.css')
p.write_text(p.read_text().replace('    scroll-behavior: smooth;\n', ''))

# The horizontal category scroller must not set its parent grid track's minimum width.
p = Path('docs/app/styles/directory.css')
s = p.read_text().replace('grid-template-columns: 1fr;', 'grid-template-columns: minmax(0,1fr);')
s = s.replace('.directory-categories h2 {', '.directory-categories { min-width: 0; }\n.directory-categories h2 {')
p.write_text(s)

p = Path('docs/tests/docs.spec.ts')
s = p.read_text()
s = s.replace('await radius.fill("12");', 'await radius.press("Home");\n  for (let i = 0; i < 12; i++) await radius.press("ArrowRight");')
s = s.replace('page.getByRole("status")).toContainText("Nothing was sent")', 'page.locator(".home-showcase").getByRole("status")).toContainText("Nothing was sent")')
s = s.replace('  await page.screenshot({ path: info.outputPath("home.png"), fullPage: true });\n', '')
s = s.replace('  await card.click();', '''  const cardBounds = await card.boundingBox();
  expect(cardBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await card.click();''')
s = s.replace('  await expect(page.getByRole("searchbox", { name: "Search component directory" })).toHaveValue("calendar");', '''  await expect(page.getByRole("searchbox", { name: "Search component directory" })).toHaveValue("calendar");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath("home.png"), fullPage: true });''')
s = s.replace('await page.screenshot({ path: info.outputPath("styling.png"), fullPage: true });', '''await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator(".theme-workbench__export details").getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("--radius: 12px;");
  await page.screenshot({ path: info.outputPath("styling.png"), fullPage: true });''')
s = s.replace('await expect(preview.locator(\'[data-slot="button"]\').first()).toBeVisible();', '''await expect(preview.locator('[data-slot="button"]').first()).toBeVisible();
  expect(await preview.getByRole("button", { name: "destructive", exact: true }).evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");''')
s = s.replace('await page.locator(\'[data-react-host][aria-busy="true"]\').first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});', '''const primary = page.locator(".component-preview").first();
    if (await primary.count()) await expect(primary.locator("[data-react-host]")).not.toHaveAttribute("aria-busy", "true");''')
s = s.replace('expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);', '''const viewportWidth = page.viewportSize()!.width;
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, layout: innerWidth }));
    expect(widths.scroll, `${route}: scroll width`).toBeLessThanOrEqual(viewportWidth + 1);
    expect(widths.layout, `${route}: layout viewport`).toBeLessThanOrEqual(viewportWidth + 1);
    expect(widths.client, `${route}: document width`).toBeLessThanOrEqual(viewportWidth + 1);''')
p.write_text(s)
print('Shared CSS, bounded mobile tracks, and strict viewport checks are ready.')
