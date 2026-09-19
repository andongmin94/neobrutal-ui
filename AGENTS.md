# Repository workflow

Work directly on `main` by default. Do not create a task branch unless the user explicitly requests one. Check the remote head before publishing; never force-push or overwrite unrelated work.

Keep `registry/src` authoritative for installable components and shared theme definitions. Run the registry build to synchronize generated JSON, components, templates, and theme files into docs. Generated paths listed in the root `.gitignore` are disposable build outputs, not versioned sources. Do not hand-edit or force-add these copies. Build the registry before developing, checking, or deploying docs.

Do not add compatibility aliases, old-path fallbacks, or migrations. Remove obsolete implementations and update current call sites together.

Keep commands explicit: `npm run format` may rewrite source, while `npm run lint` must be a non-mutating check suitable for CI. Do not hide source changes inside validation commands.

Before publishing, run registry format, lint, typecheck, build, registry:validate, and registry:check; docs format, lint, typecheck, build, test, and test:browser. Run `node registry/scripts/verify-generated.mjs` from the repository root to verify a clean rebuild and byte-identical registry mirrors. This command replaces generated outputs only and refuses to delete tracked files. Keep the source-cleanliness and all existing consumer, contract, and browser checks enabled. Browser tests must cover the documentation shell, isolated component previews, and the theme export contract. Preserve a working product if a check fails.

Distinguish an automated browser smoke test from a comprehensive accessibility or visual audit. Report only checks actually run.

## Product focus

Build clear, tactile interfaces, not a decorative asset collection. Use the existing CMS as a representative screen composition; do not add a backend, another showcase application, or an animation framework just to differentiate the product.

Follow the interaction rules in `docs/content/docs/index.mdx`: staged presses for raised actions, persistent selection distinct from hover, visible keyboard focus, and simple nested containers. Keep native input and feedback semantics. Use existing components and theme tokens.

Keep the current CI structure. Do not add temporary workflows, automatic source-writing verification steps, or permanent full-page capture jobs for product polish.

## Product readiness

The standalone decorative Stars collection is outside the product scope. Do not restore its items, routes, or compatibility aliases. A removal is complete only after the registry and documentation are rebuilt and verified.

Keep gallery-only presentation presets in docs, never in installable templates. Components and templates must inherit the consuming project's shared tokens.

Use QUALITY.md to distinguish implemented source changes from verified behavior and remaining release gates. Official directory submission is not approved by passing a build alone.
