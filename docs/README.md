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
and component descriptions into docs. These generated paths are ignored by Git; never edit or
force-add them. A clean checkout must build the registry before checking or starting docs.

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
node ../registry/scripts/verify-generated.mjs
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:browser:cross
```

`format` applies Oxlint/Oxfmt fixes. `lint` only checks and never rewrites source files.
The clean-generation check removes disposable outputs and rebuilds them, comparing the complete
file set and SHA-256 hashes before and after. It also checks that the docs publish byte-identical
registry JSON. It refuses to delete any tracked source file. Contract tests separately compare
all managed component, template, and theme copies to their authoritative sources.

The exhaustive Chromium suite visits every route and exercises the full interaction and axe
coverage once on desktop light and once on mobile dark. The compact cross-browser suite repeats
representative runtime, keyboard, focus, reflow, text-spacing, and accessibility checks in
Firefox, WebKit, and a 320px Chromium viewport. CI also enforces asset budgets, clean generation,
and unchanged tracked sources without repeating every functional test for color-scheme-only variants.

To check an existing deployment, generate the local registry inputs first, then run:

```bash
DOCS_TEST_URL=https://neobrutal-ui.andongmin.com npm run test:browser:cross
npm run verify:headers
```

Failure artifacts contain traces, screenshots, and separate HTML reports under `test-results`,
`playwright-report`, and `playwright-report-cross`. Production verification waits for the exact
source commit before checking headers, registry endpoints, representative installs, and the
cross-browser smoke suite.

## Deployment

Vercel uses `docs` as its root and the Vite framework preset. The checked-in `vercel.json`
installs both projects and builds the registry before building docs. `build/client` is the output.
React Router prerenders the content routes, Fumadocs builds the static search index, and the
freshly generated `public/r` serves the registry from the same deployment. No generated registry
files need to be committed or maintained as a second source of truth.
