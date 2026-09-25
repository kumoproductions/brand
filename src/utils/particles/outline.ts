// Outline tracing and SVG output for a particle pattern.
import {
  CELL,
  CORNER_RADIUS,
  DIAGONALS,
  FILLET_RADIUS,
  type CellKey,
  type Dir,
  type Pattern,
  cellKey,
  connectionKey,
  listConnections,
  parseCellKey,
  sideOf,
} from './model.ts';

interface Rect {
  key: CellKey;
  i: number;
  j: number;
  cx: number;
  cy: number;
  h: number;
}

interface Segment {
  id: string;
  rect: Rect;
  k: number;
  from: [number, number];
  to: [number, number];
  next: string;
  endRadius: number;
}

export interface OutlinePath {
  d: string;
  cells: CellKey[];
}

// Edge k runs clockwise from corner k to corner k + 1.
const EDGE_DIR: readonly [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function corner(r: Rect, c: number): [number, number] {
  const sx = c === 1 || c === 2 ? 1 : -1;
  const sy = c >= 2 ? 1 : -1;
  return [r.cx + sx * r.h, r.cy + sy * r.h];
}

function fmt(v: number): string {
  return String(Math.round(v * 100) / 100);
}

function loopPath(segments: Segment[]): string {
  const parts: string[] = [];
  const last = segments.length - 1;
  const startOf = (idx: number): [number, number] => {
    const s = segments[idx];
    const r = segments[idx === 0 ? last : idx - 1].endRadius;
    const [dx, dy] = EDGE_DIR[s.k];
    return [s.from[0] + dx * r, s.from[1] + dy * r];
  };
  const [x0, y0] = startOf(0);
  parts.push(`M${fmt(x0)} ${fmt(y0)}`);
  segments.forEach((s, idx) => {
    const [dx, dy] = EDGE_DIR[s.k];
    const end: [number, number] = [
      s.to[0] - dx * s.endRadius,
      s.to[1] - dy * s.endRadius,
    ];
    parts.push(s.k % 2 === 0 ? `H${fmt(end[0])}` : `V${fmt(end[1])}`);
    const nextIdx = idx === last ? 0 : idx + 1;
    const [nx, ny] = EDGE_DIR[segments[nextIdx].k];
    const sweep = dx * ny - dy * nx > 0 ? 1 : 0;
    const [sx, sy] = startOf(nextIdx);
    const r = fmt(s.endRadius);
    parts.push(`A${r} ${r} 0 0 ${sweep} ${fmt(sx)} ${fmt(sy)}`);
  });
  parts.push('Z');
  return parts.join('');
}

/**
 * Traces the filled outline: one path per connected group, holes included.
 * Each square's edges are walked clockwise; where a joined neighbour covers
 * an edge's end the walk turns onto that neighbour's edge through a concave
 * fillet, otherwise it rounds the particle's own corner.
 */
export function outline(pattern: Pattern): OutlinePath[] {
  const rects = new Map<CellKey, Rect>();
  const keys = [...pattern.cells.keys()].toSorted((a, b) => {
    const [ai, aj] = parseCellKey(a);
    const [bi, bj] = parseCellKey(b);
    return aj - bj || ai - bi;
  });
  for (const key of keys) {
    const [i, j] = parseCellKey(key);
    rects.set(key, {
      key,
      i,
      j,
      cx: (i + 0.5) * CELL,
      cy: (j + 0.5) * CELL,
      h: sideOf(pattern.cells.get(key) as number) / 2,
    });
  }

  const active = new Set(
    listConnections(pattern)
      .filter((c) => !c.cut)
      .map((c) => c.key)
  );
  const parent = new Map<CellKey, CellKey>();
  const find = (k: CellKey): CellKey => {
    let root = k;
    for (;;) {
      const up = parent.get(root);
      if (up === undefined || up === root) return root;
      root = up;
    }
  };
  const union = (a: CellKey, b: CellKey) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  const joinedAt = (r: Rect, c: number): Rect | undefined => {
    const [di, dj] = DIAGONALS[c];
    const q = rects.get(cellKey(r.i + di, r.j + dj));
    if (!q) return undefined;
    const upper = dj < 0 ? q : r;
    const lower = dj < 0 ? r : q;
    const dir: Dir = lower.i < upper.i ? 'l' : 'r';
    if (!active.has(connectionKey(upper.i, upper.j, dir))) return undefined;
    union(r.key, q.key);
    return q;
  };

  const segments = new Map<string, Segment>();
  for (const r of rects.values()) {
    for (let k = 0; k < 4; k++) {
      const q = joinedAt(r, k);
      const next = joinedAt(r, (k + 1) % 4);
      const from = corner(r, k);
      const to = corner(r, (k + 1) % 4);
      const axis = k % 2;
      const sign = k < 2 ? 1 : -1;
      if (q) from[axis] = (axis === 0 ? q.cx : q.cy) + sign * q.h;
      if (next) to[axis] = (axis === 0 ? next.cx : next.cy) - sign * next.h;
      segments.set(`${r.key}:${k}`, {
        id: `${r.key}:${k}`,
        rect: r,
        k,
        from,
        to,
        next: next ? `${next.key}:${(k + 3) % 4}` : `${r.key}:${(k + 1) % 4}`,
        endRadius: next ? FILLET_RADIUS : CORNER_RADIUS,
      });
    }
  }

  const visited = new Set<string>();
  const groups = new Map<CellKey, { d: string[]; cells: Set<CellKey> }>();
  for (const start of segments.values()) {
    if (visited.has(start.id)) continue;
    const loop: Segment[] = [];
    let cursor: Segment | undefined = start;
    while (cursor && !visited.has(cursor.id)) {
      visited.add(cursor.id);
      loop.push(cursor);
      cursor = segments.get(cursor.next);
    }
    const root = find(start.rect.key);
    const group = groups.get(root) ?? { d: [], cells: new Set<CellKey>() };
    group.d.push(loopPath(loop));
    for (const s of loop) group.cells.add(s.rect.key);
    groups.set(root, group);
  }
  return [...groups.values()].map((g) => ({
    d: g.d.join(''),
    cells: [...g.cells],
  }));
}

export interface RenderOptions {
  fill?: string;
  background?: string;
  /** Rendered width; height follows the grid's aspect ratio. */
  width?: number;
}

export function renderSvg(
  pattern: Pattern,
  { fill = '#ffffff', background, width }: RenderOptions = {}
): string {
  const w = pattern.cols * CELL;
  const h = pattern.rows * CELL;
  const size =
    width === undefined
      ? ''
      : ` width="${width}" height="${fmt((width * h) / w)}"`;
  const bg =
    background === undefined
      ? ''
      : `\n  <rect width="${w}" height="${h}" fill="${background}"/>`;
  const paths = outline(pattern)
    .map((p) => `\n  <path d="${p.d}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size} fill="${fill}">${bg}${paths}\n</svg>\n`;
}
