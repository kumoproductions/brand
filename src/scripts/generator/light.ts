// Step 1, light: pick sphere diameters, drag them and the light around, and
// let the shading follow.
import {
  type Scene,
  type SphereSpec,
  azimuthTo,
  latticeOf,
  lightMarker,
  sceneCentre,
  sphereCells,
  sphereCentre,
  spheresConflict,
  toDirectional,
  toPoint,
} from '../../utils/particles';
import { beginPan, canvas, markDrag, scenePoint, viewBounds } from './canvas';
import { $, root, showError, text } from './dom';
import { getState, record, subscribe, update } from './store';

type Drag =
  | { kind: 'light'; recorded: boolean }
  | {
      kind: 'sphere';
      index: number;
      offset: [number, number];
      recorded: boolean;
    };

let drag: Drag | undefined;
let sliding = false;

const active = () => getState().mode === 'light';
const round2 = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function withScene(patch: Partial<Scene>, options?: { record?: boolean }) {
  update({ scene: { ...getState().scene, ...patch } }, options);
}

function conflicts(spheres: SphereSpec[], candidate: SphereSpec, skip: number) {
  return spheres.some(
    (s, index) => index !== skip && spheresConflict(s, candidate)
  );
}

/**
 * Next free slot: an empty column to the right of everything placed, on the
 * same diagonal lattice as the first sphere (composition rule 5).
 */
function freeSpot(spheres: SphereSpec[], d: number): SphereSpec {
  if (spheres.length === 0) return { d, i: 0, j: 0 };
  const right = Math.max(...spheres.map((s) => s.i + s.d));
  const top = Math.min(...spheres.map((s) => s.j));
  const candidate = { d, i: right + 1, j: top };
  const [fi, fj] = sphereCells(spheres[0].d)[0];
  const [ci, cj] = sphereCells(d)[0];
  const first = latticeOf(fi + spheres[0].i, fj + spheres[0].j);
  if (latticeOf(ci + candidate.i, cj + candidate.j) !== first) candidate.i += 1;
  return candidate;
}

function addSphere(d: number) {
  const { scene } = getState();
  const spheres = [...scene.spheres, freeSpot(scene.spheres, d)];
  showError(undefined);
  update(
    { scene: { ...scene, spheres }, selected: spheres.length - 1 },
    { refit: true }
  );
}

function resizeSelected(d: number) {
  const { scene, selected } = getState();
  if (selected === undefined) return;
  const current = scene.spheres[selected];
  const next = {
    d,
    i: current.i + (current.d - d) / 2,
    j: current.j + (current.d - d) / 2,
  };
  if (conflicts(scene.spheres, next, selected)) {
    showError(text('conflict'));
    return;
  }
  showError(undefined);
  withScene({
    spheres: scene.spheres.map((s, index) => (index === selected ? next : s)),
  });
}

function removeSelected() {
  const { scene, selected } = getState();
  if (selected === undefined) return;
  update(
    {
      scene: {
        ...scene,
        spheres: scene.spheres.filter((_, index) => index !== selected),
      },
      selected: undefined,
    },
    { refit: true }
  );
}

function hitSphere(x: number, y: number): number | undefined {
  const { spheres } = getState().scene;
  for (let index = spheres.length - 1; index >= 0; index--) {
    const [cx, cy] = sphereCentre(spheres[index]);
    if (Math.hypot(x - cx, y - cy) <= spheres[index].d / 2 + 0.2) return index;
  }
  return undefined;
}

function onPointerDown(event: PointerEvent) {
  // Alt-drag and the middle button pan; the canvas handles those itself.
  if (!active() || event.button !== 0 || event.altKey) return;
  if ((event.target as Element).closest('circle[data-key]')) return;
  const [x, y] = scenePoint(event);
  const { scene, selected } = getState();
  const [mx, my] = lightMarker(scene);
  if (Math.hypot(x - mx, y - my) <= 0.7) {
    drag = { kind: 'light', recorded: false };
  } else {
    const index = hitSphere(x, y);
    if (index === undefined) {
      if (selected !== undefined) {
        update({ selected: undefined }, { record: false });
      }
      beginPan(event);
      event.preventDefault();
      return;
    }
    const s = scene.spheres[index];
    drag = {
      kind: 'sphere',
      index,
      offset: [x - s.i, y - s.j],
      recorded: false,
    };
    if (selected !== index) update({ selected: index }, { record: false });
  }
  // Synthetic events carry no pointer type and cannot be captured.
  if (event.pointerType) canvas.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function onPointerMove(event: PointerEvent) {
  if (!drag) return;
  const [x, y] = scenePoint(event);
  const { scene } = getState();
  if (drag.kind === 'light') {
    if (!drag.recorded) {
      record();
      drag.recorded = true;
    }
    if (scene.light.kind === 'point') {
      // Keep the light inside the view so it can always be picked up again.
      const b = viewBounds();
      withScene(
        {
          light: {
            kind: 'point',
            x: round2(clamp(x, b.x0 + 0.4, b.x1 - 0.4)),
            y: round2(clamp(y, b.y0 + 0.4, b.y1 - 0.4)),
          },
        },
        { record: false }
      );
    } else {
      withScene(
        {
          light: {
            kind: 'directional',
            azimuth: Math.round(azimuthTo(sceneCentre(scene), [x, y])) % 360,
          },
        },
        { record: false }
      );
    }
  } else {
    const current = scene.spheres[drag.index];
    const target = {
      d: current.d,
      i: Math.round(x - drag.offset[0]),
      j: Math.round(y - drag.offset[1]),
    };
    if (target.i === current.i && target.j === current.j) return;
    if (conflicts(scene.spheres, target, drag.index)) return;
    if (!drag.recorded) {
      record();
      drag.recorded = true;
    }
    const index = drag.index;
    withScene(
      { spheres: scene.spheres.map((s, k) => (k === index ? target : s)) },
      { record: false }
    );
  }
  markDrag();
}

function onPointerUp(event: PointerEvent) {
  if (!drag) return;
  drag = undefined;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function renderPanel() {
  const { scene, selected } = getState();
  const directional = scene.light.kind === 'directional';
  for (const button of root.querySelectorAll<HTMLElement>(
    '[data-light-kind]'
  )) {
    button.setAttribute(
      'aria-pressed',
      String((button.dataset.lightKind === 'directional') === directional)
    );
  }
  $<HTMLElement>('#gen-azimuth-row').hidden = !directional;
  if (scene.light.kind === 'directional') {
    $<HTMLInputElement>('#gen-azimuth').value = String(scene.light.azimuth);
    $('#gen-azimuth-value').textContent = `${scene.light.azimuth}°`;
  }
  const strength = $<HTMLInputElement>('#gen-strength');
  const contrast = $<HTMLInputElement>('#gen-contrast');
  const range = $<HTMLInputElement>('#gen-range');
  strength.value = String(scene.strength);
  contrast.value = String(scene.contrast);
  range.value = String(scene.range);
  strength.disabled = scene.canonical;
  contrast.disabled = scene.canonical;
  range.disabled = scene.canonical;
  $('#gen-strength-value').textContent = scene.strength.toFixed(2);
  $('#gen-contrast-value').textContent = scene.contrast.toFixed(2);
  $('#gen-range-value').textContent = String(scene.range);
  // A directional light shades by direction (contrast); a point light by
  // distance (range).
  $<HTMLElement>('#gen-contrast-row').hidden = !directional;
  $<HTMLElement>('#gen-range-row').hidden = directional;
  for (const button of root.querySelectorAll<HTMLElement>('[data-shading]')) {
    button.setAttribute(
      'aria-pressed',
      String((button.dataset.shading === 'canon') === scene.canonical)
    );
  }
  const selection = $<HTMLElement>('#gen-selection');
  selection.hidden = selected === undefined;
  if (selected !== undefined) {
    $<HTMLSelectElement>('#gen-sphere-size').value = String(
      scene.spheres[selected].d
    );
  }
}

/** Sliders record one undo step per interaction and update live. */
function bindSlider(id: string, apply: (value: number) => Partial<Scene>) {
  const input = $<HTMLInputElement>(`#gen-${id}`);
  input.addEventListener('input', () => {
    if (!sliding) {
      record();
      sliding = true;
    }
    withScene(apply(Number(input.value)), { record: false });
  });
  input.addEventListener('change', () => {
    sliding = false;
  });
}

export function initLight(): void {
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  root.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-add-sphere], [data-shading], [data-light-kind]'
    );
    if (!button) return;
    if (button.dataset.addSphere) {
      addSphere(Number(button.dataset.addSphere));
    } else if (button.dataset.shading) {
      withScene({ canonical: button.dataset.shading === 'canon' });
    } else {
      const { scene } = getState();
      const next =
        button.dataset.lightKind === 'directional'
          ? toDirectional(scene)
          : toPoint(scene);
      if (next !== scene) update({ scene: next }, { refit: true });
    }
  });

  $('#gen-sphere-size').addEventListener('change', (event) => {
    resizeSelected(Number((event.target as HTMLSelectElement).value));
  });
  $('#gen-sphere-remove').addEventListener('click', removeSelected);

  bindSlider('strength', (strength) => ({ strength }));
  bindSlider('contrast', (contrast) => ({ contrast }));
  bindSlider('range', (range) => ({ range }));
  bindSlider('azimuth', (azimuth) => ({
    light: { kind: 'directional', azimuth },
  }));

  $('#gen-light-clear').addEventListener('click', () => {
    const { scene } = getState();
    update(
      {
        scene: { ...scene, spheres: [], cuts: new Set() },
        selected: undefined,
      },
      { refit: true }
    );
  });

  document.addEventListener('keydown', (event) => {
    if (
      !active() ||
      (event.target as HTMLElement).closest('input, textarea, select')
    ) {
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') removeSelected();
  });

  subscribe(renderPanel);
  renderPanel();
}
