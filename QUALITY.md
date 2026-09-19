# Product readiness

Official shadcn directory submission is not approved by this work. Implemented code, executed checks, and remaining review are separate statuses. Use the Verify run attached to the exact commit as the execution record.

## Foundation

The standalone Stars collection and its routes, catalog entries, sources, and generator are removed. No compatibility routes are retained. The button API uses neutral instead of a duplicate secondary variant. Form provider and child-composition diagnostics are explicit. Focus and error text use shared tokens. Gallery presets remain docs-only; installed templates inherit the application's theme.

The README and introduction no longer foreground derivative-project background. LICENSE, Credits & license, and the short attribution notice remain intact.

The templates include combined blog filters and sorting, local CMS save/discard and plain-text preview, expandable portfolio cases, and categorized profile links. CMS edits reset on refresh; it is not a publishing backend.

## Current product work

Template thumbnails render scaled, inert previews of the current template components. Navigation uses a separate overlay link. The old PNG assets and preview metadata are removed.

The 47 docs-only chart reference examples have been replaced, not retained as alternate implementations. Eight installable recipes cover revenue targets, signup conversion, latency budgets, release counts/shares, delivery variance, paired build duration, work allocation, and sequential installation traces. Each uses registry-owned source, documented controls, calculated summaries, a labeled data table, and no plot entrance animation. Consolidation is not a claim that all former examples were individually redesigned.

Chart metadata is maintained with the registry definitions. Gallery source is generated from synchronized installed files. Contracts compare source, generated mirror, displayed source, and built JSON. The consumer matrix derives all analytical-chart names from the built catalog, so new charts cannot silently miss independent Next.js/Vite installation checks.

Data-table and template modules use alias-aware targets. App Router pages keep explicit destinations. Compositions do not reinstall the base theme.

## Installation findings and checks

The README browser check found that shadcn init's scaffolded button survived the original add command. The first-button setup now deliberately replaces that scaffold with --overwrite. README and Installation explain the replacement and warn against overwriting a customized existing button without review.

The existing-project scenario uses custom component/lib/hooks aliases, a red theme, custom radius and CSS, an application source file, and a previously installed button with an application-owned modification. Subsequent recipe/template installation must preserve these files and settings. The existing-project scenario does not overwrite these files.

Verify #226 exposed a 515px-wide page in the 390px installed consumer. Its implicit automatic grid column inherited a wide table's intrinsic minimum. The consumer composition now uses grid-cols-1, preserving the table's own keyboard-accessible horizontal scrolling without clipping page overflow or reducing the dataset. The chart guide documents this layout requirement.

For commit 317aa23e0c843a6c308eb60eb705440ccbc44fb1, Verify #228's installed-consumer artifact records 48 passing rendered route checks: Next.js README 6, Next.js existing-project 30, Vite README 6, and Vite existing-project 6. Each uses Chromium, Firefox, and WebKit in desktop-light and mobile-dark contexts. The run was cancelled after the integration step when the next source revision was published; this is not a claim that its entire workflow or later revisions passed.

Captured installed charts and all four template viewports were visually reviewed in the red theme. That review identified opaque bar-hover bands, a generic allocation tooltip label, and dark delivery outlines overridden by common chart CSS. Hover cursors now use translucent foreground; allocation names the hovered workstream; bar-outline defaults are inherited from their group so explicit series strokes and widths take precedence. Browser regressions cover these properties and keyboard access to a narrow table. Their final result is the exact current commit's Verify run, not the earlier captures.

Rendered checks launch fresh applications without documentation CSS. JSON results and viewport captures are evidence for the specific tested routes and states, not comprehensive visual or assistive-technology approval.

## Remaining review

- Inspect final captures after the chart styling fixes. Extend review beyond the captured red-theme viewports to every public variant and relevant state across supported palettes and widths, including keyboard/touch, actual IME composition, disabled/error/loading states, nested overlays, scrolling, and reduced motion.
- Extend isolated installation coverage beyond analytical charts. Aggregate builds cannot prove every item's independent npm dependency declarations.
- Review optional FormDescription/FormMessage composition, missing IDREF targets, custom IDs/descriptions, ref/event composition, and cross-field recovery.
- Audit remaining API examples and search timing/error states. Keep source, installation guidance, and advertised behavior aligned.

## Verification procedure

Run registry format, lint, typecheck, build, registry:validate, registry:check, and consumer:verify. Run docs format, lint, typecheck, build, check:budget, test, test:browser, and test:browser:cross. With docs dependencies and all browser engines installed, run `npm run consumer:verify --prefix registry -- --integration` from the repository root.

Run `node registry/scripts/verify-generated.mjs` and verify a clean source tree. Never hand-edit generated JSON or docs copies. Confirm the deployed commit, headers, live catalog, representative live installs, and deployed browser checks. The catalog and published files must omit s1 through s40.

A gate is complete only after the actual check and result are recorded. Do not substitute a percentage score or an earlier commit's green check for current evidence.
