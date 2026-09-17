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

Component previews are discovered from `src/examples/ui`. Files beginning with `_` are helpers;
all other TSX files are previews with a default export. The shared preview registry and contract
tests reject duplicate, undocumented, or ambiguously named previews.

## Verify

After regenerating registry artifacts, run:

```bash
cd docs
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

`format` applies Oxlint/Oxfmt fixes. `lint` only checks and never rewrites source files.

Contract tests check palette exports, synchronized sources, default stylesheet generation,
directory and registry parity, preview source ownership, typography boundaries, internal links
and includes, every component's manual files and package dependencies, every Usage example
against the installed component types, and the source revision embedded in the built site.

The Chromium suite visits every route in desktop/mobile light/dark modes and exercises the full
interaction and axe coverage. Firefox and WebKit visit every route for runtime, lazy-loading,
image, and horizontal-overflow failures and repeat representative keyboard, focus, reflow,
text-spacing, and accessibility checks. Asset budgets and immutable generated files are enforced
before deployment.

To check an existing deployment rather than the local build:

```bash
DOCS_TEST_URL=https://neobrutal-ui.andongmin.com npm run test:browser
DOCS_TEST_URL=https://neobrutal-ui.andongmin.com npm run test:browser:cross
npm run verify:headers
```

The suites save failure screenshots, traces, and HTML reports under `test-results`,
`playwright-report`, and `playwright-report-cross`; CI uploads them as artifacts. Browser coverage
uses Playwright engines on Linux and does not claim every physical browser/device combination.

## Deployment

Vercel uses `docs` as its root, the Vite framework preset, `npm run build`, and `build/client`
as its output. These settings are also in `vercel.json`. React Router prerenders the content
routes; Fumadocs builds the static Orama search index. `public/r` serves the registry from the
same deployment.

Each build writes `build/client/build-info.json` with its source commit. Deployment verification
waits for that exact commit before checking security headers, the live registry, fresh production
consumers, and all three browser engines, so docs-only changes cannot validate an older deploy.
