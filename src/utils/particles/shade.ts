// Light-driven shading: a scene of spheres lit by one light, turned into a
// particle pattern. A point light sizes every particle by its distance from
// the light, so the shading of a composition converges on that point
// (composition rule 6); a directional light at infinity shades each sphere
// as a relief lit from one azimuth.
import {
  MAX_SIZE,
  type Pattern,
  cellKey,
  emptyPattern,
  latticeOf,
  normalizeCuts,
  parse,
  parseCellKey,
  parseConnectionKey,
} from './model.ts';
import { spherePreset } from './presets.ts';
import { mapCut, orient, orientVector } from './transform.ts';

export interface SphereSpec {
  d: number;
  /** Top-left cell of the sphere's d×d box. */
  i: number;
  j: number;
}

export type Light =
  | { kind: 'point'; x: number; y: number }
  | { kind: 'directional'; azimuth: number };

export interface Scene {
  spheres: SphereSpec[];
  /** Point light in cell units of the sphere space, or a direction. */
  light: Light;
  /** Positive brightens (smaller particles); one step per unit. */
  strength: number;
  /** Directional light: scales the modulation around the mean size. */
  contrast: number;
  /** Point light: distance in cells at which particles reach the largest size. */
  range: number;
  /** Use the guideline patterns (oriented to the light) where one exists. */
  canonical: boolean;
  /** Rule-6 cuts added on top of the derived pattern. */
  cuts: Set<string>;
}

export const MIN_DIAMETER = 3;
export const MAX_DIAMETER = 21;
export const MIN_RANGE = 2;
export const MAX_RANGE = 60;

/** Light azimuth the canonical spheres were fitted at: from the upper left. */
export const CANONICAL_AZIMUTH = 325;

// Least-squares fit against the four canonical spheres, in particle-size
// units: 69 of their 89 particles come out exact, 87 within one step. t is
// the position along the shadow direction, ρ² the squared distance from the
// centre (both normalised to the radius). The rim terms lighten the limb on
// the shadow side and darken it slightly on the lit side, as the originals do.
const FIT = {
  base: 4.9475,
  inverseDiameter: -4.1582,
  t: 4.5552,
  t2: 2.2666,
  rho2: -3.0942,
  rimShadow: -5.0385,
  rimLit: 2.0648,
};

const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Lattice cells of a sphere of diameter d, in its own box coordinates. */
export function sphereCells(d: number): [number, number][] {
  if (!Number.isInteger(d) || d < MIN_DIAMETER || d % 2 === 0) {
    throw new Error(`sphere diameter must be an odd number ≥ ${MIN_DIAMETER}`);
  }
  // The guideline fills the centre cell only for the 7-sphere; the others
  // (and every non-canonical size) leave it empty.
  const centreFilled = d === 7;
  const r = d / 2;
  const cells: [number, number][] = [];
  for (let j = 0; j < d; j++) {
    for (let i = 0; i < d; i++) {
      if ((latticeOf(i, j) === 0) !== centreFilled) continue;
      const dx = Math.max(0, Math.abs(i + 0.5 - r) - 0.5);
      const dy = Math.max(0, Math.abs(j + 0.5 - r) - 0.5);
      if (dx * dx + dy * dy < r * r) cells.push([i, j]);
    }
  }
  return cells;
}

/** Particle size at box cell (i, j) of a d-sphere lit from `azimuth`. */
export function shadeSize(
  d: number,
  i: number,
  j: number,
  azimuth: number,
  strength = 0,
  contrast = 1
): number {
  const r = d / 2;
  const ux = (i + 0.5 - r) / r;
  const uy = (j + 0.5 - r) / r;
  const a = (azimuth * Math.PI) / 180;
  // Unit vector from the light across the sphere: the shadow direction.
  const sx = -Math.sin(a);
  const sy = Math.cos(a);
  const t = ux * sx + uy * sy;
  const rho2 = Math.min(1, ux * ux + uy * uy);
  const modulation =
    FIT.t * t +
    FIT.t2 * t * t +
    FIT.rho2 * rho2 +
    FIT.rimShadow * rho2 * Math.max(t, 0) +
    FIT.rimLit * rho2 * Math.max(-t, 0);
  const value =
    FIT.base + FIT.inverseDiameter / d + contrast * modulation - strength;
  return Math.min(MAX_SIZE, Math.max(1, Math.round(value)));
}

/**
 * Particle size under a point light: grows linearly with the distance from
 * the light and saturates at `range` cells. Direction plays no part.
 */
export function pointSize(distance: number, range: number, strength = 0) {
  const value = 1 + 6 * Math.min(1, distance / range) - strength;
  return Math.min(MAX_SIZE, Math.max(1, Math.round(value)));
}

/** Compass azimuth (0 = up, 90 = right) from one point to another. */
export function azimuthTo(
  from: [number, number],
  to: [number, number]
): number {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (dx === 0 && dy === 0) return CANONICAL_AZIMUTH;
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** Unit vector pointing toward an azimuth, in screen coordinates. */
export function azimuthVector(azimuth: number): [number, number] {
  const a = (azimuth * Math.PI) / 180;
  return [Math.sin(a), -Math.cos(a)];
}

export const sphereCentre = (s: SphereSpec): [number, number] => [
  s.i + s.d / 2,
  s.j + s.d / 2,
];

export function sphereCellKeys(s: SphereSpec): Set<string> {
  return new Set(sphereCells(s.d).map(([i, j]) => cellKey(i + s.i, j + s.j)));
}

/** Whether two spheres overlap or would put particles on a shared edge. */
export function spheresConflict(a: SphereSpec, b: SphereSpec): boolean {
  if (
    a.i + a.d < b.i - 1 ||
    b.i + b.d < a.i - 1 ||
    a.j + a.d < b.j - 1 ||
    b.j + b.d < a.j - 1
  ) {
    return false;
  }
  const other = sphereCellKeys(b);
  for (const [i, j] of sphereCells(a.d)) {
    const ci = i + a.i;
    const cj = j + a.j;
    if (
      other.has(cellKey(ci, cj)) ||
      other.has(cellKey(ci + 1, cj)) ||
      other.has(cellKey(ci - 1, cj)) ||
      other.has(cellKey(ci, cj + 1)) ||
      other.has(cellKey(ci, cj - 1))
    ) {
      return true;
    }
  }
  return false;
}

interface Oriented {
  pattern: Pattern;
  light: [number, number];
}

const orientedCache = new Map<number, Oriented[]>();

// The eight orientations of a canonical sphere with the light direction each
// one implies. Every guideline sphere is lit from CANONICAL_AZIMUTH, so the
// light turns with the pattern.
function orientedPresets(d: number): Oriented[] | undefined {
  const cached = orientedCache.get(d);
  if (cached) return cached;
  const preset = spherePreset(d);
  if (!preset) return undefined;
  const plain = parse(preset.notation);
  const light = azimuthVector(CANONICAL_AZIMUTH);
  const all = Array.from({ length: 8 }, (_, orientation) => ({
    pattern: orient(plain, orientation),
    light: orientVector(light, orientation),
  }));
  orientedCache.set(d, all);
  return all;
}

/** Guideline pattern of a d-sphere turned to face the light, if one exists. */
export function canonicalFacing(
  d: number,
  azimuth: number
): Pattern | undefined {
  const options = orientedPresets(d);
  if (!options) return undefined;
  const [lx, ly] = azimuthVector(azimuth);
  let best = options[0];
  let score = -Infinity;
  for (const option of options) {
    const dot = option.light[0] * lx + option.light[1] * ly;
    if (dot > score) {
      score = dot;
      best = option;
    }
  }
  return best.pattern;
}

export interface SceneBounds {
  minI: number;
  minJ: number;
  maxI: number;
  maxJ: number;
}

/** Union of the spheres' boxes; a unit box at the origin when empty. */
export function sceneBounds(scene: Scene): SceneBounds {
  if (scene.spheres.length === 0) {
    return { minI: 0, minJ: 0, maxI: 1, maxJ: 1 };
  }
  let minI = Infinity;
  let minJ = Infinity;
  let maxI = -Infinity;
  let maxJ = -Infinity;
  for (const s of scene.spheres) {
    minI = Math.min(minI, s.i);
    minJ = Math.min(minJ, s.j);
    maxI = Math.max(maxI, s.i + s.d);
    maxJ = Math.max(maxJ, s.j + s.d);
  }
  return { minI, minJ, maxI, maxJ };
}

export function sceneCentre(scene: Scene): [number, number] {
  const b = sceneBounds(scene);
  return [(b.minI + b.maxI) / 2, (b.minJ + b.maxJ) / 2];
}

/** Azimuth the light has for one sphere. */
export function lightAzimuth(scene: Scene, sphere: SphereSpec): number {
  return scene.light.kind === 'point'
    ? azimuthTo(sphereCentre(sphere), [scene.light.x, scene.light.y])
    : scene.light.azimuth;
}

/**
 * Where to show the light: the point itself, or for a directional light a
 * marker just outside the spheres on the side it comes from.
 */
export function lightMarker(scene: Scene): [number, number] {
  if (scene.light.kind === 'point') return [scene.light.x, scene.light.y];
  const b = sceneBounds(scene);
  const [cx, cy] = sceneCentre(scene);
  const reach = Math.hypot(b.maxI - b.minI, b.maxJ - b.minJ) / 2 + 1.5;
  const [vx, vy] = azimuthVector(scene.light.azimuth);
  return [round2(cx + vx * reach), round2(cy + vy * reach)];
}

export function toDirectional(scene: Scene): Scene {
  if (scene.light.kind === 'directional') return scene;
  const azimuth = Math.round(
    azimuthTo(sceneCentre(scene), [scene.light.x, scene.light.y])
  );
  return { ...scene, light: { kind: 'directional', azimuth } };
}

export function toPoint(scene: Scene): Scene {
  if (scene.light.kind === 'point') return scene;
  const [x, y] = lightMarker(scene);
  return { ...scene, light: { kind: 'point', x, y } };
}

/** Moves the scene so its spheres start at the origin. */
export function normalizeScene(scene: Scene): Scene {
  if (scene.spheres.length === 0) return scene;
  const { minI, minJ } = sceneBounds(scene);
  if (minI === 0 && minJ === 0) return scene;
  const move = (i: number, j: number): [number, number] => [i - minI, j - minJ];
  return {
    ...scene,
    spheres: scene.spheres.map((s) => ({
      d: s.d,
      i: s.i - minI,
      j: s.j - minJ,
    })),
    light:
      scene.light.kind === 'point'
        ? {
            kind: 'point',
            x: round2(scene.light.x - minI),
            y: round2(scene.light.y - minJ),
          }
        : scene.light,
    cuts: new Set([...scene.cuts].map((key) => mapCut(key, move))),
  };
}

export interface DerivedScene {
  pattern: Pattern;
  /** Cuts that come from the guideline patterns themselves (pattern keys). */
  fixedCuts: Set<string>;
  /** Scene coordinates of the pattern's top-left cell. */
  origin: [number, number];
}

/**
 * Renders the scene's spheres into one pattern. Scene coordinates may start
 * anywhere; the pattern is translated to the origin and `origin` says by how
 * much, so an editor can keep drawing in scene space.
 */
export function deriveScene(scene: Scene): DerivedScene {
  if (scene.spheres.length === 0) {
    return {
      pattern: emptyPattern(1, 1),
      fixedCuts: new Set(),
      origin: [0, 0],
    };
  }
  const { minI, minJ, maxI, maxJ } = sceneBounds(scene);
  const pattern = emptyPattern(maxI - minI, maxJ - minJ);
  const fixedCuts = new Set<string>();
  for (const s of scene.spheres) {
    const azimuth = lightAzimuth(scene, s);
    const canonical = scene.canonical
      ? canonicalFacing(s.d, azimuth)
      : undefined;
    const ox = s.i - minI;
    const oy = s.j - minJ;
    if (canonical) {
      const move = (i: number, j: number): [number, number] => [i + ox, j + oy];
      for (const [key, n] of canonical.cells) {
        const [i, j] = parseCellKey(key);
        pattern.cells.set(cellKey(i + ox, j + oy), n);
      }
      for (const key of canonical.cuts) fixedCuts.add(mapCut(key, move));
      continue;
    }
    for (const [i, j] of sphereCells(s.d)) {
      const size =
        scene.light.kind === 'point'
          ? pointSize(
              Math.hypot(
                s.i + i + 0.5 - scene.light.x,
                s.j + j + 0.5 - scene.light.y
              ),
              scene.range,
              scene.strength
            )
          : shadeSize(s.d, i, j, azimuth, scene.strength, scene.contrast);
      pattern.cells.set(cellKey(i + ox, j + oy), size);
    }
  }
  const toPattern = (i: number, j: number): [number, number] => [
    i - minI,
    j - minJ,
  ];
  pattern.cuts = new Set([
    ...fixedCuts,
    ...[...scene.cuts].map((key) => mapCut(key, toPattern)),
  ]);
  return { pattern: normalizeCuts(pattern), fixedCuts, origin: [minI, minJ] };
}

// -------------------------------------------------------------- notation

/**
 * `L=x,y` (point) or `A=azimuth` (directional), then
 * `R=range;S=strength;C=contrast;P=canon|gen;D=d@i,j+d@i,j;X=cut+cut`.
 */
export function serializeScene(scene: Scene): string {
  const parts = [
    scene.light.kind === 'point'
      ? `L=${scene.light.x.toFixed(2)},${scene.light.y.toFixed(2)}`
      : `A=${scene.light.azimuth}`,
    `R=${scene.range}`,
    `S=${scene.strength}`,
    `C=${scene.contrast}`,
    `P=${scene.canonical ? 'canon' : 'gen'}`,
    `D=${scene.spheres.map((s) => `${s.d}@${s.i},${s.j}`).join('+')}`,
  ];
  if (scene.cuts.size) parts.push(`X=${[...scene.cuts].toSorted().join('+')}`);
  return parts.join(';');
}

export const isSceneNotation = (text: string): boolean =>
  text.startsWith('L=') || text.startsWith('A=');

function numberField(text: string | undefined, name: string): number {
  const value = Number(text);
  if (text === undefined || text === '' || !Number.isFinite(value)) {
    throw new Error(`invalid ${name}`);
  }
  return value;
}

export function parseScene(notation: string): Scene {
  const fields = new Map<string, string>();
  for (const part of notation.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 1) throw new Error(`invalid scene field "${part}"`);
    fields.set(part.slice(0, eq), part.slice(eq + 1));
  }
  const spheres = (fields.get('D') ?? '')
    .split('+')
    .filter(Boolean)
    .map((item) => {
      const m = item.match(/^(\d+)@(-?\d+),(-?\d+)$/);
      if (!m) throw new Error(`invalid sphere "${item}"`);
      const d = Number(m[1]);
      if (d < MIN_DIAMETER || d > MAX_DIAMETER || d % 2 === 0) {
        throw new Error(`unsupported diameter ${d}`);
      }
      return { d, i: Number(m[2]), j: Number(m[3]) };
    });
  for (let a = 0; a < spheres.length; a++) {
    for (let b = a + 1; b < spheres.length; b++) {
      if (spheresConflict(spheres[a], spheres[b])) {
        throw new Error('spheres overlap or share particle edges');
      }
    }
  }
  const cuts = new Set<string>();
  for (const key of (fields.get('X') ?? '').split('+').filter(Boolean)) {
    parseConnectionKey(key);
    cuts.add(key);
  }
  let light: Light;
  if (fields.has('A')) {
    const azimuth = numberField(fields.get('A'), 'azimuth');
    light = { kind: 'directional', azimuth: ((azimuth % 360) + 360) % 360 };
  } else {
    const [lx, ly] = (fields.get('L') ?? '').split(',');
    light = {
      kind: 'point',
      x: numberField(lx, 'light'),
      y: numberField(ly, 'light'),
    };
  }
  return normalizeScene({
    spheres,
    light,
    strength: Math.max(
      -3,
      Math.min(3, numberField(fields.get('S') ?? '0', 'strength'))
    ),
    contrast: Math.max(
      0.5,
      Math.min(1.5, numberField(fields.get('C') ?? '1', 'contrast'))
    ),
    range: Math.max(
      MIN_RANGE,
      Math.min(MAX_RANGE, numberField(fields.get('R') ?? '14', 'range'))
    ),
    canonical: fields.get('P') === 'canon',
    cuts,
  });
}

/** One sphere at the origin with a point light at the canonical azimuth. */
export function defaultScene(d: number): Scene {
  const sphere = { d, i: 0, j: 0 };
  const [cx, cy] = sphereCentre(sphere);
  const [vx, vy] = azimuthVector(CANONICAL_AZIMUTH);
  const reach = d / 2 + 2.5;
  return {
    spheres: [sphere],
    light: {
      kind: 'point',
      x: round2(cx + vx * reach),
      y: round2(cy + vy * reach),
    },
    strength: 0,
    contrast: 1,
    // Far enough for the sphere's far side to reach the largest size.
    range: d + 3,
    canonical: false,
    cuts: new Set(),
  };
}
