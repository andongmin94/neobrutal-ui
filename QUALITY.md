# Release gates

This file defines the supported release checks, not a running work diary. Execution evidence belongs to the Verify run and artifacts for the exact source commit. Passing code checks does not authorize official shadcn directory submission.

## Supported product

React 19 and Tailwind CSS v4. Components and analytical recipes support Next.js and Vite; page templates use the Next.js App Router. The shared base is an explicit installation step. Subsequent compositions must preserve custom aliases, the selected theme, application CSS, and customized components.

Registry sources, documentation previews, displayed source, and installation JSON must agree. Templates inherit application tokens; gallery presets belong only to docs. CMS data is local to the page and resets on refresh. Chart data is illustrative. Stars and obsolete routes are not supported.

## Verification coverage

Pushes and pull requests run the core source, build, contract, registry, representative installation and browser checks. The comprehensive checks below are available through **Actions → Verify → Run workflow → comprehensive** for release reviews and broad component changes; they do not run automatically on every commit.

| Gate | Evidence |
| --- | --- |
| Form and search correctness | `form-composition.spec.ts`, `search-recovery.spec.ts`, existing foundation tests: optional IDREFs, custom IDs, refs/events, independent error recovery, failed index loading, retry, composition-key handling and focus return. |
| Independent installation | `verify-independent-items.mjs` derives every file-bearing item from the built catalog. Each item receives fresh dependencies and source directories; both supported frameworks are built independently. Templates are checked in Next.js only. Aggregate and existing-project checks remain separate. |
| Documentation and installed examples | Catalog-derived document coverage; `api-contract.test.ts` compares public literal parameter/CVA defaults and variant values with canonical source, and documented inherited literal defaults with installed native API tags; `docs-contract.test.ts` and `preview-contract.test.ts` compile every Usage block and published preview against its documented installation, including helper files and packages. In-memory negative cases must reject default drift, missing installs/helpers, and invalid preview props. |
| Product presentation and input | Full documentation/preview suite on desktop light and mobile dark; scoped captures of published examples and opened states in `preview-states.spec.ts`; cross-browser/reflow suite; all-palette button/error contrast; shared focus tokens; native slider and panel keyboard/pointer checks; chart, template, reduced-motion and data-table feedback states; installed-consumer captures without docs CSS. |
| Reproducibility and deployment | Lint/types/build/contracts/budgets, byte-identical generated output, unchanged source tree, complete registry endpoints and consumer installs on localhost, exact deployed commit and core production smoke checks. |

The supported examples are enumerated by the preview and catalog contracts. Add a concrete case when behavior changes; do not grow an unbounded release checklist of hypothetical features. A failed check must be fixed, not skipped or reclassified as passing.

The documentation scope follows the built catalog and all published examples, including secondary previews. New documents, explicit wrapper defaults and example blocks must enter the existing checks automatically. Literal parameter/CVA defaults are read from the implementation rather than duplicated in a test checklist. Native literal defaults are read from public prop types' `@default` tags when the API table states a literal, with wrapper overrides taking precedence. Untagged native defaults, calculated values and recipe state remain separately classified; section presence or successful compilation does not verify prose about their behavior.

The visual review is finite: inspect the published examples and relevant opened, selected, empty, error and disabled states at the recorded desktop/light and mobile/dark sizes. Review shared palette behavior separately rather than multiplying every screen by every palette. Recheck changed surfaces after a fix; unrelated new feature ideas do not extend this release scope.

## Evidence limits

Browser-engine keyboard/touch tests and composition events are not physical-device, operating-system IME, or screen-reader sessions. Those manual checks remain unverified unless their device, conditions, and results are recorded. Automated axe results are not a comprehensive accessibility certification. Captures show only the recorded routes, themes and states; a screenshot existing is not evidence that it was visually reviewed.

Report the verified document, Usage, preview, source-default and native-default counts separately from repeated browser and palette cases. Keep original failures distinct from unchanged reruns. Release completion means the defined gates passed on the final commit; further audit findings must be checked against those gates and added as a concrete regression when coverage was missing.

## Running checks

Use the commands in `.github/workflows/ci.yml` as the canonical release sequence. During development, format changed sources and run the relevant test files first. Batch related fixes before the full release run. Do not repeatedly cancel the full matrix for cosmetic follow-up commits.

The docs use mount effects at hydration boundaries and effects that synchronize external route, theme, heading and asynchronous source state. Only those files and the isolated primitive fixture have an explicit exception to the React Compiler `set-state-in-effect` recommendation in `docs/.oxlintrc.json`. The rule remains enabled elsewhere, render purity remains checked, and lint still denies warnings. Calendar dates are initialized lazily instead of being recomputed during render.

The default `verify` job covers dependency audits, lint/types, registry schema and source consistency, documentation builds and contracts, asset budgets, fresh dialog installs in Vite and Next.js, and clean generation. Its browser commands run `docs.spec.ts`, `local-registry.spec.ts`, `analytics.spec.ts`, `runtime-recovery.spec.ts`, `sidebar-shortcut.spec.ts` and `search-recovery.spec.ts` on desktop light and mobile dark, covering navigation, form submission, dialogs, keyboard selection, preview-tab wrapping and focus, styling, all 82 served registry endpoints, analytics activation, blocked theme storage, recovery after preview and full-text index failures, search hydration/IME handling and Sidebar shortcut ownership. Sidebar shortcuts act within the focused provider, including its mobile Sheet, and leave editable fields, composition and cancelled events with their controls. Targeted cases from `component-review.spec.ts` and `galleries.spec.ts` also verify named keyboard scrolling and Marquee pause/resume labels and animation states. Analytics tests intercept the canonical hostname and beacon script and serve them locally; they do not send production events. Consumer checks use local registry servers.

The default job also runs the Dialog modal/nonmodal cases, Select focus cases (including the default light theme), and the template consumer-data cases. These verify external Blog/Link Hub data updates and the template detail installation command. Command examples keep their own navigation shortcuts ahead of documentation handlers, and the Progress case checks indeterminate visibility with normal and reduced motion. Avatar cases verify that status badges remain visible beside circular images and fallbacks at all three sizes. Chart contracts check independent color scopes and native IDs, while the theme contract includes shared CSS imports. README setup and rendered existing-project integration run in Vite on every push and pull request, using the local registry with the documented namespace commands and checking Chromium, Firefox, and WebKit.

Navigation Menu cases from `primitive-overflow.spec.ts` also run in the default job. They verify a persistent current-page indicator and scrolling through long link groups in short viewports with pointer and keyboard input, using the installable components without documentation layout styles.

Carousel cases from `component-composition.spec.ts` and `release-controls.spec.ts` verify horizontal and vertical arrow shortcuts, consumer cancellation, and keyboard ownership for inputs inside slides.

After verifying and building the registry, this job uses `npm run build:site` in `docs` to generate chart sources, write the exact build marker, and build Fumapress against the synchronized registry. The standalone `npm run build` still installs and builds the registry first, so Cloudflare Builds and local clean builds remain self-contained. The clean-generation check intentionally rebuilds generated output to verify reproducibility.

For a comprehensive run, select the `comprehensive` input in the Verify workflow. This also enables Next.js README/existing-project integrations, aggregate consumers, official directory validation, all independent installation shards, and the full `verify-browsers` matrix: desktop light, mobile dark, Chromium reflow, Firefox desktop and WebKit mobile. All browser configurations start the built documentation on localhost; `DOCS_TEST_URL` cannot redirect full or core tests to production.

On pushes to `main`, `verify-deployment` independently waits for the exact production commit, the home HTML, and its emitted same-origin JavaScript modules to return the correct content types. It uses bounded HEAD batches for those modules and a shared five-minute deadline before running only `tests/smoke/deployment.spec.ts` in one Chromium worker with no retries. Source checks and dependency audits remain blocking checks in `verify`; a failed audit remains visible even when the deployed site passes smoke tests. Its three cases cover the home demo and installation navigation, canonical metadata during client navigation, dialog hydration/focus, and exactly three registry endpoints (catalog, shared styles and dialog). It does not rerun the full browser matrix or install consumers from production. Run `npm run test:browser:smoke --prefix docs` against a local build during development; only the dedicated smoke configuration accepts `DOCS_TEST_URL`.

The `docs-review-*` artifacts retain comprehensive per-project local results and scoped state images; `production-smoke` retains the small production report. Full traces and videos are retained for failures, not duplicated for every successful run. Installation artifacts contain item-level results and logs. Report core checks and comprehensive release checks separately; a skipped comprehensive job is not a passed test.

## Static hosting

Cloudflare Workers serves `docs/dist/public` using `docs/wrangler.jsonc`. The build runs in the `docs` directory with Node.js 24 and `npm run build`; deployment uses `npm run deploy:cloudflare` with the pinned Wrangler version. Workers Builds selects the framework's native Cloudflare adapter automatically and provides `WORKERS_CI_COMMIT_SHA` for the exact build marker. Normal local and GitHub builds keep the Node adapter used by `fumapress start`.

The static configuration drops trailing slashes and serves the generated `404.html` for missing paths. It does not rewrite missing routes to the home page. Published output includes nested HTML routes, `RSC/R/*.txt` navigation payloads, `/api/search.json`, registry JSON and hashed assets. `docs/public/_headers` gives the search index its JSON content type and marks only hashed assets immutable; HTML, RSC and registry responses retain normal revalidation.

The same headers apply content-type, referrer, framing and unused browser-permission protections. The CSP limits base URLs, object embeds and framing without restricting the framework's inline boot scripts or analytics. Only `workers.dev` hostnames receive `X-Robots-Tag: noindex`; the canonical production hostname remains indexable. Per-page canonical and Open Graph URLs use the framework's absolute URL helper, and `robots.txt` advertises the existing sitemap. `seo-contract.test.ts` checks every sitemap page's built metadata and the published robots file.

## Web Analytics

The documentation loads Cloudflare's official Web Analytics module beacon once on the canonical production hostname. Local development, preview hostnames and automated browsers do not load it. Cloudflare's native SPA tracking handles client navigation; the app sends no custom events or form values. Cloudflare Web Analytics does not log query strings. Configure the site's dashboard setting for manual JS snippet installation so automatic injection does not duplicate the guarded beacon. The site token is public and requires no runtime secret.
