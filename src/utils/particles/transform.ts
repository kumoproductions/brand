// Edits and whole-pattern transforms. A pattern is tight — its grid is the
// export box — so editing happens in world space, where cells may sit
// anywhere, and fromWorld() re-tightens the result.
import {
  type CellKey,
  MAX_SIZE,
  ORTHOGONALS,
  type Pattern,
  cellKey,
  clonePattern,
  connectionKey,
  emptyPattern,
  latticeOf,
  normalizeCuts,
  parseCellKey,
  parseConnectionKey,
  placeableAmong,
} from './model.ts';

type CellMap = (i: number, j: number) => [number, number];

/** Re-keys a cut through a cell mapping (any lattice-preserving one). */
export function mapCut(key: string, map: CellMap): string {
  const [i, j, dir] = parseConnectionKey(key);
  const a = map(i, j);
  const b = map(dir === 'l' ? i - 1 : i + 1, j + 1);
  const [upper, lower] = a[1] < b[1] ? [a, b] : [b, a];
  return connectionKey(upper[0], upper[1], lower[0] < upper[0] ? 'l' : 'r');
}

/** Rebuilds cells and cuts through a cell mapping. */
export function remap(
  pattern: Pattern,
  cols: number,
  rows: number,
  map: CellMap
): Pattern {
  const next = emptyPattern(cols, rows);
  for (const [key, n] of pattern.cells) {
    const [i, j] = parseCellKey(key);
    const [ni, nj] = map(i, j);
    next.cells.set(cellKey(ni, nj), n);
  }
  for (const key of pattern.cuts) next.cuts.add(mapCut(key, map));
  return next;
}

export function mirror(pattern: Pattern): Pattern {
  return remap(pattern, pattern.cols, pattern.rows, (i, j) => [
    pattern.cols - 1 - i,
    j,
  ]);
}

/** Quarter turn clockwise. */
export function rotate(pattern: Pattern): Pattern {
  return remap(pattern, pattern.rows, pattern.cols, (i, j) => [
    pattern.rows - 1 - j,
    i,
  ]);
}

/** Orientation 0–7: quarter turns in the low two bits, mirrored above. */
export function orient(pattern: Pattern, orientation: number): Pattern {
  let next = orientation & 4 ? mirror(pattern) : pattern;
  for (let q = 0; q < (orientation & 3); q++) next = rotate(next);
  return next;
}

/** The same orientation applied to a direction vector (screen coordinates). */
export function orientVector(
  [x, y]: [number, number],
  orientation: number
): [number, number] {
  let v: [number, number] = orientation & 4 ? [-x, y] : [x, y];
  for (let q = 0; q < (orientation & 3); q++) v = [-v[1], v[0]];
  return v;
}

export function orientationLabel(orientation: number): string {
  const turns = (orientation & 3) * 90;
  const flipped = orientation & 4 ? ' mirrored' : '';
  return turns === 0 && !flipped ? 'as is' : `${turns}°${flipped}`.trim();
}

export function toggleCut(pattern: Pattern, key: string): Pattern {
  const next = clonePattern(pattern);
  if (next.cuts.has(key)) next.cuts.delete(key);
  else next.cuts.add(key);
  return normalizeCuts(next);
}

// ------------------------------------------------------------- world space

/** Cells and cuts keyed in world coordinates, unbounded in every direction. */
export interface World {
  cells: Map<CellKey, number>;
  cuts: Set<string>;
}

export function toWorld(pattern: Pattern, [ox, oy]: [number, number]): World {
  const moved = remap(pattern, 0, 0, (i, j) => [i + ox, j + oy]);
  return { cells: moved.cells, cuts: moved.cuts };
}

/** Tight pattern around the world cells; `origin` is where its cell (0,0) sits. */
export function fromWorld(world: World): {
  pattern: Pattern;
  origin: [number, number];
} {
  if (world.cells.size === 0) {
    return { pattern: emptyPattern(1, 1), origin: [0, 0] };
  }
  let minI = Infinity;
  let minJ = Infinity;
  let maxI = -Infinity;
  let maxJ = -Infinity;
  for (const key of world.cells.keys()) {
    const [i, j] = parseCellKey(key);
    minI = Math.min(minI, i);
    minJ = Math.min(minJ, j);
    maxI = Math.max(maxI, i);
    maxJ = Math.max(maxJ, j);
  }
  const loose: Pattern = { cols: 0, rows: 0, ...world };
  const pattern = remap(loose, maxI - minI + 1, maxJ - minJ + 1, (i, j) => [
    i - minI,
    j - minJ,
  ]);
  return { pattern: normalizeCuts(pattern), origin: [minI, minJ] };
}

/** Sets or clears (n ≤ 0) one particle. */
export function paintWorld(world: World, i: number, j: number, n: number) {
  const cells = new Map(world.cells);
  if (n <= 0) {
    cells.delete(cellKey(i, j));
  } else {
    if (!placeableAmong(cells, i, j)) {
      throw new Error(`cell ${i},${j} shares an edge with a particle`);
    }
    cells.set(cellKey(i, j), Math.min(n, MAX_SIZE));
  }
  return { cells, cuts: new Set(world.cuts) };
}

/**
 * Writes a preset centred on (ci, cj). The lattice is aligned with the
 * nearest existing particle (composition rule 5: touching spheres share
 * their diagonals), and any old particle left sharing an edge with the new
 * ones is removed.
 */
export function stampWorld(
  world: World,
  preset: Pattern,
  ci: number,
  cj: number,
  orientation = 0
): World {
  const source = orient(preset, orientation);
  let ox = ci - Math.floor(source.cols / 2);
  const oy = cj - Math.floor(source.rows / 2);
  const own = source.cells.keys().next();
  let nearest: [number, number] | undefined;
  let best = Infinity;
  for (const key of world.cells.keys()) {
    const [i, j] = parseCellKey(key);
    const d = Math.max(Math.abs(i - ci), Math.abs(j - cj));
    if (d < best) {
      best = d;
      nearest = [i, j];
    }
  }
  if (nearest && !own.done) {
    const [si, sj] = parseCellKey(own.value);
    if (latticeOf(si + ox, sj + oy) !== latticeOf(...nearest)) ox += 1;
  }
  const placed = remap(source, 0, 0, (i, j) => [i + ox, j + oy]);
  const cells = new Map(world.cells);
  for (const key of placed.cells.keys()) {
    const [i, j] = parseCellKey(key);
    for (const [di, dj] of ORTHOGONALS) cells.delete(cellKey(i + di, j + dj));
  }
  for (const [key, n] of placed.cells) cells.set(key, n);
  return { cells, cuts: new Set([...world.cuts, ...placed.cuts]) };
}
