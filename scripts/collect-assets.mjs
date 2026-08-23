// Prepares public/ before `astro build`.
//
// content/ is the single source of truth: SVG for everything the logo system
// can draw, plus the handful of assets that have no vector origin (banners,
// favicons, type styles). Rasters are NOT stored — the worker renders them on
// demand from the SVG (see worker/index.ts), so nothing here writes a PNG.
//
// Everything this script produces is gitignored.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(repoRoot, 'content');
const publicDir = join(repoRoot, 'public');
const mirrorDir = join(publicDir, 'content');

// Subtrees of content/ published under /content/** for direct download.
const DISTRIBUTED = [
  'logotype/svg',
  'icon/svg',
  'sphere/svg',
  'banner/jpg',
  'banner/png',
  'favicon',
  'typestyle',
];

// Short stable URLs at the site root: destination ← source under content/.
// Only vector and already-rasterized originals appear here; /icon.png and the
// other generated rasters are answered by the worker.
const DIRECT_LINKS = {
  'icon.svg': 'icon/svg/icon-black.svg',
  'icon-white.svg': 'icon/svg/icon-white.svg',
  'logotype.svg': 'logotype/svg/logotype-primary-tm-black.svg',
  'logotype-white.svg': 'logotype/svg/logotype-primary-tm-white.svg',
  'sphere.svg': 'sphere/svg/sphere-11.svg',
  'banner.jpg': 'banner/jpg/banner.jpg',
  // Favicons keep their platform-mandated names at the root.
  'favicon.svg': 'icon/svg/icon-black.svg',
  'favicon.ico': 'favicon/favicon.ico',
  'favicon-16x16.png': 'favicon/favicon-16x16.png',
  'favicon-32x32.png': 'favicon/favicon-32x32.png',
  'apple-touch-icon.png': 'favicon/apple-touch-icon.png',
  'android-chrome-192x192.png': 'favicon/android-chrome-192x192.png',
  'android-chrome-512x512.png': 'favicon/android-chrome-512x512.png',
  'site.webmanifest': 'favicon/site.webmanifest',
};

function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

for (const [dest, src] of Object.entries(DIRECT_LINKS)) {
  copy(join(contentDir, src), join(publicDir, dest));
}

const expected = new Set();
let mirrored = 0;
let skipped = 0;
function mirror(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const from = join(dir, entry.name);
    if (entry.isDirectory()) {
      mirror(from);
      continue;
    }
    const relPath = relative(contentDir, from);
    expected.add(relPath);
    const to = join(mirrorDir, relPath);
    const fromStat = statSync(from);
    try {
      const toStat = statSync(to);
      if (toStat.size === fromStat.size && toStat.mtimeMs >= fromStat.mtimeMs) {
        skipped++;
        continue;
      }
    } catch {
      // destination missing — fall through and copy
    }
    copy(from, to);
    mirrored++;
  }
}
for (const subtree of DISTRIBUTED) mirror(join(contentDir, subtree));

// The mirror is an exact reflection: a renamed or retired asset must not linger
// and get deployed alongside its replacement.
let pruned = 0;
function prune(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      prune(full);
      if (readdirSync(full).length === 0) rmdirSync(full);
      continue;
    }
    if (!expected.has(relative(mirrorDir, full))) {
      rmSync(full);
      pruned++;
    }
  }
}
if (existsSync(mirrorDir)) prune(mirrorDir);

console.log(
  `[collect-assets] ${Object.keys(DIRECT_LINKS).length} direct links, content mirror: ${mirrored} copied / ${skipped} up to date / ${pruned} pruned`
);
