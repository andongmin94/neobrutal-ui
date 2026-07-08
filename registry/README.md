# neobrutal-ui

Modern neobrutalist components and registry items for shadcn/ui.

This project is the registry-only split of the original
`ekmas/neobrutalism-components` project. The docs site lives in `../docs`, and
the registry build is copied into `../docs/public/r` for deployment.

## Build

```bash
npm install
npm run build
```

The build writes registry item files to:

```txt
public/r
```

It also syncs those files into:

```txt
../docs/public/r
```

## Local Registry Through Docs

```bash
npm run build
cd ../docs
npm run dev -- --hostname 127.0.0.1 --port 5177
```

Then install from another shadcn project:

```bash
npx shadcn@latest add http://127.0.0.1:5177/r/button.json
npx shadcn@latest init http://127.0.0.1:5177/r/styling/yellow.json
```

## Deployment

The default registry base URL is:

```txt
https://neobrutal-ui.andongmin.com
```

Set `REGISTRY_BASE_URL` before building only if registry dependencies should
point somewhere else:

```powershell
$env:REGISTRY_BASE_URL="https://neobrutal-ui.andongmin.com"; npm run build
```

The registry catalog will be available at:

```txt
https://neobrutal-ui.andongmin.com/r/registry.json
```

## Attribution

This project is derived from `ekmas/neobrutalism-components` under the MIT
License. Keep the original license notice when redistributing.
