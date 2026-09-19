# Product readiness

This product-foundation pass is not a release approval. Official shadcn directory submission remains outside this pass.

## Implemented source changes

- Remove the standalone decorative Stars collection from the source trees, registry catalog definition, documentation, navigation, search entries, preview dispatch, and generator.
- Retain general reference-table and clipboard-failure regressions on surviving pages.
- Consolidate identical secondary/neutral button variants under neutral and use shared focus tokens.
- Validate Form, FormField, FormItem, and the single-control composition contract before looking up field state.
- Add separate light/dark error-text tokens rather than reuse the filled destructive-action color.
- Move the five template theme overrides into a labeled docs-only preview wrapper. Installed templates inherit the consuming project's tokens.
- Describe the form demo's local-only result without claiming a server save.

The registry build remains the producer of installable JSON and managed docs copies. Source changes alone do not establish that generated files, fresh consumers, or the deployed site are current.

## Verification requirements

Use the Verify workflow attached to the exact commit as the execution record. Never reuse successful checks on the prior base as evidence for this source. A prepared regression test is not a passing regression test.

Run registry format, lint, typecheck, build, registry:validate, registry:check, and consumer:verify. Run docs format, lint, typecheck, build, check:budget, test, test:browser, and test:browser:cross. Verify generated-file reproducibility from a clean checkout and verify the deployed commit and endpoints after publication.

The rebuilt catalog must retain the base, UI, recipes, four templates, and themes without s1 through s40. Check the generated search index and sitemap and the absence of obsolete published JSON. No old route aliases are required or allowed.

## Remaining product gates

1. Exercise the exact README init/add path, individual installs, custom aliases, existing files, and theme retention after later installations. Build success alone is not a CSS or browser-runtime check of a consuming application.
2. Review every public variant and state at mobile/desktop widths and in all supported themes, including keyboard/touch, long Korean/English/Japanese content and IME, disabled/error/loading states, nested overlays, scrolling, and reduced motion.
3. Review optional FormDescription/FormMessage composition, absent IDREF targets, user-supplied IDs/descriptions, ref/event composition, and cross-field error recovery beyond the covered fixtures.
4. Verify templates in consuming projects without docs CSS. Gallery previews are not substitutes for installed-template checks.
5. Audit all documentation/API examples and search timing/error states. Review screenshots for clipped shadows, doubled borders, alignment, wrapping, and state contrast. Automated axe checks are not a comprehensive visual or assistive-technology audit.

A gate is complete only when its check was actually performed and the result recorded. No percentage score or absence of an obvious error substitutes for a verified gate.
