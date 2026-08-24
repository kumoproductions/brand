// Build-time model of content/, the distribution source of truth.
//
// Vector families (logotype, icon, sphere) ship as SVG only; rasters are
// rendered on demand by the worker. Their stems decompose as
// `<base>[-tm]-<tone>`, which getExportBases() derives for the raster
// exporter dialog. Categories with no vector origin (banner, favicon,
// typestyle) list the files they actually ship, mirrored under /content/**.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface AssetFile {
  name: string;
  url: string;
  ext: string;
  size: number;
}

export interface StaticGroup {
  base: string;
  files: AssetFile[];
}

export interface VectorStem {
  family: string;
  stem: string;
  url: string;
}

export interface ExportBase {
  base: string;
  family: string;
  /** Whether -black/-white tone forms exist. */
  tone: boolean;
  tm: 'optional' | 'required' | 'none';
}

const CONTENT_DIR = join(process.cwd(), 'content');

export const VECTOR_FAMILIES = ['logotype', 'icon', 'sphere'];
export const STATIC_CATEGORIES = ['banner', 'favicon', 'typestyle'];

// Guideline vocabulary order for the exporter's asset select; assets outside
// the list sort alphabetically after it.
const BASE_ORDER = [
  'logotype-primary',
  'logotype-secondary',
  'logotype-tertiary',
  'logotype-abbreviation',
  'logotype-microspace',
  'logosystem',
  'icon',
  'sphere-11',
  'sphere-7',
  'sphere-5',
  'sphere-3',
];

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

const TONE_SUFFIX = /-(black|white)$/;

interface WalkedFile {
  relPath: string;
  name: string;
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
      name: entry.name,
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

export function getVectorStems(family: string): VectorStem[] {
  return walk(join(CONTENT_DIR, family, 'svg'))
    .filter((file) => file.ext === 'svg')
    .toSorted((a, b) => a.stem.localeCompare(b.stem))
    .map((file) => ({
      family,
      stem: file.stem,
      url: `/content/${file.relPath}`,
    }));
}

export function getStaticFiles(category: string): AssetFile[] {
  return walk(join(CONTENT_DIR, category))
    .toSorted(
      (a, b) =>
        a.stem.localeCompare(b.stem) ||
        EXT_ORDER.indexOf(a.ext) - EXT_ORDER.indexOf(b.ext)
    )
    .map((file) => ({
      name: file.name,
      url: `/content/${file.relPath}`,
      ext: file.ext,
      size: file.size,
    }));
}

export function getStaticGroups(category: string): StaticGroup[] {
  const groups = new Map<string, StaticGroup>();
  for (const file of getStaticFiles(category)) {
    const base = file.name.slice(0, file.name.lastIndexOf('.'));
    const group = groups.get(base) ?? { base, files: [] };
    group.files.push(file);
    groups.set(base, group);
  }
  return [...groups.values()];
}

export function getExportBases(): ExportBase[] {
  const bases = new Map<
    string,
    { family: string; tones: Set<string>; tm: Set<boolean> }
  >();
  for (const family of VECTOR_FAMILIES) {
    for (const { stem } of getVectorStems(family)) {
      const tone = stem.match(TONE_SUFFIX)?.[1];
      let base = stem.replace(TONE_SUFFIX, '');
      const tm = base.endsWith('-tm');
      if (tm) base = base.slice(0, -'-tm'.length);
      const entry = bases.get(base) ?? {
        family,
        tones: new Set<string>(),
        tm: new Set<boolean>(),
      };
      if (tone) entry.tones.add(tone);
      entry.tm.add(tm);
      bases.set(base, entry);
    }
  }
  const rank = (base: string) => {
    const index = BASE_ORDER.indexOf(base);
    return index === -1 ? BASE_ORDER.length : index;
  };
  return [...bases]
    .toSorted(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([base, entry]) => ({
      base,
      family: entry.family,
      tone: entry.tones.size > 0,
      tm: entry.tm.has(true)
        ? entry.tm.has(false)
          ? 'optional'
          : 'required'
        : 'none',
    }));
}
