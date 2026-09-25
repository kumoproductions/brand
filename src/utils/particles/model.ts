// Particle model for the kumo™ symbol (Symbol — Systems, §04).
//
// Coordinates: i = column, j = row. Particles only ever meet diagonally — two
// may never share a cell edge — so within one sphere they all sit on one
// diagonal lattice. A size-n particle is a 3a(n+1) square with 2a corners on
// a 15a cell. Rule 5 joins every eligible diagonal pair with a 1.5a fillet;
// rule 6 lets an outer-edge particle keep just one of its joins.
//
// At a = 2 the canonical spheres in content/sphere/svg come out on integer
// coordinates.

export const UNIT = 2;
export const CELL = 15 * UNIT;
export const CORNER_RADIUS = 2 * UNIT;
export const FILLET_RADIUS = 1.5 * UNIT;
export const MAX_SIZE = 7;

export type CellKey = string;
export type Dir = 'l' | 'r';

export const cellKey = (i: number, j: number): CellKey => `${i},${j}`;
export const parseCellKey = (key: CellKey): [number, number] =>
  key.split(',').map(Number) as [number, number];
/**
 * Which of the two diagonal lattices a cell belongs to (0 or 1). `& 1`
 * rather than `% 2`, which yields -1 for the negative world coordinates.
 */
export const latticeOf = (i: number, j: number): number => (i + j) & 1;

export const connectionKey = (i: number, j: number, dir: Dir): string =>
  `${i}:${j}${dir}`;

const CUT_KEY = /^(-?\d+):(-?\d+)([lr])$/;

export function parseConnectionKey(key: string): [number, number, Dir] {
  const m = key.match(CUT_KEY);
  if (!m) throw new Error(`invalid cut "${key}"`);
  return [Number(m[1]), Number(m[2]), m[3] as Dir];
}

export interface Pattern {
  cols: number;
  rows: number;
  cells: Map<CellKey, number>;
  /** Rule-6 exceptions, keyed by the upper particle and the side of the lower one. */
  cuts: Set<string>;
}

export interface Connection {
  key: string;
  i: number;
  j: number;
  dir: Dir;
  i2: number;
  j2: number;
  /** Grid corner shared by the pair, in viewBox units. */
  x: number;
  y: number;
  cut: boolean;
  /** Whether rule 6 permits cutting this connection right now. */
  cuttable: boolean;
}

export const sideOf = (n: number): number => 3 * UNIT * (n + 1);

/** Rule 5: a particle of size ≥5 diagonally adjacent to one of size ≥3. */
export const eligible = (a: number, b: number): boolean =>
  Math.max(a, b) >= 5 && Math.min(a, b) >= 3;

// Corner order 0 TL, 1 TR, 2 BR, 3 BL; the diagonal neighbour at each corner.
export const DIAGONALS: readonly [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

export const ORTHOGONALS: readonly [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function emptyPattern(cols: number, rows: number): Pattern {
  return { cols, rows, cells: new Map(), cuts: new Set() };
}

export function clonePattern(pattern: Pattern): Pattern {
  return {
    cols: pattern.cols,
    rows: pattern.rows,
    cells: new Map(pattern.cells),
    cuts: new Set(pattern.cuts),
  };
}

// ---------------------------------------------------------------- notation

/**
 * Compact text form: rows joined by `-`, `.` for an empty cell and 1–7 for a
 * particle, optionally followed by `~` and comma-separated cut keys.
 */
export function serialize(pattern: Pattern): string {
  const rows: string[] = [];
  for (let j = 0; j < pattern.rows; j++) {
    let row = '';
    for (let i = 0; i < pattern.cols; i++) {
      row += pattern.cells.get(cellKey(i, j)) ?? '.';
    }
    rows.push(row);
  }
  const cuts = [...pattern.cuts].toSorted();
  return rows.join('-') + (cuts.length ? `~${cuts.join(',')}` : '');
}

export function parse(notation: string): Pattern {
  const [body, cutList] = notation.split('~');
  const rows = body.split('-');
  const cells = new Map<CellKey, number>();
  let cols = 1;
  rows.forEach((row, j) => {
    cols = Math.max(cols, row.length);
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.') continue;
      const n = Number(ch);
      if (!Number.isInteger(n) || n < 1 || n > MAX_SIZE) {
        throw new Error(`invalid particle size "${ch}" at ${i},${j}`);
      }
      cells.set(cellKey(i, j), n);
    }
  });
  const cuts = new Set<string>();
  if (cutList) {
    for (const key of cutList.split(',')) {
      parseConnectionKey(key);
      cuts.add(key);
    }
  }
  const pattern = { cols, rows: rows.length, cells, cuts };
  for (const key of cells.keys()) {
    const [i, j] = parseCellKey(key);
    if (!placeable(pattern, i, j)) {
      throw new Error(`particles share an edge at ${i},${j}`);
    }
  }
  return normalizeCuts(pattern);
}

// ------------------------------------------------------------- connections

/** Whether a particle may sit at (i, j): no particle on a shared edge. */
export function placeable(pattern: Pattern, i: number, j: number): boolean {
  return placeableAmong(pattern.cells, i, j);
}

export function placeableAmong(
  cells: Map<CellKey, number>,
  i: number,
  j: number
): boolean {
  return ORTHOGONALS.every(([di, dj]) => !cells.has(cellKey(i + di, j + dj)));
}

export function diagonalNeighbours(pattern: Pattern, i: number, j: number) {
  return DIAGONALS.filter(([di, dj]) =>
    pattern.cells.has(cellKey(i + di, j + dj))
  ).length;
}

/** Rule 6 applies to particles on the outer edge: fewer than four neighbours. */
export const isOuter = (pattern: Pattern, i: number, j: number): boolean =>
  diagonalNeighbours(pattern, i, j) < 4;

export function listConnections(pattern: Pattern): Connection[] {
  const connections: Connection[] = [];
  const active = new Map<CellKey, number>();
  const bump = (i: number, j: number) => {
    const key = cellKey(i, j);
    active.set(key, (active.get(key) ?? 0) + 1);
  };
  for (const [key, n] of pattern.cells) {
    const [i, j] = parseCellKey(key);
    for (const dir of ['l', 'r'] as const) {
      const i2 = dir === 'l' ? i - 1 : i + 1;
      const j2 = j + 1;
      const n2 = pattern.cells.get(cellKey(i2, j2));
      if (n2 === undefined || !eligible(n, n2)) continue;
      const ckey = connectionKey(i, j, dir);
      const cut = pattern.cuts.has(ckey);
      if (!cut) {
        bump(i, j);
        bump(i2, j2);
      }
      connections.push({
        key: ckey,
        i,
        j,
        dir,
        i2,
        j2,
        x: (dir === 'l' ? i : i + 1) * CELL,
        y: (j + 1) * CELL,
        cut,
        cuttable: false,
      });
    }
  }
  // Joins the particle would keep if this one were cut.
  const others = (i: number, j: number, live: boolean) =>
    (active.get(cellKey(i, j)) ?? 0) - (live ? 1 : 0);
  for (const c of connections) {
    c.cuttable =
      (isOuter(pattern, c.i, c.j) && others(c.i, c.j, !c.cut) >= 1) ||
      (isOuter(pattern, c.i2, c.j2) && others(c.i2, c.j2, !c.cut) >= 1);
  }
  return connections.toSorted(
    (a, b) => a.j - b.j || a.i - b.i || a.dir.localeCompare(b.dir)
  );
}

/** Drops cuts that no longer name an eligible pair or violate rule 6. */
export function normalizeCuts(pattern: Pattern): Pattern {
  let current = pattern;
  for (;;) {
    const valid = new Set(
      listConnections(current)
        .filter((c) => c.cut && c.cuttable)
        .map((c) => c.key)
    );
    if (valid.size === current.cuts.size) return current;
    current = {
      cols: current.cols,
      rows: current.rows,
      cells: current.cells,
      cuts: valid,
    };
  }
}
