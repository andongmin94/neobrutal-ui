from pathlib import Path

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
  const normalize = (value: string) => value.replace(/\s+/g, "");
  assert.equal(normalize(fs.readFileSync("src/styling/theme.css", "utf8")), normalize(serializeThemeVariables()));
});
'''
p.write_text(s)

p = Path('docs/tests/docs.spec.ts')
s = p.read_text()
s = s.replace('await radius.fill("12");', 'await radius.press("Home");\n  for (let i = 0; i < 12; i++) await radius.press("ArrowRight");')
s = s.replace('page.getByRole("status")).toContainText("Nothing was sent")', 'page.locator(".home-showcase").getByRole("status")).toContainText("Nothing was sent")')
s = s.replace('await page.screenshot({ path: info.outputPath("styling.png"), fullPage: true });', '''await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator(".theme-workbench__export details").getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("--radius: 12px;");
  await page.screenshot({ path: info.outputPath("styling.png"), fullPage: true });''')
s = s.replace('await expect(preview.locator(\'[data-slot="button"]\').first()).toBeVisible();', '''await expect(preview.locator('[data-slot="button"]').first()).toBeVisible();
  expect(await preview.getByRole("button", { name: "destructive", exact: true }).evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");''')
p.write_text(s)
print('Docs and registry now share generated default token mappings as well as custom exports.')
