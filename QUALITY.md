# Product readiness

Official shadcn directory submission is not approved by this work. Implemented code, executed checks, and remaining review are separate statuses.

## Completed foundation

The standalone Stars collection, its routes, catalog items, sources, and generator are removed. Do not restore aliases for it. The button API uses neutral instead of a duplicate secondary variant. Form provider and child-composition diagnostics are explicit. Focus and error text use shared tokens. Gallery presets are confined to docs; installed templates inherit the application's theme.

The README and introduction no longer foreground derivative-project background. LICENSE, Credits & license, and the short attribution notice remain intact.

The four templates include combined blog filters and sorting, a local CMS editor with save/discard and plain-text preview, expandable portfolio case studies, and categorized profile links with clipboard feedback. CMS edits are in memory and reset on refresh; this is not a publishing backend.

The revenue, signup-conversion, and service-latency recipes are individually installable. Their registry source, generated docs mirror, source dialog, and installed JSON are checked for equality. Existing individual Next.js and Vite installation checks cover all three.

Verify #213 passed for commit 9857af44dbf41759fa11a5082235a6d377e127f5, including deployment. That result does not verify later changes.

## Current integration pass

Template cards now render scaled, inert previews of their actual current components, with a separate navigation link. The outdated PNG assets and preview metadata are removed. The previews inherit the selected theme and use the current viewport's responsive layout. Browser checks cover scaling, inertness, and page overflow.

Data-table and template modules use @ui, @components, and @lib installation targets. Page routes retain their explicit App Router destinations. Compositions no longer reinstall the base; the base remains a separate, documented first installation step. The docs synchronizer resolves the same new target convention without legacy-path fallbacks.

The existing consumer verifier has an integration mode. It exercises current shadcn init/add onboarding, then a separate existing-project scenario with custom aliases, application-owned source and CSS, a red theme, and a custom radius. It checks that later component/template installation preserves those settings before building and rendering the applications.

Rendered integration runs operate the installed charts and data table in Next.js and Vite. In Next.js they also operate all four template routes without importing documentation CSS. Chromium, Firefox, and WebKit run at desktop-light and mobile-dark settings. The checks cover calculated chart values, filtering, CMS save/discard and escaped text, theme inheritance, application style preservation, page errors, overflow, and axe results. Viewport screenshots and result records are retained as review evidence, not automatic visual approval.

The first thumbnail run stopped at a test-file formatting error; it was corrected without relaxing checks. Follow the exact final commit's Verify run for all current-pass outcomes. Local syntax checks and prepared tests do not establish a passing integration run.

## Remaining product gates

- Finish the old 47 chart reference examples. Their presence is not a claim that they have been redesigned or visually audited.
- Inspect current gallery and installed-template screenshots. A passing axe scan or overflow assertion is not a comprehensive visual or assistive-technology review.
- Exercise every public variant and relevant state across supported palettes and widths, including keyboard/touch, long Korean/English/Japanese content and IME, disabled/error/loading states, nested overlays, scrolling, and reduced motion.
- Extend isolated installation coverage beyond the three original analytical charts. The aggregate all-item build cannot prove each item's independent npm dependencies.
- Review optional FormDescription/FormMessage composition, absent IDREF targets, custom IDs/descriptions, ref/event composition, and cross-field recovery.
- Audit remaining documentation/API examples and search timing/error states. Keep source, installation guidance, demonstrations, and advertised capabilities consistent.

## Verification procedure

Run registry format, lint, typecheck, build, registry:validate, registry:check, and consumer:verify. Run docs format, lint, typecheck, build, check:budget, test, test:browser, and test:browser:cross. With docs dependencies and all three browser engines installed, run `npm run consumer:verify --prefix registry -- --integration` from the repository root.

Run `node registry/scripts/verify-generated.mjs` and verify a clean source tree. Generated JSON and docs copies remain build outputs, never separately edited sources. Confirm the deployed commit, headers, live catalog, representative live installs, and deployed browser checks. The catalog must omit s1 through s40 and all obsolete published JSON.

A gate is complete only when the actual check and result are recorded. Do not replace missing evidence with a percentage score or an earlier commit's green check.
