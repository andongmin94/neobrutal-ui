# neobrutal-ui docs

Fumadocs MDX documentation and live React previews, built with React Router and Vite.

## Develop

Install both projects from the repository root, then generate the shared registry artifacts:

```bash
npm ci --prefix registry
npm ci --prefix docs
npm run build --prefix registry
npm run dev --prefix docs
```

Work on `main` by default, following the root `AGENTS.md`.

## Source ownership

`../registry/src` owns the installable components and theme definition. Its build synchronizes
components, template sources, public registry JSON, shared theme modules, generated theme CSS,
and component descriptions into docs. Do not edit those generated copies independently.

The theme customizer, stylesheet export, and default docs tokens use the same theme functions.
Customizer changes are scoped to the preview, not stored in the documentation shell.

Markdown typography is applied through the explicit `md-*` classes in the MDX renderer.
Do not add selectors such as `.docs-content p` or `.docs-content li`: they also match live
component markup and change the demonstration of the installed source.

## Verify

After regenerating registry artifacts, run:

```bash
cd docs
npm run lint
npm run typecheck
npm run build
npm test
npx playwright install --with-deps chromium
npm run test:browser
```

Contract tests check palette exports, synchronized sources, default stylesheet generation,
directory metadata, preview registrations, typography boundaries, internal links and includes,
every component's manual files and package dependencies, and every Usage example against the
installed component types.

Playwright visits every content route in desktop and mobile light/dark Chromium. It checks
navigation, keyboard interaction, clipboard success and failure, motion controls, popup focus,
page overflow, every chart source dialog, all star and palette previews, and automated axe scans.
The browser suite starts the built static site automatically.

To check an existing deployment rather than the local build:

```bash
DOCS_TEST_URL=https://neobrutal-ui.andongmin.com npm run test:browser
```

The suite saves failure screenshots, traces, and an HTML report under `test-results` and
`playwright-report`; CI uploads them as artifacts. Passing this automated Chromium suite is not
cross-browser certification or a manual pixel-by-pixel visual approval.

## Deployment

Vercel uses `docs` as its root, the Vite framework preset, `npm run build`, and `build/client`
as its output. These settings are also in `vercel.json`. React Router prerenders the content
routes; Fumadocs builds the static Orama search index. `public/r` serves the registry from the
same deployment.
