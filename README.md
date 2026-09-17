# neobrutal-ui

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

Use Node.js 22.12 or newer within the Node 22 release line and npm. `format` writes fixes;
`lint` is a non-mutating CI check.

```bash
cd registry
npm ci
npm run format
npm run lint
npm run typecheck
npm run build
npm run registry:validate
npm run registry:check
npm run consumer:verify

cd ../docs
npm ci
npm run format
npm run lint
npm run typecheck
npm run build
npm run check:budget
npm test
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:browser:cross
```

`registry/src` is the source of truth. The registry build generates `registry/public/r`,
copies JSON to `docs/public/r`, and synchronizes managed component/template sources into
`docs/src`. Do not hand-edit those generated copies. CI checks generated-file drift.

Production verification checks the deployed commit, security headers, all registry endpoints,
one Vite component install, one Next.js template install, and representative Chromium,
Firefox, and WebKit behavior. Local CI keeps exhaustive route and interaction coverage in
Chromium while the other engines focus on browser-specific behavior and 320px reflow.

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
