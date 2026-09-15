from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]

def write(name, content):
    p = root / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')

def replace(name, old, new, count=1):
    p = root / name
    text = p.read_text(encoding='utf-8')
    if text.count(old) != count:
        raise RuntimeError(f'{name}: expected {count} occurrences of {old[:90]!r}, got {text.count(old)}')
    write(name, text.replace(old, new))

# Publish every preset through the same shadcn build and flat catalog.
replace('registry/src/scripts/generate-registry-json.ts', 'import REGISTRY from "@/data/registry";', 'import REGISTRY from "@/data/registry";\nimport colors from "@/data/colors";')
replace('registry/src/scripts/generate-registry-json.ts', '      css: "src/index.css",\n', '')
replace('registry/src/scripts/generate-registry-json.ts', '  items: [BASE_ITEM, ...REGISTRY.map(rewriteRegistryItem)],', '''  items: [
    BASE_ITEM,
    ...REGISTRY.map(rewriteRegistryItem),
    ...colors.map((color) => ({
      name: `theme-${color.name}`,
      title: `Neobrutal ${color.name.charAt(0).toUpperCase() + color.name.slice(1)}`,
      type: "registry:style",
      author: "andongmin94",
      description: `The ${color.name} light and dark theme for neobrutal-ui.`,
      categories: ["design-system", "theme"],
      extends: "none",
      dependencies: BASE_ITEM.dependencies,
      registryDependencies: BASE_ITEM.registryDependencies,
      cssVars: createThemeCssVars(color),
      css: BASE_ITEM.css,
    })),
  ],''')
replace('registry/scripts/tasks.mjs', '  run("tsx", ["src/scripts/add-registry-styles.ts"]);\n', '')
(root / 'registry/src/scripts/add-registry-styles.ts').unlink()
for name in ['registry/index.html', 'registry/public/index.html', 'registry/README.md']:
    p = root / name
    write(name, p.read_text().replace('/r/styling/yellow.json', '/r/theme-yellow.json').replace('npx shadcn@latest init http://127.0.0.1:5177/r/theme-yellow.json', 'npx shadcn@latest add http://127.0.0.1:5177/r/theme-yellow.json'))

p = root / 'registry/scripts/check-registry.mjs'
s = p.read_text()
a = s.index('function checkThemeContract() {')
b = s.index('\nfunction checkItemSchemaAndDependencies(', a)
s = s[:a] + '''function checkThemeContract() {
  const base = items.get("neobrutal-ui");
  const yellow = items.get("theme-yellow");
  const themes = [...items.values()].filter((item) => item.type === "registry:style");

  if (!base?.cssVars || !yellow?.cssVars || themes.length === 0) {
    errors.push("theme: base and discoverable theme-yellow items are required");
    return;
  }
  if (stableJson(base.cssVars) !== stableJson(yellow.cssVars)) {
    errors.push("theme: the base and theme-yellow must publish identical CSS variables");
  }
  for (const entry of fs.readdirSync(outputDirectory, { withFileTypes: true })) {
    if (entry.isDirectory()) errors.push(`registry output must be flat: ${entry.name}`);
    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "registry.json" && !itemNames.has(entry.name.slice(0, -5))) {
      errors.push(`registry output is absent from the catalog: ${entry.name}`);
    }
  }
  for (const style of themes) {
    const cssVars = style.cssVars;
    if (!style.name.startsWith("theme-")) errors.push(`${style.name}: use the theme- prefix`);
    if (cssVars?.light?.["secondary-background"] !== "oklch(100% 0 0)") {
      errors.push(`${style.name}: light secondary-background must be the light surface`);
    }
    if (cssVars?.dark?.["secondary-background"] !== "oklch(23.93% 0 0)") {
      errors.push(`${style.name}: dark secondary-background must be the dark surface`);
    }
    if (cssVars?.theme?.["font-weight-base"] !== "var(--base-font-weight)" ||
        cssVars?.theme?.["font-weight-heading"] !== "var(--heading-font-weight)") {
      errors.push(`${style.name}: font weight tokens must use configurable CSS variables`);
    }
    if (!cssVars?.light?.["base-font-weight"] || !cssVars?.light?.["heading-font-weight"]) {
      errors.push(`${style.name}: default font weight CSS variables are missing`);
    }
  }
}
''' + s[b:]
write('registry/scripts/check-registry.mjs', s)

# Keep reusable styles server-safe; only the interactive Button is a client component.
button = (root / 'registry/src/components/ui/button.tsx').read_text()
variants = button[button.index('const raisedPress'):button.index('function Button(')]
write('registry/src/components/ui/button-variants.ts', 'import { cva } from "class-variance-authority";\n\n' + variants + '\nexport { buttonVariants };\n')
write('registry/src/components/ui/button.tsx', '''"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={
        typeof className === "function"
          ? (state) => cn(buttonVariants({ variant, size }), className(state))
          : cn(buttonVariants({ variant, size }), className)
      }
      {...props}
    />
  );
}

export { Button };
''')
replace('registry/src/data/registry.ts', '''        path: "src/components/ui/button.tsx",
        type: "registry:ui",
      },''', '''        path: "src/components/ui/button.tsx",
        type: "registry:ui",
      },
      {
        path: "src/components/ui/button-variants.ts",
        type: "registry:ui",
      },''')

# Convert the four existing link templates, preserving their anchor attributes and content.
pattern = re.compile(r'<Button\b(?P<attrs>[^>]*\basChild\b[^>]*)>\s*<a\b(?P<link>[^>]*)>(?P<body>.*?)</a>\s*</Button>', re.S)
converted = 0
for p in (root / 'registry/src/blocks/templates').glob('*.tsx'):
    s = p.read_text()
    def convert(m):
        attrs = m['attrs']
        values = re.findall(r'\b(size|variant|className)=("[^"]*"|\{[^}]*\})', attrs)
        options = ', '.join(f'{key}: {value[1:-1] if value.startswith("{") else value}' for key, value in values)
        remaining = re.sub(r'\b(size|variant|className)=("[^"]*"|\{[^}]*\})', '', attrs)
        remaining = remaining.replace('asChild', '').replace('nativeButton={false}', '').strip()
        if remaining or 'className=' in m['link']:
            raise RuntimeError(f'Unexpected Button link attributes in {p}: {remaining}')
        return '<a' + m['link'] + ' className={buttonVariants({ ' + options + ' })}>' + m['body'] + '</a>'
    s, n = pattern.subn(convert, s)
    converted += n
    if n:
        s = s.replace('import { Button } from "@/components/ui/button";', 'import { Button, buttonVariants } from "@/components/ui/button";')
        if not re.search(r'<Button\b', s):
            s = s.replace('import { Button, buttonVariants }', 'import { buttonVariants }')
        p.write_text(s)
if converted != 4:
    raise RuntimeError(f'Expected four link template conversions, found {converted}')

# Replace the style import everywhere, including documentation examples.
imports = re.compile(r'import\s*\{(?P<names>[^{}]*)\}\s*from\s*([\'"])@/components/ui/button\2;?')
for directory in ['registry/src', 'docs/src', 'docs/app', 'docs/content']:
    for p in (root / directory).rglob('*'):
        if not p.is_file() or p.suffix not in ['.tsx', '.ts', '.mdx']:
            continue
        def rewrite_import(m):
            names = [name.strip() for name in m['names'].split(',') if name.strip()]
            if 'buttonVariants' not in names:
                return m[0]
            names.remove('buttonVariants')
            other = ('import { ' + ', '.join(names) + ' } from "@/components/ui/button";\n') if names else ''
            return other + 'import { buttonVariants } from "@/components/ui/button-variants";'
        p.write_text(imports.sub(rewrite_import, p.read_text()))

# Extend the existing consumer runner instead of introducing a second fixture system.
p = root / 'registry/scripts/verify-consumer.mjs'
s = p.read_text()
s = s.replace('import { fileURLToPath } from "node:url";', 'import { fileURLToPath } from "node:url";\nimport { parseArgs } from "node:util";')
s = s.replace('const requestedTargets = process.argv.slice(2);', '''const { values: options, positionals: requestedTargets } = parseArgs({
  allowPositionals: true,
  options: {
    item: { type: "string" },
    "registry-url": { type: "string" },
  },
});
if (options.item && !catalog.items.some((item) => item.name === options.item && item.type !== "registry:base" && item.type !== "registry:style")) {
  throw new Error(`Unknown installable item: ${options.item}`);
}''')
s = s.replace('let registryOrigin = "";', 'let registryOrigin = options["registry-url"]?.replace(/\\/$/, "") ?? "";')
a = s.index('  await new Promise((resolve, reject) => {')
b = s.index('\n  for (const target of targets)', a)
s = s[:a] + '''  if (!registryOrigin) {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Could not start registry server");
    registryOrigin = `http://127.0.0.1:${address.port}`;
  } else if (!["https:", "http:"].includes(new URL(registryOrigin).protocol)) {
    throw new Error("Registry URL must use HTTP or HTTPS");
  }
''' + s[b:]
s = s.replace('  await new Promise((resolve) => server.close(resolve));', '  if (server.listening) await new Promise((resolve) => server.close(resolve));')
s = s.replace('    if (item.name === baseItem.name) return false;', '    if (item.name === baseItem.name || item.type === "registry:style") return false;\n    if (options.item && item.name !== options.item) return false;')
s = s.replace('  await run(\n    shadcnExecutable(),\n    [\n      "add",', '  if (installableItems.length === 0) throw new Error(`No selected items support ${target}`);\n\n  await run(\n    shadcnExecutable(),\n    [\n      "add",')
s = s.replace('      strict: false,', '      strict: true,')
s = s.replace('writeJson(path.join(directory, "components.json"), componentsConfig(true));', '''const config = componentsConfig(true);
  config.tailwind.css = "src/app/globals.css";
  writeJson(path.join(directory, "components.json"), config);''')
s = s.replace('writeFile(path.join(directory, "src", "index.css"), \'@import "tailwindcss";\\n\');', 'writeFile(path.join(directory, "src", "app", "globals.css"), \'@import "tailwindcss";\\n\');', 1)
s = s.replace('import "../index.css";', 'import "./globals.css";')
s = s.replace('.replaceAll("https://neobrutal-ui.andongmin.com/r/", `${registryOrigin}/`);', '.replaceAll(`${catalog.homepage}/r/`, `${registryOrigin}/`);')
s = s.replace('return `${registryOrigin}/styling/${name}.json`;', 'return itemUrl(`theme-${name}`);')
s = s.replace('  console.log(`Fresh ${target} consumer passed.`);', '  console.log(`Fresh ${target} consumer passed: ${options.item ?? "all items"}.`);')
write('registry/scripts/verify-consumer.mjs', s)

write('registry/scripts/verify-live.mjs', '''import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registryItemSchema, registrySchema } from "shadcn/schema";

const output = fileURLToPath(new URL("../public/r/", import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path.join(output, "registry.json"), "utf8"));
const registryUrl = `${catalog.homepage.replace(/\\/$/, "")}/r`;
const files = ["registry.json", ...catalog.items.map((item) => `${item.name}.json`)];

// Check deployed bytes against this build; a successful deployment status alone is insufficient.
for (let start = 0; start < files.length; start += 8) {
  await Promise.all(files.slice(start, start + 8).map(async (name) => {
    const url = `${registryUrl}/${name}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
    assert.equal(response.status, 200, `${url}: expected HTTP 200`);
    assert.match(response.headers.get("content-type") ?? "", /application\\/json/i, `${url}: expected JSON`);
    const actual = await response.json();
    const expected = JSON.parse(fs.readFileSync(path.join(output, name), "utf8"));
    (name === "registry.json" ? registrySchema : registryItemSchema).parse(actual);
    assert.deepEqual(actual, expected, `${url}: deployment differs from the current build`);
  }));
}
console.log(`Live registry verified: ${files.length} JSON endpoints match the current build.`);
''')

pkgpath = root / 'registry/package.json'
pkg = json.loads(pkgpath.read_text())
pkg['scripts']['registry:verify-live'] = 'node scripts/verify-live.mjs'
write('registry/package.json', json.dumps(pkg, indent=2) + '\n')

# The main CI keeps end-to-end all-item installs and adds isolated fresh consumers.
p = root / '.github/workflows/ci.yml'
s = p.read_text().replace('    runs-on: ubuntu-latest', '    runs-on: ubuntu-latest\n    timeout-minutes: 20', 1)
s = s.replace('      - name: Install docs dependencies', '''      - name: Verify isolated component and template consumers
        working-directory: registry
        run: |
          npm run consumer:verify -- vite --item=button
          npm run consumer:verify -- vite --item=calendar
          npm run consumer:verify -- next --item=dialog
          npm run consumer:verify -- next --item=blog-template

      - name: Install docs dependencies''')
write('.github/workflows/ci.yml', s)

# Make prerequisites visible wherever a component install command appears.
replace('docs/app/components/installation.tsx', '    <section className="installation-tabs">', '''    <section className="installation-tabs">
      <p>
        First installation? <a href="/docs/installation">Install the neobrutal-ui base first.</a>{" "}
        The base changes global theme variables; review it before adding to an existing project.
      </p>''')

write('docs/content/docs/installation.mdx', '''---
title: Installation
description: Install the design-system base, components, and named themes with the shadcn CLI.
---

## Requirements

Use React 19 and Tailwind CSS v4 in an initialized shadcn project. UI components support
Next.js and Vite. The page templates target the Next.js App Router.

```bash
npx shadcn@latest init
```

Choose Base UI if the CLI asks for a component library.

## Configure the namespace

Merge this entry into the `registries` object in your existing `components.json`; do not
replace the rest of that file.

```json
{
  "registries": {
    "@neobrutal-ui": "https://neobrutal-ui.andongmin.com/r/{name}.json"
  }
}
```

Manual configuration works before inclusion in the official shadcn Registry Directory.
Directory submission is not approval or a requirement for direct URL installation.

## Install the base once

The base adds shared dependencies, design tokens, Tailwind theme mappings, and global
`body` and border styles. It is a project-wide design-system installation, not a scoped skin
for a single widget.

For a new project, inspect and add the base before installing components:

```bash
npx shadcn@latest view @neobrutal-ui/neobrutal-ui
npx shadcn@latest add @neobrutal-ui/neobrutal-ui
```

For an existing project, commit local changes first and inspect the base before applying it.
Review the resulting `components.json`, global CSS, dependency, and utility-file changes.
Shared tokens can change existing screens. Individual components do not silently reinstall
the entire theme; they assume the base has already been installed or deliberately reproduced.

## Add components

```bash
npx shadcn@latest add @neobrutal-ui/button
npx shadcn@latest add @neobrutal-ui/dialog
```

Dependencies are resolved by the CLI. Component pages show a direct URL command and source
preview; the base prerequisite still applies to those commands.

## Choose a theme

Theme presets are ordinary catalog items. The base starts with yellow; switch explicitly:

```bash
npx shadcn@latest add @neobrutal-ui/theme-red
npx shadcn@latest add @neobrutal-ui/theme-yellow
```

A preset replaces the corresponding project-wide light and dark design tokens. Install one
preset at a time, not all themes together. Use `view` to inspect a preset before applying it.

## Direct URLs

The same installation works without namespace registration:

```bash
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/button.json
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/theme-red.json
```

## Templates

Templates install Next.js App Router pages and supporting components. Inspect their file
targets first, especially in an application that already has those routes.

```bash
npx shadcn@latest view @neobrutal-ui/blog-template
npx shadcn@latest add @neobrutal-ui/blog-template
```

## Manual installation and updates

Manual source copies still need the base tokens and declared dependencies. Registry files
belong to your application after installation; updates are not applied automatically.

```bash
npx shadcn@latest add @neobrutal-ui/button --dry-run
```

Review the proposed changes and preserve your local customizations before using `--overwrite`.
''')

p = root / 'docs/content/docs/button.mdx'
s = p.read_text()
s += '''

## Links styled as buttons

Use `Button` for actions. For navigation, style a native anchor or your router link with the
server-safe `buttonVariants` export. Base UI buttons enforce button semantics, even when
`nativeButton` is false.

```tsx
import { buttonVariants } from "@/components/ui/button-variants"

<a href="/about" className={buttonVariants({ variant: "outline", size: "sm" })}>
  About
</a>
```

For composition with another button component, use Base UI's `render` prop. `Button` does
not implement a separate `asChild` compatibility API.
'''
write('docs/content/docs/button.mdx', s)

logo = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><path d='M7 7h23v23H7z' fill='var(--foreground,currentColor)'/><path d='M2 2h23v23H2z' fill='var(--background,white)' stroke='var(--foreground,currentColor)' stroke-width='2'/><path d='M8 19V8l11 11V8' stroke='var(--foreground,currentColor)' stroke-width='3' stroke-linecap='square' stroke-linejoin='miter'/></svg>"
write('docs/public/logo.svg', logo + '\n')
entry = {'name': '@neobrutal-ui', 'homepage': 'https://neobrutal-ui.andongmin.com', 'url': 'https://neobrutal-ui.andongmin.com/r/{name}.json', 'description': 'Neobrutalist React components and Next.js templates built with Base UI and Tailwind CSS v4.', 'logo': logo}
write('registry/directory-entry.json', json.dumps(entry, indent=2) + '\n')
write('README.md', '''# neobrutal-ui

Neobrutalist React components, named themes, and Next.js page templates distributed as
editable source through the shadcn CLI.

[Documentation](https://neobrutal-ui.andongmin.com) ·
[Installation](https://neobrutal-ui.andongmin.com/docs/installation) ·
[Registry catalog](https://neobrutal-ui.andongmin.com/r/registry.json)

![neobrutal-ui component preview](docs/public/preview.png)

## What this project provides

Base UI interactions, Tailwind CSS v4 design tokens, explicit light/dark theme presets,
and blog, portfolio, CMS, and link-hub templates. Source is copied into your application;
there is no runtime `neobrutal-ui` package to wrap your app with.

This is an independently maintained derivative of
[ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components), not the
upstream project or an official shadcn project. The focus here is the installable catalog,
page templates, synchronized documentation, and consumer-install verification. Base UI and
Tailwind v4 alone are not claimed as differences from upstream.

## Quick start

Use React 19, Tailwind CSS v4, and an initialized shadcn project (`npx shadcn@latest init`).
UI components support Next.js and Vite; page templates target the Next.js App Router.

```bash
npx shadcn@latest view https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/button.json
```

**The base changes global CSS tokens and styles.** Review it before applying it to an
existing application. Components assume the base is installed; adding one component does
not silently reapply the entire theme.

For namespace installs, merge this into `components.json`:

```json
{
  "registries": {
    "@neobrutal-ui": "https://neobrutal-ui.andongmin.com/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @neobrutal-ui/dialog
npx shadcn@latest add @neobrutal-ui/theme-red
```

The namespace works with manual configuration before official directory inclusion. A
submission is not approval; direct URL installs do not need central registration.

For links that look like buttons, use a native anchor with the server-safe
`buttonVariants` from `@/components/ui/button-variants`, rather than rendering links
through the interactive `Button`.

## Development

Use Node.js 22.12 or newer within the Node 22 release line and npm.

```bash
cd registry
npm ci
npm run lint
npm run typecheck
npm run build
npm run registry:validate
npm run registry:check
npm run consumer:verify

cd ../docs
npm ci
npm run lint
npm run typecheck
npm run build
```

`registry/src` is the source of truth. The registry build generates `registry/public/r`,
copies JSON to `docs/public/r`, and synchronizes managed component/template sources into
`docs/src`. Do not hand-edit those generated copies. CI checks generated-file drift.

Isolated installs and deployment checks:

```bash
cd registry
npm run consumer:verify -- vite --item=button
npm run consumer:verify -- vite --item=calendar
npm run consumer:verify -- next --item=dialog
npm run consumer:verify -- next --item=blog-template
npm run registry:verify-live
npm run consumer:verify -- vite --item=dialog --registry-url=https://neobrutal-ui.andongmin.com/r
```

Consumer builds use strict TypeScript. These are installation/build checks, not a claim
of comprehensive browser, accessibility, or visual-regression coverage.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `registry/src` | Component, template, token, and catalog sources |
| `registry/scripts` | Build orchestration and registry/consumer checks |
| `docs` | Documentation application and synchronized previews |
| `registry/directory-entry.json` | Proposed shadcn directory metadata |

## License and attribution

MIT. Derived from `ekmas/neobrutalism-components`. The original copyright and license
notice is preserved in [LICENSE](LICENSE); retain it when redistributing derived code.
''')
write('registry/SUBMISSION.md', '''# shadcn Registry Directory submission

Proposed namespace: `@neobrutal-ui`.

`directory-entry.json` contains the proposed entry, including the inline SVG logo. The
same mark is available at `docs/public/logo.svg`. This file records preparation, not
acceptance into the official directory.

Before opening the upstream PR, run the repository CI and verify that the deployment
matches the generated catalog and every item:

```bash
cd registry
npm run registry:verify-live
npm run consumer:verify -- vite --item=dialog --registry-url=https://neobrutal-ui.andongmin.com/r
```

Add the object from `directory-entry.json` to
`shadcn-ui/ui:apps/v4/registry/directory.json`, keeping the list alphabetically ordered.
Run `pnpm validate:registries` in the upstream checkout, then open a PR to `main`.

Suggested title: `feat(registry): add @neobrutal-ui`

Suggested description:

> Adds @neobrutal-ui, an open-source neobrutalist React component and Next.js template
> registry built with Base UI and Tailwind CSS v4. It is an independently maintained
> derivative of ekmas/neobrutalism-components under MIT, with attribution preserved.
> The registry publishes a flat catalog, content-free discovery metadata, named theme
> presets, and full source in individual item JSON files. Installation requires an
> explicit design-system base step; the documentation describes global CSS effects.

Include links to the actual passing CI and live-install results. Do not claim an upstream
validator, browser audit, or official acceptance that has not been observed.
''')
print('Readiness source changes applied; generated registry/docs files must now be rebuilt.')
