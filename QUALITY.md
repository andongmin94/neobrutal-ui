# Product readiness

Official shadcn directory submission is not approved by this work. Implemented code, executed checks, and remaining review are separate statuses. Use the Verify run attached to the exact commit as the execution record.

## Foundation

The standalone Stars collection and its routes, catalog entries, sources, and generator are removed. No compatibility routes are retained. The button API uses neutral instead of a duplicate secondary variant. Form provider and child-composition diagnostics are explicit. Focus and error text use shared tokens. Gallery presets remain docs-only; installed templates inherit the application's theme.

The README and introduction no longer foreground derivative-project background. LICENSE, Credits & license, and the short attribution notice remain intact.

The templates include combined blog filters and sorting, local CMS save/discard and plain-text preview, expandable portfolio cases, and categorized profile links. CMS edits reset on refresh; it is not a publishing backend.

## Current product work

Template thumbnails now render scaled, inert previews of the current template components. Navigation uses a separate overlay link. The old PNG assets and preview metadata are removed. Verify #217 completed documentation, source, aggregate/individual consumer builds, Chromium, and cross-browser checks for commit 67821b3a5499cc056dd4d83c81c7725e9fc7f193. This does not verify later chart changes.

The 47 docs-only chart reference examples have been replaced, not retained as alternate implementations. Eight installable recipes now cover revenue targets, signup conversion, latency budgets, release counts/shares, delivery variance, paired build duration, work allocation, and sequential installation traces. Each uses registry-owned source, documented controls, calculated summaries, a labeled data table, and no plot entrance animation. Consolidation is not a claim that all former examples were individually redesigned.

Chart metadata is maintained with the registry definitions. Gallery source is generated from synchronized installed files. Contracts compare source, generated mirror, displayed source, and built JSON. The consumer matrix derives all analytical-chart names from the built catalog, so new charts cannot silently miss independent Next.js/Vite installation checks.

Data-table and template modules use alias-aware targets. App Router pages keep explicit destinations. Compositions do not reinstall the base theme.

## Installation findings and checks

Verify #217's new README browser check found that shadcn init's scaffolded button survived the original add command. The rendered button had a 1px border and no neobrutal shadow. The first-button setup command now explicitly replaces that scaffold with --overwrite. README and Installation explain the replacement and warn against overwriting a customized existing button without review.

The existing-project scenario uses custom component/lib/hooks aliases, a red theme, custom radius and CSS, an application source file, and a previously installed button with an application-owned modification. Subsequent recipe/template installation must preserve these files and settings. Only the deliberate first-button scaffold replacement uses overwrite in the onboarding scenario; the existing-project scenario does not.

Rendered checks launch fresh Next.js/Vite applications without documentation CSS. They use Chromium, Firefox, and WebKit with desktop-light/mobile-dark contexts, check styles and errors, and operate chart/data-table and Next.js template flows. JSON results and viewport captures are evidence for review, not automatic visual approval. Prepared checks are not passing checks; the exact current commit must run successfully.

## Remaining review

- Inspect current chart and installed-template captures and resolve any actual visual failures. An axe scan and an overflow assertion do not constitute a complete visual or assistive-technology audit.
- Review every public variant and relevant state across supported palettes and widths, including keyboard/touch, actual IME composition, disabled/error/loading states, nested overlays, scrolling, and reduced motion.
- Extend isolated installation coverage beyond analytical charts. Aggregate builds cannot prove every item's independent npm dependency declarations.
- Review optional FormDescription/FormMessage composition, missing IDREF targets, custom IDs/descriptions, ref/event composition, and cross-field recovery.
- Audit remaining API examples and search timing/error states. Keep source, installation guidance, and advertised behavior aligned.

## Verification procedure

Run registry format, lint, typecheck, build, registry:validate, registry:check, and consumer:verify. Run docs format, lint, typecheck, build, check:budget, test, test:browser, and test:browser:cross. With docs dependencies and all browser engines installed, run `npm run consumer:verify --prefix registry -- --integration` from the repository root.

Run `node registry/scripts/verify-generated.mjs` and verify a clean source tree. Never hand-edit generated JSON or docs copies. Confirm the deployed commit, headers, live catalog, representative live installs, and deployed browser checks. The catalog and published files must omit s1 through s40.

A gate is complete only after the actual check and result are recorded. Do not substitute a percentage score or an earlier commit's green check for current evidence.
