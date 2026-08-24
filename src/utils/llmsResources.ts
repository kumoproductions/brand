// Machine-readable appendix shared by /llms.txt and /llms-full.txt: design
// token CSS, the asset catalogue derived from content/, and the raster image
// API contract (worker/index.ts).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getStaticGroups,
  getVectorStems,
  STATIC_CATEGORIES,
  VECTOR_FAMILIES,
} from './assetLibrary';

const TOKEN_FILES = ['colors.css', 'typography.css', 'spacing.css'];

// Mirrors worker/index.ts (WIDTH_STEPS / quality snap / DIRECT_LINKS) and
// scripts/collect-assets.mjs (root-level direct links).
export const DIRECT_SVG_LINKS = [
  '/icon.svg',
  '/icon-white.svg',
  '/logotype.svg',
  '/logotype-white.svg',
  '/sphere.svg',
  '/banner.jpg',
];

export const DIRECT_RASTER_LINKS = [
  '/icon.png',
  '/icon-white.png',
  '/logotype.png',
  '/logotype-white.png',
];

export function renderTokensAppendix(): string {
  const blocks = TOKEN_FILES.map((name) => {
    const css = readFileSync(
      join(process.cwd(), 'public', 'tokens', name),
      'utf8'
    ).trim();
    return `#### tokens/${name}\n\n\`\`\`css\n${css}\n\`\`\``;
  });
  return [
    '### Design tokens (CSS custom properties)',
    'The canonical token definitions. `styles.css` imports all three files. Dark mode is opted into with `<html data-theme="dark">`.',
    ...blocks,
  ].join('\n\n');
}

export function renderAssetCatalog(site: URL): string {
  const abs = (path: string) => new URL(path, site).href;
  const lines: string[] = [
    '### Asset catalogue',
    'SVG is the single source of truth. Naming: `<family>-<variant>[-tm]-<tone>` — variants follow the guideline vocabulary (`primary` / `secondary` / `tertiary` / `abbreviation` / `microspace`), `-tm` carries the ™, and `-black` / `-white` describe the visual tone of the artwork itself (`icon-black` = black plate with white mark, `icon-white` = its inverse).',
    '',
    `Shortcut URLs: ${DIRECT_SVG_LINKS.map(abs).join(' · ')}`,
    `Generated rasters (512px default, query overridable): ${DIRECT_RASTER_LINKS.map(abs).join(' · ')}`,
  ];
  for (const family of VECTOR_FAMILIES) {
    lines.push('', `#### ${family}`, '');
    for (const { stem, url } of getVectorStems(family)) {
      lines.push(`- \`${stem}\` — ${abs(url)}`);
    }
  }
  for (const category of STATIC_CATEGORIES) {
    lines.push('', `#### ${category}`, '');
    for (const group of getStaticGroups(category)) {
      const urls = group.files.map((file) => abs(file.url)).join(' · ');
      lines.push(`- \`${group.base}\` — ${urls}`);
    }
  }
  return lines.join('\n');
}

export function renderImageApi(site: URL): string {
  return [
    '### Raster image API',
    'Rasters are never stored; a Cloudflare Worker renders them on demand from the SVG source and caches them at the edge.',
    '',
    '`GET /i/<stem>.<png|webp|avif|jpg>?w=&q=&bg=`',
    '',
    '- `<stem>` — any vector asset name from the catalogue above (e.g. `icon-black`, `logotype-primary-tm-white`, `sphere-11`)',
    '- `w` — width in px (1–4096), snapped to presets: 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096',
    '- `q` — quality, snapped to 50 / 60 / 70 / 80 / 90 / 100',
    '- `bg` — background fill as hex without `#` (e.g. `bg=64add4`); JPEG defaults to white because it has no alpha',
    '',
    `Example: ${new URL('/i/logotype-primary-tm-black.webp?w=1024', site).href}`,
  ].join('\n');
}

export function renderUiComponents(site: URL): string {
  const root = join(process.cwd(), 'public', 'components');
  const lines = [
    '### UI components',
    'Standalone React demos under `/components/<group>/` (token-referencing `.jsx` sources plus a self-contained live demo page).',
    '',
  ];
  for (const group of readdirSync(root, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const files = readdirSync(join(root, group.name))
      .filter((name) => name.endsWith('.jsx') || name.endsWith('.html'))
      .map((name) => new URL(`/components/${group.name}/${name}`, site).href);
    lines.push(`- ${group.name} — ${files.join(' · ')}`);
  }
  return lines.join('\n');
}

export function renderResourcesAppendix(site: URL): string {
  return [
    '## Appendix — Machine-readable resources',
    renderTokensAppendix(),
    renderAssetCatalog(site),
    renderImageApi(site),
    renderUiComponents(site),
  ].join('\n\n');
}
