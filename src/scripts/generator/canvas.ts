// The editor canvas: an infinite world grid drawn as inline SVG through a
// camera (centre + visible width) that only moves for the zoom and pan
// gestures or an explicit fit — never while something is dragged. The
// dashed frame marks the export box, which follows the particles.
import {
  CELL,
  type Connection,
  type Pattern,
  type SphereSpec,
  renderSvg,
} from '../../utils/particles';
import { $, isLightColor } from './dom';

export const canvas = $<SVGSVGElement>('#gen-canvas');
const plate = $<HTMLElement>('#gen-plate');

const JOINT_RADIUS = 3.2;
const LIGHT_RADIUS = 6;
/** Height over width of the canvas; matches the CSS aspect-ratio. */
const ASPECT = 3 / 4;
const MIN_WIDTH = 6;
const MAX_WIDTH = 200;

export interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface LightView {
  x: number;
  y: number;
  directional: boolean;
  /** Point the directional marker faces. */
  toward?: [number, number];
}

export interface CanvasView {
  pattern: Pattern;
  /** World coordinates of the pattern's top-left cell. */
  origin: [number, number];
  connections: Connection[];
  fixedCuts: Set<string>;
  fill: string;
  /** Empty for automatic contrast against the fill. */
  background: string;
  showSizes: boolean;
  light?: LightView;
  spheres?: SphereSpec[];
  selected?: number;
}

interface Camera {
  x: number;
  y: number;
  /** Visible width in cells. */
  w: number;
}

let camera: Camera = { x: 5.5, y: 5.5, w: 18 };
let lastView: CanvasView | undefined;
let dragMovedAt = 0;

const clampWidth = (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w));

/** True right after a drag, so the click it releases is not an edit. */
export const wasDragging = (): boolean => performance.now() - dragMovedAt < 150;
export const markDrag = (): void => {
  dragMovedAt = performance.now();
};

export function viewBounds(): Bounds {
  const h = camera.w * ASPECT;
  return {
    x0: camera.x - camera.w / 2,
    y0: camera.y - h / 2,
    x1: camera.x + camera.w / 2,
    y1: camera.y + h / 2,
  };
}

export function fitCamera(b: Bounds): void {
  const margin = 1.5;
  const w = Math.max(
    b.x1 - b.x0 + 2 * margin,
    (b.y1 - b.y0 + 2 * margin) / ASPECT
  );
  camera = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: clampWidth(w) };
  draw();
}

/** Zooms by `factor` (> 1 zooms in), keeping `at` fixed on screen. */
export function zoomCamera(factor: number, at?: [number, number]): void {
  const w = clampWidth(camera.w / factor);
  const k = w / camera.w;
  const anchor = at ?? [camera.x, camera.y];
  camera = {
    x: anchor[0] - (anchor[0] - camera.x) * k,
    y: anchor[1] - (anchor[1] - camera.y) * k,
    w,
  };
  draw();
}

function panCamera(dx: number, dy: number): void {
  camera = { x: camera.x - dx, y: camera.y - dy, w: camera.w };
  draw();
}

/** Pointer position in world cell units. */
export function scenePoint(event: {
  clientX: number;
  clientY: number;
}): [number, number] {
  const ctm = canvas.getScreenCTM();
  if (!ctm) throw new Error('canvas has no screen transform');
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
    ctm.inverse()
  );
  return [point.x / CELL, point.y / CELL];
}

/** World cell under the pointer. */
export function worldCell(event: {
  clientX: number;
  clientY: number;
}): [number, number] {
  const [x, y] = scenePoint(event);
  return [Math.floor(x), Math.floor(y)];
}

// ------------------------------------------------------------------ pan

let pan: { x: number; y: number } | undefined;

/** Starts panning from a pointerdown; the caller decides when that applies. */
export function beginPan(event: PointerEvent): void {
  pan = { x: event.clientX, y: event.clientY };
  // Synthetic events carry no pointer type and cannot be captured.
  if (event.pointerType) canvas.setPointerCapture(event.pointerId);
}

canvas.addEventListener('pointerdown', (event) => {
  if (event.button === 1 || (event.button === 0 && event.altKey)) {
    beginPan(event);
    event.preventDefault();
  }
});

canvas.addEventListener('pointermove', (event) => {
  if (!pan) return;
  const cellsPerPixel = camera.w / canvas.clientWidth;
  panCamera(
    (event.clientX - pan.x) * cellsPerPixel,
    (event.clientY - pan.y) * cellsPerPixel
  );
  pan = { x: event.clientX, y: event.clientY };
  markDrag();
});

const endPan = (event: PointerEvent) => {
  if (!pan) return;
  pan = undefined;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
};
canvas.addEventListener('pointerup', endPan);
canvas.addEventListener('pointercancel', endPan);

canvas.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();
    zoomCamera(Math.exp(-event.deltaY * 0.0012), scenePoint(event));
  },
  { passive: false }
);

// ----------------------------------------------------------------- draw

export function renderCanvas(view: CanvasView): void {
  lastView = view;
  draw();
}

function draw(): void {
  const view = lastView;
  if (!view) return;
  const [ox, oy] = view.origin;
  const background =
    view.background || (isLightColor(view.fill) ? '#1e1e1e' : '#ffffff');
  plate.style.background = background;
  plate.style.color = isLightColor(background) ? '#000000' : '#ffffff';

  const b = viewBounds();
  canvas.setAttribute(
    'viewBox',
    `${b.x0 * CELL} ${b.y0 * CELL} ${(b.x1 - b.x0) * CELL} ${(b.y1 - b.y0) * CELL}`
  );

  // World grid across the whole view; fades out once cells get tiny.
  const grid: string[] = [];
  if (camera.w <= 120) {
    for (let x = Math.ceil(b.x0); x <= Math.floor(b.x1); x++) {
      grid.push(
        `<line x1="${x * CELL}" y1="${b.y0 * CELL}" x2="${x * CELL}" y2="${b.y1 * CELL}"/>`
      );
    }
    for (let y = Math.ceil(b.y0); y <= Math.floor(b.y1); y++) {
      grid.push(
        `<line x1="${b.x0 * CELL}" y1="${y * CELL}" x2="${b.x1 * CELL}" y2="${y * CELL}"/>`
      );
    }
  }
  const frame = view.pattern.cells.size
    ? `<rect class="gen-frame" x="${ox * CELL}" y="${oy * CELL}" width="${view.pattern.cols * CELL}" height="${view.pattern.rows * CELL}"/>`
    : '';
  // Only the art is copied over from the generated file; the rest is chrome.
  const art =
    renderSvg(view.pattern, { fill: view.fill })
      .match(/<path[^>]*\/>/g)
      ?.join('') ?? '';
  const labels: string[] = [];
  if (view.showSizes) {
    const color = isLightColor(view.fill) ? '#000000' : '#ffffff';
    for (const [key, n] of view.pattern.cells) {
      const [i, j] = key.split(',').map(Number);
      labels.push(
        `<text x="${(i + 0.5) * CELL}" y="${(j + 0.5) * CELL}" fill="${color}">${n}</text>`
      );
    }
  }
  const joints = view.connections
    .map((c) => {
      const fixed = !c.cuttable || view.fixedCuts.has(c.key);
      const cls = [c.cut ? 'is-cut' : '', fixed ? 'is-fixed' : '']
        .filter(Boolean)
        .join(' ');
      return `<circle class="${cls}" data-key="${c.key}" cx="${c.x}" cy="${c.y}" r="${JOINT_RADIUS}"/>`;
    })
    .join('');
  const spheres = (view.spheres ?? [])
    .map((s, index) => {
      const cls =
        index === view.selected ? 'gen-sphere is-selected' : 'gen-sphere';
      return `<circle class="${cls}" cx="${(s.i + s.d / 2) * CELL}" cy="${(s.j + s.d / 2) * CELL}" r="${(s.d / 2) * CELL + 4}"/>`;
    })
    .join('');
  const shifted = `transform="translate(${ox * CELL} ${oy * CELL})"`;
  canvas.innerHTML =
    `<g class="gen-grid">${grid.join('')}</g>` +
    frame +
    `<g class="gen-spheres">${spheres}</g>` +
    `<g class="gen-art" fill="${view.fill}" ${shifted}>${art}</g>` +
    `<g class="gen-labels" ${shifted}>${labels.join('')}</g>` +
    `<rect class="gen-hover" id="gen-hover" width="${CELL}" height="${CELL}" hidden/>` +
    `<g class="gen-joints" ${shifted}>${joints}</g>` +
    lightMarkup(view.light);
}

function lightMarkup(light: LightView | undefined): string {
  if (!light) return '';
  const rays = Array.from(
    { length: 8 },
    (_, k) =>
      `<line x1="${LIGHT_RADIUS + 3}" y1="0" x2="${LIGHT_RADIUS + 7}" y2="0" transform="rotate(${k * 45})"/>`
  ).join('');
  let beam = '';
  if (light.directional && light.toward) {
    // A short dashed line toward the spheres shows the direction of travel.
    const dx = light.toward[0] - light.x;
    const dy = light.toward[1] - light.y;
    const length = Math.hypot(dx, dy) || 1;
    const reach = Math.min(length, 2.5) * CELL;
    beam = `<line class="gen-beam" x1="${(dx / length) * (LIGHT_RADIUS + 9)}" y1="${(dy / length) * (LIGHT_RADIUS + 9)}" x2="${(dx / length) * reach}" y2="${(dy / length) * reach}"/>`;
  }
  const cls = light.directional ? 'gen-light is-directional' : 'gen-light';
  return `<g class="${cls}" transform="translate(${light.x * CELL} ${light.y * CELL})">${beam}<circle r="${LIGHT_RADIUS}"/>${rays}</g>`;
}

export function showHover(
  worldI: number,
  worldJ: number,
  blocked: boolean
): void {
  const hover = document.getElementById('gen-hover');
  if (!hover) return;
  hover.removeAttribute('hidden');
  hover.setAttribute('x', String(worldI * CELL));
  hover.setAttribute('y', String(worldJ * CELL));
  hover.classList.toggle('is-blocked', blocked);
}

export function hideHover(): void {
  document.getElementById('gen-hover')?.setAttribute('hidden', '');
}
