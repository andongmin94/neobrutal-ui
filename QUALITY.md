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

The default `verify` job covers dependency audits, lint/types, registry schema and source consistency, documentation builds and contracts, asset budgets, fresh dialog installs in Vite and Next.js, and clean generation. Its browser command runs `docs.spec.ts`, `local-registry.spec.ts` and `analytics.spec.ts` on desktop light and mobile dark: 20 cases covering navigation, form submission, dialogs, keyboard selection, styling, all 82 served registry endpoints, and analytics activation. Analytics tests intercept the canonical hostname and beacon script and serve them locally; they do not send production events. Consumer checks use local registry servers.

For a comprehensive run, select the `comprehensive` input in the Verify workflow. This also enables README/existing-project integrations, aggregate consumers, official directory validation, all independent installation shards, and the full `verify-browsers` matrix: desktop light, mobile dark, Chromium reflow, Firefox desktop and WebKit mobile. All browser configurations start the built documentation on localhost; `DOCS_TEST_URL` cannot redirect full or core tests to production.

On pushes to `main`, `verify-deployment` waits for the core `verify` job, verifies the exact production commit and runs only `tests/smoke/deployment.spec.ts` in one Chromium worker with no retries. Optional comprehensive jobs do not block this core gate by being skipped. Its three cases cover the home demo and installation navigation, dialog hydration/focus, and exactly three registry endpoints (catalog, shared styles and dialog). It does not rerun the full browser matrix or install consumers from production. Run `npm run test:browser:smoke --prefix docs` against a local build during development; only the dedicated smoke configuration accepts `DOCS_TEST_URL`.

The `docs-review-*` artifacts retain comprehensive per-project local results and scoped state images; `production-smoke` retains the small production report. Full traces and videos are retained for failures, not duplicated for every successful run. Installation artifacts contain item-level results and logs. Report core checks and comprehensive release checks separately; a skipped comprehensive job is not a passed test.

## Static hosting

Cloudflare Workers serves `docs/dist/public` using `docs/wrangler.jsonc`. The build runs in the `docs` directory with Node.js 24 and `npm run build`; deployment uses `npm run deploy:cloudflare` with the pinned Wrangler version. Workers Builds selects the framework's native Cloudflare adapter automatically and provides `WORKERS_CI_COMMIT_SHA` for the exact build marker. Normal local and GitHub builds keep the Node adapter used by `fumapress start`.

The static configuration drops trailing slashes and serves the generated `404.html` for missing paths. It does not rewrite missing routes to the home page. Published output includes nested HTML routes, `RSC/R/*.txt` navigation payloads, `/api/search`, registry JSON and hashed assets. `docs/public/_headers` gives the extensionless search index its JSON content type and marks only hashed assets immutable; HTML, RSC and registry responses retain normal revalidation.

## Web Analytics

The documentation loads Cloudflare's official Web Analytics module beacon once on the canonical production hostname. Local development, preview hostnames and automated browsers do not load it. Cloudflare's native SPA tracking handles client navigation; the app sends no custom events or form values. Cloudflare Web Analytics does not log query strings. Configure the site's dashboard setting for manual JS snippet installation so automatic injection does not duplicate the guarded beacon. The site token is public and requires no runtime secret.
