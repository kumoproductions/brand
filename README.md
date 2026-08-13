# kumo.productions™ Brand Assets & Portal

Welcome to the **official branding repository** for **kumo.productions™**.
Here you can find our logos, color palette, and typography resources for media and collaborative projects — and the source of the brand portal at **[brand.kumo.productions](https://brand.kumo.productions)**.

## Usage Guidelines

Please refer to our [Brand Guidelines](https://docs.kumo.productions/guide/branding_guidelines) for proper usage.

Do **not** use the kumo.productions™ logo and/or brand assets in any way that is not authorized, except for **press coverage or approved collaborative projects**.

For inquiries or brand usage approvals, contact: **[mail@kumo.productions](mailto:mail@kumo.productions)**

## Repository Structure

- `banner/` `favicon/` `icon/` `logotype/` `sphere/` `typestyle/` — distributable brand assets
- `apps/web/` — the brand portal (Astro). Guideline content, figures, design tokens, and live UI component demos live under `apps/web/public/`
- `design/` — the imported claude.ai/design source (`kumo-brand-guideline.dc.html`) and design-system notes
- `scripts/` — asset pipeline (SVG rasterization and R2 deployment)

## Development

pnpm workspace + turbo monorepo (Node >= 24).

```sh
pnpm install
pnpm dev        # portal at https://brand.kumo.localhost (via portless)
pnpm build      # static build to apps/web/dist
pnpm lint && pnpm format && pnpm typecheck
```

### Asset pipeline

```sh
pnpm assets:build   # rasterize SVGs to PNG/WebP/JPG (scripts/svg-to-images.js)
pnpm assets:deploy  # sync assets to R2 (scripts/deploy-to-r2.js)
```

(These were previously `npm run build` / `npm run deploy`.)

## Credits

Designer: Minami Fuji (CARAVAN)

---

© 2025 kumo.productions™. All rights reserved.
