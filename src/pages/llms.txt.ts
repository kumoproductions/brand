// /llms.txt — index for LLM consumers (https://llmstxt.org/). The guideline
// body itself lives in /llms-full.txt, which is generated from the section
// components; this file only carries the summary and the resource map.
import type { APIRoute } from 'astro';

import { requireSite, textResponse } from '../utils/llmsFull';

function render(site: URL): string {
  const abs = (path: string) => new URL(path, site).href;
  return `# kumo.productions™ Brand Guidelines

> Official brand guidelines and assets of kumo.productions™ (合同会社クモ・プロダクションズ / kumo.productions, Inc.), a Tokyo-based video production company. The Japanese text is canonical; English is a translation. To design something "like brand.kumo.productions", read /llms-full.txt — it contains the full rules, all design tokens, and direct asset URLs.

Credits: design system by Minami Fuji (CARAVAN); extended by Tomoya Eguchi (kumo.productions™).

Key rules for reproducing the brand:

- Name: always lowercase \`kumo.productions™\` (no ™ available → \`kumo.productions\`; no period either → \`kumoproductions\`); short form \`kumo™\`. Never "Kumo Productions", never underscores, never Japanese katakana.
- Palette — base: Base white #FFFFFF, Cloud white #F7F7F7, Cloudiness gray #6A6E71, Space black #1E1E1E, Base black #000000. Highlights: Sky blue #64ADD4, Night sky blue #1E4B6B. Flat, uniform fills only; never alter lightness, saturation, or hue.
- Highlight colors are for emphasis only: never as backgrounds, never combined with Cloudiness gray, and Night sky blue never on black (dark mode switches the accent to Sky blue).
- Typography: headings Helvetica Now Display (web substitute: Helvetica Neue); EN body Helvetica Now Text (web: Helvetica Neue; secondary Inter); JA body TP Tokyo City font (web: BIZ UDPGothic); mono Gravitica Mono (web: IBM Plex Mono). The logotype is drawn from Object Sans — use the shipped SVGs, and never use PP Object Sans for headings or body text.
- Logo: never deform, rotate, outline, redraw, or recolor outside the palette.
- Layout system: spacing grid unit a = 4px (\`--space-1…16\` = 4→64px), 1px hairline dividers, restrained 150ms motion; radii, elevation, and focus-ring values are defined in tokens/spacing.css and tokens/colors.css.

## Docs

- [Full guidelines — Japanese, canonical](${abs('/llms-full.txt')}): the complete brand guidelines as Markdown, with design tokens, asset catalogue, and the raster image API
- [Full guidelines — English](${abs('/en/llms-full.txt')})
- [tokens/colors.css](${abs('/tokens/colors.css')}): color tokens including dark mode (\`<html data-theme="dark">\`)
- [tokens/typography.css](${abs('/tokens/typography.css')}): type tokens
- [tokens/spacing.css](${abs('/tokens/spacing.css')}): spacing / radius / motion tokens

## Assets

- [icon.svg](${abs('/icon.svg')}): symbol icon, black plate — also /icon-white.svg, /logotype.svg, /logotype-white.svg, /sphere.svg, /banner.jpg
- [Asset catalogue & image API](${abs('/llms-full.txt')}): every SVG source plus on-demand rasters via \`/i/<stem>.<png|webp|avif|jpg>?w=&q=&bg=\`

## Optional

- [Brand portal (HTML)](${site.href})
`;
}

export const GET: APIRoute = ({ site }) =>
  textResponse(render(requireSite(site)));
