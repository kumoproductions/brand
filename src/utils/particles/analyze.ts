// Composition checks: which canonical spheres a pattern contains and which
// of the guideline's composition rules it strains.
import {
  CELL,
  type CellKey,
  type Pattern,
  cellKey,
  eligible,
  latticeOf,
  listConnections,
  parse,
  parseCellKey,
  sideOf,
} from './model.ts';
import { type Preset, SPHERES } from './presets.ts';
import { orient } from './transform.ts';

export interface FoundSphere {
  preset: Preset;
  i: number;
  j: number;
  orientation: number;
}

export interface Analysis {
  particles: number;
  connections: number;
  cuts: number;
  spheres: FoundSphere[];
  /** Particles not accounted for by any canonical sphere. */
  custom: number;
  /** Sphere ids placed more than once. */
  duplicates: string[];
  /** Distinct diagonal lattices in use. */
  lattices: number;
  /** Overlapping diagonal pairs that rule 5 does not join (a 7 next to a 2). */
  overlaps: number;
}

export function analyze(pattern: Pattern): Analysis {
  const connections = listConnections(pattern);
  const claimed = new Set<CellKey>();
  const spheres: FoundSphere[] = [];
  const candidates = SPHERES.map((preset) => ({
    preset,
    plain: parse(preset.notation),
  })).toSorted((a, b) => b.plain.cells.size - a.plain.cells.size);
  for (const { preset, plain } of candidates) {
    for (let orientation = 0; orientation < 8; orientation++) {
      const source = orient(plain, orientation);
      for (let oy = 0; oy + source.rows <= pattern.rows; oy++) {
        for (let ox = 0; ox + source.cols <= pattern.cols; ox++) {
          let match = true;
          for (const [key, n] of source.cells) {
            const [i, j] = parseCellKey(key);
            const target = cellKey(i + ox, j + oy);
            if (pattern.cells.get(target) !== n || claimed.has(target)) {
              match = false;
              break;
            }
          }
          if (!match) continue;
          for (const key of source.cells.keys()) {
            const [i, j] = parseCellKey(key);
            claimed.add(cellKey(i + ox, j + oy));
          }
          spheres.push({ preset, i: ox, j: oy, orientation });
        }
      }
    }
  }
  const counts = new Map<string, number>();
  for (const s of spheres) {
    counts.set(s.preset.id, (counts.get(s.preset.id) ?? 0) + 1);
  }
  const parities = new Set<number>();
  let overlaps = 0;
  for (const [key, n] of pattern.cells) {
    const [i, j] = parseCellKey(key);
    parities.add(latticeOf(i, j));
    for (const di of [-1, 1]) {
      const n2 = pattern.cells.get(cellKey(i + di, j + 1));
      if (n2 === undefined || eligible(n, n2)) continue;
      if (sideOf(n) + sideOf(n2) > 2 * CELL) overlaps++;
    }
  }
  return {
    particles: pattern.cells.size,
    connections: connections.filter((c) => !c.cut).length,
    cuts: connections.filter((c) => c.cut).length,
    spheres,
    custom: pattern.cells.size - claimed.size,
    duplicates: [...counts].filter(([, count]) => count > 1).map(([id]) => id),
    lattices: parities.size,
    overlaps,
  };
}
