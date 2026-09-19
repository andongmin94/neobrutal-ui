# Release gates

This file defines the supported release checks, not a running work diary. Execution evidence belongs to the Verify run and artifacts for the exact source commit. Passing code checks does not authorize official shadcn directory submission.

## Supported product

React 19 and Tailwind CSS v4. Components and analytical recipes support Next.js and Vite; page templates use the Next.js App Router. The shared base is an explicit installation step. Subsequent compositions must preserve custom aliases, the selected theme, application CSS, and customized components.

Registry sources, documentation previews, displayed source, and installation JSON must agree. Templates inherit application tokens; gallery presets belong only to docs. CMS data is local to the page and resets on refresh. Chart data is illustrative. Stars and obsolete routes are not supported.

## Required checks

| Gate | Evidence |
| --- | --- |
| Form and search correctness | `form-composition.spec.ts`, `search-recovery.spec.ts`, existing foundation tests: optional IDREFs, custom IDs, refs/events, independent error recovery, failed index loading, retry, composition-key handling and focus return. |
| Independent installation | `verify-independent-items.mjs` derives every file-bearing item from the built catalog. Each item receives fresh dependencies and source directories; both supported frameworks are built independently. Templates are checked in Next.js only. Aggregate and existing-project checks remain separate. |
| Product presentation and input | Full documentation/preview suite on desktop light and mobile dark; cross-browser/reflow suite; all-palette button/error contrast; shared focus tokens; native slider and panel keyboard/pointer checks; chart and template state tests; installed-consumer captures without docs CSS. |
| Reproducibility and deployment | Lint/types/build/contracts/budgets, byte-identical generated output, unchanged source tree, exact deployed commit, live catalog, production installs and deployed browser checks. |

The supported examples are enumerated by the preview and catalog contracts. Add a concrete case when behavior changes; do not grow an unbounded release checklist of hypothetical features. A failed check must be fixed, not skipped or reclassified as passing.

## Evidence limits

Browser-engine keyboard/touch tests and composition events are not physical-device, operating-system IME, or screen-reader sessions. Those manual checks remain unverified unless their device, conditions, and results are recorded. Automated axe results are not a comprehensive accessibility certification. Captures show only the recorded routes, themes and states; a screenshot existing is not evidence that it was visually reviewed.

## Running checks

Use the commands in `.github/workflows/ci.yml` as the canonical release sequence. During development, format changed sources and run the relevant test files first. Batch related fixes before the full release run. Do not repeatedly cancel the full matrix for cosmetic follow-up commits.

Installation artifacts contain item-level results and logs. Browser failures include traces and screenshots. Check both `verify` and `verify-deployment` on the final commit before reporting release checks complete.
