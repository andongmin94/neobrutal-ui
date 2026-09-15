# shadcn Registry Directory submission

Proposed namespace: `@neobrutal-ui`.

`directory-entry.json` contains the proposed entry, including the inline SVG logo. The
same mark is available at `docs/public/logo.svg`. This file records preparation, not
acceptance into the official directory.

Before opening the upstream PR, run the repository CI and verify that the deployment
matches the generated catalog and every item:

```bash
cd registry
npm run registry:verify-live
npm run consumer:verify -- vite --item=dialog --registry-url=https://neobrutal-ui.andongmin.com/r
```

Add the object from `directory-entry.json` to
`shadcn-ui/ui:apps/v4/registry/directory.json`, keeping the list alphabetically ordered.
Run `pnpm validate:registries` in the upstream checkout, then open a PR to `main`.

Suggested title: `feat(registry): add @neobrutal-ui`

Suggested description:

> Adds @neobrutal-ui, an open-source neobrutalist React component and Next.js template
> registry built with Base UI and Tailwind CSS v4. It is an independently maintained
> derivative of ekmas/neobrutalism-components under MIT, with attribution preserved.
> The registry publishes a flat catalog, content-free discovery metadata, named theme
> presets, and full source in individual item JSON files. Installation requires an
> explicit design-system base step; the documentation describes global CSS effects.

Include links to the actual passing CI and live-install results. Do not claim an upstream
validator, browser audit, or official acceptance that has not been observed.
