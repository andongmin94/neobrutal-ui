# Repository workflow

Work directly on `main` unless the user requests a branch. Check the remote head before publishing. Never force-push or overwrite unrelated changes.

`registry/src` owns installable components, templates, tokens and catalog data. Build the registry before developing or checking docs. Generated paths in `.gitignore` are disposable output: do not hand-edit or force-add them. Registry synchronization and clean-generation checks must remain enabled.

Use the dependencies already in the project. Prefer their native APIs over duplicated state, keyboard, positioning, storage or event engines. Remove obsolete implementations and update current examples and documentation together; do not add compatibility aliases or migrations.

## Development and verification

`format` may write fixes. `lint`, type checks and tests must not rewrite source. Run checks for the changed surfaces during implementation, then batch the completed changes for the full sequence in `.github/workflows/ci.yml`. Keep every existing contract, consumer, browser, budget and production check enabled. Do not repeatedly cancel full verification runs for cosmetic commits.

Do not add temporary workflows, automatic source-writing verification steps or permanent full-page capture jobs. Preserve a working product if a check fails. Report only checks actually executed and distinguish automated browser tests from manual visual, physical-input and assistive-technology review. `QUALITY.md` defines the finite release gates; execution history belongs in CI artifacts, not new status documents.

## Product scope

Build clear, tactile interfaces, not a decorative asset collection. Use shared tokens and existing components. Follow the interaction rules in `docs/content/docs/index.mdx`: staged presses for raised actions, persistent selection distinct from hover, visible keyboard focus and simple nested containers.

Installed templates inherit the consumer's theme. Keep gallery presets in docs. CMS is a local UI example, not a publishing backend. Do not add another showcase app, backend or animation framework to create differentiation.

Stars, its routes and catalog items are removed; do not restore them. A removal is complete only after rebuilding and checking the registry and docs. Official directory submission requires an explicit owner decision beyond passing these checks.
