# neobrutal-ui docs

VitePress documentation and live React previews for `neobrutal-ui`.

The monorepo keeps the two deployable concerns separate:

- `../registry`: source and build pipeline for the shadcn registry
- `../docs`: documentation site and hosted registry artifacts

The registry build synchronizes JSON files into `public/r`, so the docs deployment
also serves `https://neobrutal-ui.andongmin.com/r/registry.json`.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

`dev` and `build` regenerate the chart and star catalogs before starting
VitePress. Run `npm run build` in `../registry` whenever registry source changes;
that build refreshes `docs/public/r`.

## Vercel

Create a Vercel project with these settings:

- Root Directory: `docs`
- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `.vitepress/dist`

The same values are committed in `vercel.json`. VitePress produces static HTML,
the local search index, the sitemap, and the hosted registry files in one build.
