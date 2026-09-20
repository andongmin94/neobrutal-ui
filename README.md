# neobrutal-ui

**Bold by design. Clear in use.**

Neobrutalist React UI for building interfaces with clear actions, selection, and feedback.
Raised buttons press down in stages; shared colors, borders, and shadows keep the pieces together.
Install components, themes, and page templates with the shadcn CLI and edit the source in your project.

[Documentation](https://neobrutal-ui.andongmin.com/docs) ·
[Installation](https://neobrutal-ui.andongmin.com/docs/installation) ·
[Component directory](https://neobrutal-ui.andongmin.com) ·
[Try the CMS demo](https://neobrutal-ui.andongmin.com/templates/cms)

![neobrutal-ui component preview](docs/public/preview.png)

## Quick start

Use React 19, Tailwind CSS v4, and an initialized shadcn project.
Choose Base UI if `shadcn init` asks which component library to use.

```bash
npx shadcn@latest init
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/button.json --overwrite
```

The first-button command replaces the default button that `init` may have created.
Commit an existing customized button before using `--overwrite`; it replaces the selected files.
Subsequent installs do not need to overwrite your customizations.

Then render your first component:

```tsx
import { Button } from "@/components/ui/button";

export default function Example() {
  return <Button>Click me</Button>;
}
```

A button with a bold border and hard shadow means the setup worked.
Browse the [component directory](https://neobrutal-ui.andongmin.com) to add more pieces.

## See the pieces working together

Open the [CMS demo](https://neobrutal-ui.andongmin.com/templates/cms) to search, filter, select,
and edit posts in one screen. Preview the content, save a local version, or discard changes.
It demonstrates how the controls fit together, not a hosted CMS.
Edits stay in memory for the current page view and reset on refresh. Connect your own data and
save handler before using it in an application.

Our [interaction rules](https://neobrutal-ui.andongmin.com/docs#interaction-rules) explain when
to use raised actions, persistent selection, visible focus, and simple containers.

## Adding neobrutal-ui to an existing project

The shared base updates project-wide colors, borders, shadows, and global styles.
Commit your current work first, then inspect the base before installing it:

```bash
npx shadcn@latest view https://neobrutal-ui.andongmin.com/r/neobrutal-ui.json
```

Compositions follow your configured component and utility aliases. Adding a template or recipe
does not reinstall the base theme. Page routes still target the Next.js App Router.

## Optional: shorter install commands

Direct URLs work without extra configuration.
To use shorter commands such as `@neobrutal-ui/dialog`, add this entry to the existing
`registries` object in `components.json`:

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

## Themes, templates, and charts

The shared base starts with **Mono**: cool white and graphite in light mode, cool charcoal and
pale silver in dark mode. Muted blue, sage, and earth-toned chart colors keep data series distinct.
The same palette is available as `theme-mono`; the colorful presets, including yellow, remain
optional. Install one named theme to replace the project-wide light and dark colors.
Page templates target the Next.js App Router; regular UI components support Next.js and Vite.

The blog combines topic filters, search, and sorting. The portfolio includes expandable case
studies. The CMS has a local editor with reading preview and save/discard controls. The link hub
groups destinations by intent and includes an explicit contact action. Gallery thumbnails
render the same current template components rather than separate screenshot assets.

The [chart workbench](https://neobrutal-ui.andongmin.com/charts) includes eight independently
installable recipes: revenue targets, signup conversion, response-time budgets, release activity,
delivery capacity, paired build durations, work allocation, and sequential installation traces.
Each pairs controls with calculated summaries and an exact data table. All chart data is illustrative.

## Development

Use Node.js 22.12 or newer within the Node 22 release line and npm. From the repository root:

```bash
npm ci --prefix registry
npm ci --prefix docs
npm run build --prefix registry
npm run dev --prefix docs
```

`registry/src` is the source of truth. The registry build generates installation JSON and
synchronizes components, templates, theme modules, theme CSS, and catalog descriptions into docs.
Generated paths are ignored by Git: rebuild them instead of editing or committing copies.
The documentation site uses React Router, Vite, and Fumadocs MDX. Preview modules are discovered
from `docs/src/examples/ui`; `_`-prefixed files are helpers. Markdown styling uses explicit
`md-*` classes so document typography cannot accidentally restyle live component previews.

`format` writes fixes; `lint` only checks files. During implementation, format changed source
and run its focused tests. Before publishing, execute the complete sequence in
[Verify](.github/workflows/ci.yml), including schema/contracts, type and asset checks, all
independent component installations, browser suites, and clean generation. The release scope
and evidence limits are defined in [QUALITY.md](QUALITY.md); contributor rules are in
[AGENTS.md](AGENTS.md).

For the complete isolated installation matrix after building the registry:

```bash
node registry/scripts/verify-independent-items.mjs
```

Every file-bearing item is installed into its own fresh project with only its declared
dependencies and the explicit base. Components and recipes are checked in Next.js and Vite;
page templates are checked in Next.js. The existing-project integration check separately tests
custom aliases, selected themes, application CSS, and customized components without docs CSS:

```bash
npm run consumer:verify --prefix registry -- --integration
```

## Deployment

Vercel uses `docs` as its root and `build/client` as output. `docs/vercel.json` installs both
projects and builds the registry before the documentation. The generated registry is served
from `/r`; no separate registry server or npm release is required. Set `REGISTRY_BASE_URL`
before building only when hosting registry dependencies at another origin.

The production Verify job checks the exact deployed commit, security headers, live catalog,
representative fresh installs, and cross-browser behavior. Both jobs must pass for the final
commit. Directory metadata is prepared in `registry/directory-entry.json`; official submission
is a separate owner decision, not an automatic consequence of a successful build.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `registry/src` | Component, template, token, and catalog sources |
| `registry/scripts` | Build and installation checks |
| `docs` | Documentation site and live previews |
| `registry/directory-entry.json` | Proposed shadcn directory metadata |

## License

[MIT](LICENSE). Keep the copyright and permission notices in `LICENSE` with redistributed
copies or substantial portions of the source.
