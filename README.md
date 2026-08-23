# kumo.productions™ Brand Assets & Portal

Welcome to the **official branding repository** for **kumo.productions™**.
Here you can find our logos, color palette, and typography resources for media and collaborative projects — and the source of the brand portal at **[brand.kumo.productions](https://brand.kumo.productions)**.

## Usage Guidelines

Please refer to our [Brand Guidelines](https://docs.kumo.productions/guide/branding_guidelines) for proper usage.

Do **not** use the kumo.productions™ logo and/or brand assets in any way that is not authorized, except for **press coverage or approved collaborative projects**.

For inquiries or brand usage approvals, contact: **[mail@kumo.productions](mailto:mail@kumo.productions)**

## Repository Structure

- `content/` — distributable brand assets (`banner/` `favicon/` `icon/` `logotype/` `sphere/` `typestyle/`)
- `src/` — the brand portal (Astro). Japanese at `/`, English at `/en/`
- `worker/` — the Cloudflare Worker that renders rasters from the SVG sources
- `public/` — portal static files (guideline figures, design tokens, live UI component demos)
- `design/` — the imported claude.ai/design source (`kumo-brand-guideline.dc.html`) and design-system notes
- `scripts/` — build-time asset collection

## Development

Single package (Node >= 24, pnpm).

```sh
pnpm install
pnpm dev        # portal at https://brand.kumo.localhost (via portless)
pnpm build      # static build to dist/ (prebuild collects content/ into public/)
pnpm lint && pnpm format && pnpm typecheck
pnpm deploy     # build + deploy to Cloudflare Workers (brand.kumo.productions)
```

## Assets

**SVG is the single source of truth.** `content/<family>/svg/` holds every vector master; no raster is stored in the repository. Rasters are rendered on demand by the worker and cached at the edge.

### Naming

Stems are lowercase kebab-case and read as `<family>-<variant>[-tm]-<tone>`, using the vocabulary of the guidelines:

```
logotype-primary-tm-black     logosystem-tm-white     icon-black
logotype-abbreviation-white   sphere-11               icon-white
```

`-tm` carries the trademark symbol; `-black` / `-white` name how the asset looks, not what it sits on.

### Generated image URLs

```
/i/<stem>.<png|webp|avif|jpg>?w=<width>&q=<quality>&bg=<hex>
```

```sh
/i/icon-black.png?w=512          # 512px PNG
/i/logotype-primary-tm-white.webp?w=1024
/i/sphere-11.jpg?w=256&bg=1e4b6b # flattened onto Night sky blue
```

`w` snaps to a preset ladder (16 … 4096) and `q` to steps of ten, so the number of distinct transformations stays bounded. Omitting `w` renders at the SVG's intrinsic size. JPEG defaults to a white background because it has no alpha channel.

### Direct links

Stable short URLs at the site root: `/icon.svg`, `/icon-white.svg`, `/logotype.svg`, `/logotype-white.svg`, `/sphere.svg`, `/banner.jpg` (static), and `/icon.png`, `/icon-white.png`, `/logotype.png`, `/logotype-white.png` (rendered at 512px, and they accept the same query parameters).

Every master is also downloadable from the [asset browser](https://brand.kumo.productions/assets/).

## Credits

Designer: Minami Fuji (CARAVAN)

---

© 2025 kumo.productions™. All rights reserved.
