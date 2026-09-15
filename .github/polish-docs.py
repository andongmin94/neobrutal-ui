from pathlib import Path
import json
import re
import shutil


def write(name, content):
    file = Path(name)
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content.strip() + '\n')


def replace(name, old, new):
    file = Path(name)
    content = file.read_text()
    assert old in content, f'Missing edit anchor in {name}: {old[:100]}'
    file.write_text(content.replace(old, new))


# Markdown gets explicit typography classes; imported React demos never get these classes.
write('docs/app/components/mdx-components.tsx', r'''
import type { MDXComponents } from "mdx/types";
import { type ComponentProps, type HTMLAttributes } from "react";
import { Link as RouterLink } from "react-router";
import { Pre } from "@/components/docs/pre";
import { ComponentPreview } from "./component-preview";
import { Installation } from "./installation";
import { SpecialPage } from "./special-page";

function MdxLink({ children, href = "", className, ...props }: ComponentProps<"a">) {
  const classes = ["md-link", className].filter(Boolean).join(" ");
  if (href.startsWith("/") && !props.target) {
    return <RouterLink to={href} className={classes} {...props}>{children}</RouterLink>;
  }
  return <a href={href} className={classes} {...props}>{children}</a>;
}

function Heading({ as: Tag, children, id, className, ...props }: HTMLAttributes<HTMLHeadingElement> & {
  as: "h1" | "h2" | "h3" | "h4";
}) {
  return <Tag id={id} className={["md-heading", className].filter(Boolean).join(" ")} {...props}>
    {id && <a className="header-anchor" href={`#${id}`} aria-label={`Link to ${id}`}>#</a>}
    {children}
  </Tag>;
}

function Table({ className, ...props }: ComponentProps<"table">) {
  return <div className="md-table-shell"><table className={["md-table", className].filter(Boolean).join(" ")} {...props} /></div>;
}

function TableHeader(props: ComponentProps<"thead">) { return <thead {...props} />; }
function TableBody(props: ComponentProps<"tbody">) { return <tbody {...props} />; }
function TableFooter(props: ComponentProps<"tfoot">) { return <tfoot {...props} />; }
function TableRow(props: ComponentProps<"tr">) { return <tr {...props} />; }
function TableHead(props: ComponentProps<"th">) { return <th {...props} />; }
function TableCell(props: ComponentProps<"td">) { return <td {...props} />; }
function TableCaption(props: ComponentProps<"caption">) { return <caption {...props} />; }

export function getMDXComponents(components?: MDXComponents) {
  return {
    a: MdxLink,
    h1: (props) => <Heading as="h1" {...props} />,
    h2: (props) => <Heading as="h2" {...props} />,
    h3: (props) => <Heading as="h3" {...props} />,
    h4: (props) => <Heading as="h4" {...props} />,
    p: ({ className, ...props }) => <p className={["md-paragraph", className].filter(Boolean).join(" ")} {...props} />,
    ul: ({ className, ...props }) => <ul className={["md-list", className].filter(Boolean).join(" ")} {...props} />,
    ol: ({ className, ...props }) => <ol className={["md-list", className].filter(Boolean).join(" ")} {...props} />,
    li: ({ className, ...props }) => <li className={["md-list-item", className].filter(Boolean).join(" ")} {...props} />,
    blockquote: ({ className, ...props }) => <blockquote className={["md-quote", className].filter(Boolean).join(" ")} {...props} />,
    strong: ({ className, ...props }) => <strong className={["md-strong", className].filter(Boolean).join(" ")} {...props} />,
    code: ({ className, ...props }) => <code className={["md-code", className].filter(Boolean).join(" ")} {...props} />,
    pre: Pre,
    table: Table,
    ComponentPreview, Installation, Link: MdxLink, SpecialPage,
    Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
    ...components,
  } satisfies MDXComponents;
}
export const useMDXComponents = getMDXComponents;
declare global { type MDXProvidedComponents = ReturnType<typeof getMDXComponents>; }
''')

write('docs/app/styles/content.css', r'''
/* Typography is opt-in on MDX nodes, not inherited by live component markup. */
.docs-content { width: min(100%, var(--content-max)); margin: 0 auto; }
.docs-content--special { width: 100%; max-width: none; }
.docs-content--component .component-preview:first-child { margin-top: 0; }
h1.md-heading { display: none; }
.md-heading { position: relative; color: var(--foreground); font-weight: 800; line-height: 1.3; }
h2.md-heading { margin: 44px 0 16px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 26px; }
h3.md-heading { margin: 30px 0 12px; font-size: 20px; }
h4.md-heading { margin: 24px 0 10px; font-size: 17px; }
.docs-content--guide > h2.md-heading:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
.header-anchor { position: absolute; margin-left: -0.85em; padding-right: 0.2em; opacity: 0; color: var(--foreground); text-decoration: none; }
.md-heading:hover .header-anchor, .header-anchor:focus-visible { opacity: 1; }
.md-paragraph { margin: 0 0 18px; line-height: 1.75; }
.md-list { margin: 16px 0 22px; padding-left: 25px; }
ul.md-list { list-style-type: disc; }
ol.md-list { list-style-type: decimal; }
.md-list .md-list { margin-block: 8px; }
.md-list-item { margin: 7px 0; padding-left: 4px; line-height: 1.65; }
.md-list-item::marker { font-weight: 700; }
.md-link { font-weight: 650; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.md-link:hover { text-decoration-thickness: 2px; }
.md-strong { font-weight: 750; }
.md-quote { margin: 24px 0; padding: 16px 20px; border-left: 4px solid var(--main); background: var(--secondary-background); }
.md-quote > .md-paragraph:last-child { margin-bottom: 0; }
:not(pre) > .md-code { padding: 2px 5px; border: 1px solid var(--border); border-radius: 3px; background: var(--surface-muted); font-family: var(--font-mono); font-size: 0.88em; }
.docs-code { position: relative; margin: 20px 0; min-width: 0; border: 2px solid var(--border); border-radius: var(--radius-small); background: #12151b; color: #f1f5f9; overflow: hidden; }
.docs-code pre { margin: 0; padding: 20px; padding-top: 52px; max-height: 32rem; overflow: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; tab-size: 2; }
.docs-code pre > code { display: block; width: max-content; min-width: 100%; }
.docs-code .shiki span { color: var(--shiki-dark); background: transparent; }
.installation-tabs { margin: 18px 0 26px; border: 2px solid var(--border); border-radius: var(--radius-small); overflow: hidden; background: var(--secondary-background); }
.installation-tabs__list { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); border-bottom: 2px solid var(--border); }
.installation-tabs__list button { min-height: 44px; border: 0; border-right: 2px solid var(--border); background: var(--secondary-background); font-size: 14px; font-weight: 700; }
.installation-tabs__list button:last-child { border-right: 0; }
.installation-tabs__list button[aria-selected="true"] { background: var(--main); color: var(--main-foreground); }
.installation-tabs__list button:not([aria-selected="true"]):hover { background: var(--surface-muted); }
.installation-tabs__panel { min-width: 0; }
.installation-tabs__panel[hidden], .component-preview__panel[hidden] { display: none; }
.installation-tabs__command { display: grid; min-height: 66px; padding: 12px 14px; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 12px; background: #12151b; color: #f1f5f9; }
.installation-tabs__command code { min-width: 0; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; white-space: nowrap; }
.installation-tabs__command .icon-button { border-color: #eef2f8; background: #222936; color: #fff; }
.installation-tabs__manual { max-height: min(68vh,40rem); overflow: auto; padding: 16px; }
.installation-tabs__manual .docs-code { margin: 12px 0; box-shadow: none; }
.md-table-shell { width: 100%; margin: 20px 0 28px; overflow-x: auto; border: 2px solid var(--border); border-radius: var(--radius-small); }
.md-table { width: 100%; min-width: 520px; border-collapse: collapse; text-align: left; background: var(--secondary-background); }
.md-table th, .md-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: top; font-size: 14px; }
.md-table th { background: var(--surface-muted); font-weight: 750; }
.md-table tr:last-child td { border-bottom: 0; }
.md-table caption { padding: 12px 14px; text-align: left; }
@media (max-width:620px) { h2.md-heading { margin-top: 34px; font-size: 23px; } h3.md-heading { font-size: 19px; } .docs-code pre { padding-inline: 14px; } }
''')

write('docs/src/components/docs/pre.tsx', r'''
import { Children, isValidElement, type ReactNode, type ComponentProps } from "react";
import { CopyButton } from "./copy-button";

type PreProps = ComponentProps<"pre"> & { __rawstring__?: string; wrapperClassName?: string };
function textContent(node: ReactNode): string {
  return Children.toArray(node).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    return isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : "";
  }).join("");
}
export function Pre({ children, __rawstring__, wrapperClassName, className, ...props }: PreProps) {
  return <div data-slot="pre-wrapper" className={["docs-code", wrapperClassName].filter(Boolean).join(" ")}>
    <CopyButton text={__rawstring__ ?? textContent(children)} />
    <pre className={className} {...props}>{children}</pre>
  </div>;
}
''')

# One theme contract drives registry CSS, customizer preview values, and the exported CSS.
write('registry/src/data/theme-styles.ts', r'''
import { createThemeCssVars, defaultColor, type ColorPalette } from "./theme";

export const defaultThemeSettings = { radius: 5, shadowX: 4, shadowY: 4, baseWeight: 500, headingWeight: 700 };
export type ThemeSettings = typeof defaultThemeSettings;

export const themeCss = {
  '@import "tw-animate-css"': {},
  '@import "shadcn/tailwind.css"': {},
  "@layer base": {
    "*": { "@apply border-border outline-ring/50": {} },
    body: { "@apply bg-background text-foreground": {} },
  },
};

export function createCustomizedTheme(color: ColorPalette = defaultColor, settings: ThemeSettings = defaultThemeSettings) {
  const vars = createThemeCssVars(color);
  const shared = { radius: `${settings.radius}px`, "box-shadow-x": `${settings.shadowX}px`, "box-shadow-y": `${settings.shadowY}px` };
  return {
    ...vars,
    light: { ...vars.light, ...shared, "base-font-weight": String(settings.baseWeight), "heading-font-weight": String(settings.headingWeight) },
    dark: { ...vars.dark, ...shared },
  };
}

function cssRules(rules: Record<string, unknown>, indent = ""): string {
  return Object.entries(rules).map(([selector, value]) => {
    const declarations = value as Record<string, unknown>;
    return Object.keys(declarations).length === 0 ? `${indent}${selector};` : `${indent}${selector} {\n${cssRules(declarations, `${indent}  `)}\n${indent}}`;
  }).join("\n");
}

export function serializeThemeCss(color: ColorPalette = defaultColor, settings: ThemeSettings = defaultThemeSettings) {
  const vars = createCustomizedTheme(color, settings);
  const block = (selector: string, values: Record<string, string>) => `${selector} {\n${Object.entries(values).map(([name, value]) => `  --${name}: ${value};`).join("\n")}\n}`;
  const imports = Object.fromEntries(Object.entries(themeCss).filter(([key]) => key.startsWith("@import")));
  return [
    '@import "tailwindcss";', cssRules(imports), '@custom-variant dark (&:is(.dark *));',
    block(":root", vars.light), block(".dark", vars.dark), block("@theme inline", vars.theme),
    cssRules({ "@layer base": themeCss["@layer base"] }),
  ].join("\n\n") + "\n";
}
''')
generator = Path('registry/src/scripts/generate-registry-json.ts')
s = generator.read_text()
s = s.replace('import colors from "@/data/colors";', 'import colors from "@/data/colors";\nimport { themeCss } from "@/data/theme-styles";')
start = s.index('  css: {\n')
end = s.index('\n};', start)
s = s[:start] + '  css: themeCss,' + s[end:]
generator.write_text(s)

sync = Path('registry/src/scripts/sync-docs-public.ts')
s = sync.read_text()
s = s.replace('const sharedFiles = [', '''const sharedFiles = [
  ...["theme.ts", "theme-styles.ts"].map((name) => ({
    source: path.join(process.cwd(), "src", "data", name),
    target: path.join(docsSourceDir, "data", name),
  })),''')
s += r'''
const catalog = JSON.parse(fs.readFileSync(path.join(sourceDir, "registry.json"), "utf8")) as {
  items: { name: string; description: string }[];
};
const descriptions = Object.fromEntries(catalog.items.map((item) => [item.name, item.description]));
Object.assign(descriptions, {
  combobox: "A searchable option picker composed from a popover and command list.",
  "date-picker": "A calendar in a popover for choosing a single date or date range.",
});
fs.writeFileSync(path.join(docsSourceDir, "data", "component-descriptions.json"), `${JSON.stringify(descriptions, null, 2)}\n`);
'''
sync.write_text(s)
# Copy now for format/typecheck; the existing build remains the authoritative sync operation.
for name in ['theme.ts', 'theme-styles.ts']:
    shutil.copyfile('registry/src/data/' + name, 'docs/src/data/' + name)

write('docs/src/special-pages/styling/controls.tsx', r'''
"use client";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import colors from "@/data/colors";
import { defaultColor } from "@/data/theme";
import { createCustomizedTheme, defaultThemeSettings, serializeThemeCss, type ThemeSettings } from "@/data/theme-styles";
import { Pre } from "@/components/docs/pre";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const settingFields: { key: keyof ThemeSettings; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: "radius", label: "Corner radius", min: 0, max: 16, step: 1, unit: "px" },
  { key: "shadowX", label: "Horizontal shadow", min: -8, max: 8, step: 1, unit: "px" },
  { key: "shadowY", label: "Vertical shadow", min: -8, max: 8, step: 1, unit: "px" },
  { key: "baseWeight", label: "Body weight", min: 400, max: 700, step: 100, unit: "" },
  { key: "headingWeight", label: "Heading weight", min: 500, max: 900, step: 100, unit: "" },
];

export default function Styling() {
  const [palette, setPalette] = useState(defaultColor);
  const [settings, setSettings] = useState(defaultThemeSettings);
  const [saved, setSaved] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
  const vars = createCustomizedTheme(palette, settings);
  const style = Object.fromEntries(Object.entries({ ...vars.light, ...(dark ? vars.dark : {}) }).map(([key, value]) => [`--${key}`, value])) as CSSProperties;
  const css = serializeThemeCss(palette, settings);

  return <section className="theme-workbench" aria-label="Theme workbench">
    <aside className="theme-workbench__controls">
      <h2>Make it yours</h2>
      <p>Adjust the real design tokens. Changes stay in the preview, not the documentation shell.</p>
      <label htmlFor="theme-palette">Palette</label>
      <select id="theme-palette" value={palette.name} onChange={(event) => {
        const next = colors.find((color) => color.name === event.target.value);
        if (next) setPalette(next);
      }}>{colors.map((color) => <option key={color.name} value={color.name}>{color.name}</option>)}</select>
      {settingFields.map(({ key, label, min, max, step, unit }) => <div className="theme-workbench__setting" key={key}>
        <label htmlFor={`theme-${key}`}>{label}<output>{settings[key]}{unit}</output></label>
        <input id={`theme-${key}`} type="range" min={min} max={max} step={step} value={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: Number(event.target.value) })} />
      </div>)}
      <button className="theme-reset" type="button" onClick={() => { setPalette(defaultColor); setSettings(defaultThemeSettings); setSaved(false); }}>Reset defaults</button>
    </aside>
    <div className="theme-workbench__stage" data-theme-preview style={style}>
      <div className="theme-workbench__stage-label"><span>Live preview</span><span>{palette.name} / {dark ? "dark" : "light"}</span></div>
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader><Badge className="w-fit">Your workspace</Badge><CardTitle>Small details. Big character.</CardTitle><CardDescription>The same components and tokens you install.</CardDescription></CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
              <div className="grid gap-2"><Label htmlFor="theme-project">Project name</Label><Input id="theme-project" defaultValue="My next idea" /></div>
              <div className="flex items-center justify-between gap-3"><Label htmlFor="theme-updates">Email updates</Label><Switch id="theme-updates" defaultChecked /></div>
              <div className="flex flex-wrap gap-3"><Button type="submit">Save project</Button><Button type="button" variant="neutral" disabled>Disabled</Button></div>
              <p role="status" className="min-h-5 text-sm">{saved ? "Saved in this preview only." : "Try the controls, then export your theme."}</p>
            </form>
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-4"><Button variant="outline">Outline</Button><Button variant="reverse">Reverse</Button><Button variant="noShadow">Flat</Button></div>
      </div>
      <p className="theme-workbench__hint">Use the site theme toggle to compare light and dark surfaces.</p>
    </div>
    <section className="theme-workbench__export" aria-labelledby="theme-export-heading">
      <h2 id="theme-export-heading">Use this theme</h2>
      <p>The preset command installs the palette with its default radius, shadows, and weights. To keep your adjustments, copy the complete CSS below.</p>
      <Pre __rawstring__={`npx shadcn@latest add @neobrutal-ui/theme-${palette.name}`}><code>{`npx shadcn@latest add @neobrutal-ui/theme-${palette.name}`}</code></Pre>
      <p>Install the design-system base first. This stylesheet includes global tokens and base rules: review it before replacing existing CSS. Keep unrelated application styles.</p>
      <details><summary>Customized CSS — light and dark included</summary><Pre __rawstring__={css}><code data-theme-css>{css}</code></Pre></details>
    </section>
  </section>;
}
''')
replace('docs/app/components/special-pages.tsx', 'import StylingExamples from "@/special-pages/styling/example-components";\n', '')
p = Path('docs/app/components/special-pages.tsx')
s = p.read_text()
a, b = s.index('function StylingPage()'), s.index('function StarsPage()')
p.write_text(s[:a] + 'function StylingPage() { return <StylingControls />; }\n\n' + s[b:])
# Remove the now-unused gallery and its local demos, rather than preserve a second styling path.
Path('docs/src/special-pages/styling/example-components.tsx').unlink()
shutil.rmtree('docs/src/special-pages/styling/demos')

# Small controls should not get the same canvas as a chart or a whole form.
p = Path('docs/app/components/component-preview.tsx')
s = p.read_text().replace('          "vp-raw",\n', '')
s = s.replace('      data-component={normalizedComponent}', '      data-component={normalizedComponent}\n      data-density={compactComponents.has(normalizedComponent) ? "compact" : "comfortable"}')
s = s.replace('type PreviewType =', 'const compactComponents = new Set(["button", "badge", "avatar", "breadcrumb", "checkbox", "input", "label", "progress", "radio-group", "separator", "slider", "switch", "textarea", "tooltip"]);\n\ntype PreviewType =')
p.write_text(s)
p = Path('docs/app/styles/components.css')
s = p.read_text()
a, b = s.index('  background-image:', s.index('.component-preview__canvas')), s.index('\n}', s.index('  background-image:', s.index('.component-preview__canvas')))
s = s[:a] + s[b:]
s += r'''
.component-preview[data-density="compact"] .component-preview__canvas {
  min-height: 9rem;
  padding: 2rem 1.5rem;
}
.component-preview[data-density="compact"] .react-host__status { min-height: 4rem; }
.component-preview[data-density="compact"] .component-preview__code pre { min-height: 0; }
.component-preview .docs-code { margin: 0; border: 0; border-radius: 0; }
'''
p.write_text(s)

# Remove the obsolete VitePress preference lookup; there is one site theme key.
replace('docs/app/root.tsx', 'localStorage.getItem("neobrutal-ui-theme")\n    ?? localStorage.getItem("vitepress-theme-appearance")', 'localStorage.getItem("neobrutal-ui-theme")')

write('AGENTS.md', '''# Repository workflow

Work directly on `main` by default. Do not create a task branch unless the user explicitly requests one. Check the remote head before publishing; never force-push or overwrite unrelated work.

Keep `registry/src` authoritative for installable components and shared theme definitions. Run the registry build to synchronize generated JSON, components, and theme files into docs. Do not hand-edit generated copies.

Do not add compatibility aliases, old-path fallbacks, or migrations. Remove obsolete implementations and update current call sites together.

Before publishing, run registry lint, typecheck, build, registry:validate, and registry:check; docs lint, typecheck, build, test, and test:browser. Browser tests must cover the documentation shell, isolated component previews, and the theme export contract. Preserve a working product if a check fails.

Distinguish an automated browser smoke test from a comprehensive accessibility or visual audit. Report only checks actually run.
''')
print('Core docs changes staged in the runner workspace.')
