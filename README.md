# neobrutal-ui

**Source-first neobrutalist UI for React, distributed as a shadcn registry.**

[![Verify](https://github.com/andongmin94/neobrutal-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/andongmin94/neobrutal-ui/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/andongmin94/neobrutal-ui?style=flat-square)](https://github.com/andongmin94/neobrutal-ui/stargazers)
[![MIT License](https://img.shields.io/badge/license-MIT-111111?style=flat-square)](LICENSE)

Built with **React 19**, **Base UI**, and **Tailwind CSS v4**. Install the source with the shadcn CLI,
then edit it as application code: no runtime package and no separate registry server.

[Documentation](https://neobrutal-ui.andongmin.com/docs) ·
[Components](https://neobrutal-ui.andongmin.com) ·
[Charts](https://neobrutal-ui.andongmin.com/charts) ·
[Templates](https://neobrutal-ui.andongmin.com/templates) ·
[Styling](https://neobrutal-ui.andongmin.com/styling)

## What is included

| Surface | Current direction |
| --- | --- |
| Components | Editable controls and compositions with tactile borders, shadows, focus, selection, and feedback states |
| Themes | Cool **Mono** by default, optional **Mono Warm**, plus color presets with light and dark modes |
| Charts | 8 installable analytical recipes with controls, calculated summaries, tooltips, and exact data tables |
| Templates | Blog, portfolio, local CMS, and link hub pages for the Next.js App Router |
| Tooling | Direct registry URLs, optional `@neobrutal-ui/*` namespace, source previews, and isolated installation checks |

The design goal is not decorative brutalism. Raised actions should feel pressable, selection should
stay distinct from hover, keyboard focus should be obvious, and dense screens should still scan cleanly.

## Quick start

Start from a shadcn project using Base UI:

```bash
npx shadcn@latest init
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/button.json --overwrite
```

`neobrutal-ui.json` installs the shared base: theme variables, global styles, utilities, and core
dependencies. The first Button install may replace the button created by `shadcn init`; commit an
existing customized button before using `--overwrite`.

Then use the installed source normally:

```tsx
import { Button } from "@/components/ui/button";

export default function Example() {
  return <Button>Click me</Button>;
}
```

## Optional: shorter install commands

Direct URLs always work. For namespaced commands, add this to the existing `registries` object in
`components.json`:

```json
{
  "registries": {
    "@neobrutal-ui": "https://neobrutal-ui.andongmin.com/r/{name}.json"
  }
}
```

Then install by name:

```bash
npx shadcn@latest add @neobrutal-ui/dialog
npx shadcn@latest add @neobrutal-ui/theme-mono-warm
npx shadcn@latest add @neobrutal-ui/chart-release-activity
```

## Themes

**Mono** is the default: cool near-white and graphite in light mode, cool charcoal and pale silver
in dark mode. Data visualization keeps restrained blue, sage, earth, and violet accents so charts
remain readable without turning the interface colorful.

**Mono Warm** preserves the earlier milkier off-white / softer charcoal treatment as an optional
preset. The remaining color themes are also optional and replace the same shared tokens.

Open the [styling workbench](https://neobrutal-ui.andongmin.com/styling) to compare presets and
export the corresponding theme.

## Charts

The [chart workbench](https://neobrutal-ui.andongmin.com/charts) currently ships eight independent
recipes covering revenue targets, signup conversion, service latency, release activity, delivery
capacity, build duration, work allocation, and install diagnostics.

Each recipe is source-editable and keeps its controls, visual summary, explanatory copy, and exact
data table together. Sample values are illustrative, not live telemetry.

## Templates

The template gallery contains four page-level compositions:

- **Blog** — search, topic filters, sorting, article cards, and post pages.
- **Portfolio** — project summaries and expandable case studies.
- **CMS** — local search/filter/editor/preview flow with explicit save and discard feedback.
- **Link hub** — grouped destinations and a clear contact action.

Installed templates inherit the consumer project's theme tokens; gallery presets are documentation
presentation only.

## Existing projects

The shared base changes project-wide colors, borders, shadows, and global styles. Inspect it before
adding it to an established application:

```bash
npx shadcn@latest view https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
```

Component and recipe installs respect configured aliases. Follow-up installs do not reinstall the
base theme, and the verification suite checks that customized components and application CSS survive
subsequent additions.

## Development

Use Node.js 24+ and npm:

```bash
npm ci --prefix registry
npm ci --prefix docs
npm run build --prefix registry
npm run dev --prefix docs
```

`registry/src` is the source of truth. Registry builds generate shadcn JSON and synchronize managed
component/template/theme data into the docs app. Do not hand-edit generated copies.

Useful verification commands:

```bash
npm run lint --prefix registry
npm run typecheck --prefix registry
npm run lint --prefix docs
npm run typecheck --prefix docs
npm run test:browser --prefix docs
node registry/scripts/verify-independent-items.mjs
```

The canonical release sequence is [.github/workflows/ci.yml](.github/workflows/ci.yml). It verifies
registry contracts, builds, budgets, browser behavior, independent installs, existing-project
integration, clean generation, the exact production commit, live registry endpoints, and deployed
cross-browser smoke tests. Finite release gates and evidence limits are documented in
[QUALITY.md](QUALITY.md).

## Repository layout

| Path | Responsibility |
| --- | --- |
| `registry/src` | Installable components, recipes, templates, tokens, and catalog data |
| `registry/scripts` | Registry generation and isolated consumer checks |
| `docs/src/site` | Fumapress documentation shell and site-specific UI |
| `docs/src/examples` | Published interactive examples |
| `docs/tests` | Browser, interaction, reflow, and release regressions |
| `registry/directory-entry.json` | Prepared shadcn directory metadata |

## Directory status

The public registry is production-tested and the directory metadata is prepared. Submission to the
official shadcn directory is an explicit maintainer action; passing CI does not submit automatically.

## License

[MIT](LICENSE). Keep the copyright and permission notices in `LICENSE` with redistributed copies or
substantial portions of the source.
