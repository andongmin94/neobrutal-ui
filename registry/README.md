# neobrutal-ui registry

Installable neobrutalist components, themes, recipes, and Next.js templates for the shadcn CLI.
`src` is authoritative; `registry.json`, `public/r`, and synchronized docs copies are generated.

## Develop

```bash
npm ci
npm run format
npm run lint
npm run typecheck
npm run build
npm run registry:validate
npm run registry:check
npm run consumer:verify
```

`format` applies Oxlint/Oxfmt fixes. `lint` is a non-mutating check. The build also copies the
single registry landing-page source from `index.html` to `public/index.html` and synchronizes the
registry output and managed preview sources into `../docs`.

## Local registry through docs

```bash
npm run build
cd ../docs
npm run dev -- --hostname 127.0.0.1 --port 5177
```

Then install from another initialized shadcn project:

```bash
npx shadcn@latest add http://127.0.0.1:5177/r/button.json
npx shadcn@latest add http://127.0.0.1:5177/r/theme-yellow.json
```

## Deployment

The default registry base URL is `https://neobrutal-ui.andongmin.com`. Set
`REGISTRY_BASE_URL` before building only when registry dependencies must point elsewhere.

```powershell
$env:REGISTRY_BASE_URL="https://neobrutal-ui.andongmin.com"; npm run build
```

The catalog is published at `https://neobrutal-ui.andongmin.com/r/registry.json`.

## Attribution

This project is derived from `ekmas/neobrutalism-components` under the MIT License. Keep the
original license notice when redistributing.
