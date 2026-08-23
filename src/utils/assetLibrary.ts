// Build-time model for the asset browser.
//
// content/<category>/svg/ is the source of truth for the logo system: every
// raster download is a URL the worker renders on demand (/i/<stem>.<ext>?w=),
// never a file on disk. Categories with no vector origin (banner, favicon,
// typestyle) list the files they actually ship, mirrored under /content/**.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface AssetVariant {
  label: string;
  url: string;
  ext: string;
  /** Byte size, known only for files that exist on disk. */
  size?: number;
  width?: number;
}

export interface AssetGroup {
  base: string;
  preview?: string;
  /** Source SVG, present for vector-backed groups. */
  svg?: string;
  /** Artwork is entirely light, so it needs a dark plate to be visible. */
  dark?: boolean;
  variants: AssetVariant[];
}

export interface AssetCategory {
  name: string;
  groups: AssetGroup[];
}

const CONTENT_DIR = join(process.cwd(), 'content');

const VECTOR_CATEGORIES = ['logotype', 'icon', 'sphere'];
const STATIC_CATEGORIES = ['banner', 'favicon', 'typestyle'];

const GENERATED_WIDTHS = [512, 256, 128, 64];
const GENERATED_FORMATS = ['png', 'webp'];

// Preferred preview format, best-looking first; ties break to the largest file.
const PREVIEW_ORDER = ['svg', 'webp', 'jpg', 'jpeg', 'png'];
const EXT_ORDER = [
  'svg',
  'png',
  'webp',
  'jpg',
  'jpeg',
  'ico',
  'webmanifest',
  'typestyle',
  'typestyle2',
  'mjk',
];

interface WalkedFile {
  relPath: string;
  ext: string;
  stem: string;
  size: number;
}

function walk(dir: string, files: WalkedFile[] = []): WalkedFile[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    const dot = entry.name.lastIndexOf('.');
    files.push({
      relPath: relative(CONTENT_DIR, full).replaceAll('\\', '/'),
      ext: dot > 0 ? entry.name.slice(dot + 1).toLowerCase() : '',
      stem: dot > 0 ? entry.name.slice(0, dot) : entry.name,
      size: statSync(full).size,
    });
  }
  return files;
}

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function pickPreview(variants: AssetVariant[]): string | undefined {
  for (const ext of PREVIEW_ORDER) {
    const candidates = variants.filter(
      (variant) => variant.ext === ext && variant.size !== undefined
    );
    if (candidates.length === 0) continue;
    return candidates.reduce((best, variant) =>
      (variant.size ?? 0) > (best.size ?? 0) ? variant : best
    ).url;
  }
  return undefined;
}

// Artwork drawn entirely in white vanishes on the default light plate.
function isLightArtwork(svgSource: string): boolean {
  const shapes =
    svgSource.match(
      /<(?:path|rect|circle|ellipse|polygon|polyline)\b[^>]*>/g
    ) ?? [];
  return (
    shapes.length > 0 &&
    shapes.every((shape) => /fill:\s*#(fff|ffffff)\b/i.test(shape))
  );
}

// One group per SVG: the vector itself plus the rasters the worker can render.
function vectorGroups(category: string): AssetGroup[] {
  return walk(join(CONTENT_DIR, category, 'svg'))
    .filter((file) => file.ext === 'svg')
    .toSorted((a, b) => a.stem.localeCompare(b.stem))
    .map((file) => {
      const svg = `/content/${file.relPath}`;
      return {
        base: file.stem,
        preview: svg,
        svg,
        dark: isLightArtwork(
          readFileSync(join(CONTENT_DIR, file.relPath), 'utf8')
        ),
        variants: [
          { label: 'SVG', url: svg, ext: 'svg', size: file.size },
          ...GENERATED_FORMATS.flatMap((ext) =>
            GENERATED_WIDTHS.map((width) => ({
              label: `${ext.toUpperCase()} ${width}w`,
              url: `/i/${file.stem}.${ext}?w=${width}`,
              ext,
              width,
            }))
          ),
        ],
      };
    });
}

// Files with no vector origin are listed exactly as they ship.
function staticGroups(category: string): AssetGroup[] {
  const groups = new Map<string, AssetGroup>();
  for (const file of walk(join(CONTENT_DIR, category))) {
    const group = groups.get(file.stem) ?? { base: file.stem, variants: [] };
    group.variants.push({
      label: file.ext.toUpperCase(),
      url: `/content/${file.relPath}`,
      ext: file.ext,
      size: file.size,
    });
    groups.set(file.stem, group);
  }

  for (const group of groups.values()) {
    group.variants = group.variants.toSorted(
      (a, b) => EXT_ORDER.indexOf(a.ext) - EXT_ORDER.indexOf(b.ext)
    );
    group.preview = pickPreview(group.variants);
  }
  return [...groups.values()].toSorted((a, b) => a.base.localeCompare(b.base));
}

export function getAssetLibrary(): AssetCategory[] {
  return [
    ...VECTOR_CATEGORIES.map((name) => ({ name, groups: vectorGroups(name) })),
    ...STATIC_CATEGORIES.map((name) => ({ name, groups: staticGroups(name) })),
  ];
}
