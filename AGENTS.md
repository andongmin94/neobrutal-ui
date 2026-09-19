# Repository workflow

Work directly on `main` by default. Do not create a task branch unless the user explicitly requests one. Check the remote head before publishing; never force-push or overwrite unrelated work.

Keep `registry/src` authoritative for installable components and shared theme definitions. Run the registry build to synchronize generated JSON, components, templates, and theme files into docs. Do not hand-edit generated copies.

Do not add compatibility aliases, old-path fallbacks, or migrations. Remove obsolete implementations and update current call sites together.

Keep commands explicit: `npm run format` may rewrite source, while `npm run lint` must be a non-mutating check suitable for CI. Do not hide source changes inside validation commands.

Before publishing, run registry format, lint, typecheck, build, registry:validate, and registry:check; docs format, lint, typecheck, build, test, and test:browser. Browser tests must cover the documentation shell, isolated component previews, and the theme export contract. Preserve a working product if a check fails.

Distinguish an automated browser smoke test from a comprehensive accessibility or visual audit. Report only checks actually run.

## Product focus

Build clear, tactile interfaces, not a decorative asset collection. Use the existing CMS as a representative screen composition; do not add a backend, another showcase application, or an animation framework just to differentiate the product.

Follow the interaction rules in `docs/content/docs/index.mdx`: staged presses for raised actions, persistent selection distinct from hover, visible keyboard focus, and simple nested containers. Keep native input and feedback semantics. Use existing components and theme tokens.

Keep the current CI structure. Do not add temporary workflows, automatic source-writing verification steps, or permanent full-page capture jobs for product polish.

## Pending scope reduction

Stars removal is approved but not implemented by the product-copy pass. Remove its registry items, source and generated copies, routes, navigation, examples, generator, and dedicated tests together, then regenerate with the existing build and run the existing checks. Do not merely hide it from navigation or preserve old route aliases. Do not report this removal as complete until the installable catalog and documentation have both been rebuilt and verified.
