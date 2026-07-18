# neobrutal-ui-docs

Docs site for `neobrutal-ui`.

This project is intentionally separated from the registry source:

- Registry source: `../registry`
- Docs app and hosted registry output: `../docs`

The docs app serves the registry build artifacts from `public/r`, so the same
deployment hosts both the documentation and shadcn registry JSON files.

## Development

```bash
npm install
npm run dev
```

## Registry URL

Production:

```txt
https://neobrutal-ui.andongmin.com/r/registry.json
```

Local development:

```txt
http://127.0.0.1:3000/r/registry.json
```

The registry development server also exposes the catalog at
`http://127.0.0.1:5177/r/registry.json`.

Run `npm run build` in `../registry` before deploying docs. That command rebuilds
the registry JSON and synchronizes it into `docs/public/r`.
