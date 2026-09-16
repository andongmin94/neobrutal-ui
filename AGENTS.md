# Repository workflow

Work directly on `main` by default. Do not create a task branch unless the user explicitly requests one. Check the remote head before publishing; never force-push or overwrite unrelated work.

Keep `registry/src` authoritative for installable components and shared theme definitions. Run the registry build to synchronize generated JSON, components, templates, and theme files into docs. Do not hand-edit generated copies.

Do not add compatibility aliases, old-path fallbacks, or migrations. Remove obsolete implementations and update current call sites together.

Keep commands explicit: `npm run format` may rewrite source, while `npm run lint` must be a non-mutating check suitable for CI. Do not hide source changes inside validation commands.

Before publishing, run registry format, lint, typecheck, build, registry:validate, and registry:check; docs format, lint, typecheck, build, test, and test:browser. Browser tests must cover the documentation shell, isolated component previews, and the theme export contract. Preserve a working product if a check fails.

Distinguish an automated browser smoke test from a comprehensive accessibility or visual audit. Report only checks actually run.
