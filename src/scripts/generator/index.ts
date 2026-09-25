// Sphere generator entry point: wires the two steps (light, detail) to the
// shared canvas, checks, and output.
import {
  type Pattern,
  analyze,
  isSceneNotation,
  lightMarker,
  listConnections,
  mapCut,
  parse,
  parseScene,
  renderSvg,
  sceneBounds,
  sceneCentre,
  toggleCut,
} from '../../utils/particles';
import {
  type Bounds,
  canvas,
  fitCamera,
  renderCanvas,
  wasDragging,
  zoomCamera,
} from './canvas';
import { $, localOrientation, root, showError, text } from './dom';
import { initLight } from './light';
import { initManual } from './manual';
import {
  derived,
  getState,
  notation,
  subscribe,
  takeRefit,
  undo,
  update,
} from './store';

const fillSelect = $<HTMLSelectElement>('#gen-fill');
const bgSelect = $<HTMLSelectElement>('#gen-bg');
const pngWidthSelect = $<HTMLSelectElement>('#gen-png-width');
const sizesToggle = $<HTMLInputElement>('#gen-sizes');
const checksList = $<HTMLElement>('#gen-checks');
const notationField = $<HTMLTextAreaElement>('#gen-notation');
const svgField = $<HTMLTextAreaElement>('#gen-svg');
const copySvgButton = $<HTMLElement>('#gen-copy-svg');
const copyLinkButton = $<HTMLElement>('#gen-copy-link');
const svgLink = $<HTMLAnchorElement>('#gen-svg-dl');
const presetLabels = new Map(
  [...root.querySelectorAll<HTMLElement>('[data-preset]')].map((el) => [
    el.dataset.preset ?? '',
    el.textContent?.trim() ?? '',
  ])
);
let blobUrl: string | undefined;

function renderChecks(pattern: Pattern) {
  const state = getState();
  const a = analyze(pattern);
  const items: { tone: 'ok' | 'warn' | 'info'; text: string }[] = [];
  if (state.mode === 'light' && state.scene.spheres.length === 0) {
    items.push({ tone: 'info', text: text('noSpheresLight') });
    checksList.innerHTML = renderItems(items);
    return;
  }
  items.push({
    tone: 'info',
    text: text('stats', { p: a.particles, c: a.connections, x: a.cuts }),
  });
  items.push({
    tone: 'info',
    text: a.spheres.length
      ? text('spheres', {
          list: a.spheres
            .map((s) =>
              text('sphereItem', {
                label: s.preset.label,
                orientation: localOrientation(s.orientation),
                i: s.i,
                j: s.j,
              })
            )
            .join(' / '),
        })
      : text('noSpheres'),
  });
  const warnings: string[] = [];
  if (a.duplicates.length) {
    warnings.push(
      text('duplicates', {
        list: a.duplicates.map((id) => presetLabels.get(id) ?? id).join(', '),
      })
    );
  }
  if (a.custom) {
    // Generated shading is expected to differ from the guideline patterns.
    if (state.mode === 'light') {
      items.push({ tone: 'info', text: text('lightInfo') });
    } else {
      warnings.push(text('custom', { n: a.custom }));
    }
  }
  if (a.overlaps) warnings.push(text('overlaps', { n: a.overlaps }));
  // Two lattices are fine between spheres that stand apart (CENTRAL has
  // two); touching spheres are forced onto one by the placement rule.
  if (a.lattices > 1) items.push({ tone: 'info', text: text('lattices') });
  if (warnings.length) {
    for (const w of warnings) items.push({ tone: 'warn', text: w });
  } else if (a.particles) {
    items.push({ tone: 'ok', text: text('ok') });
  }
  checksList.innerHTML = renderItems(items);
}

function renderItems(items: { tone: string; text: string }[]): string {
  return items
    .map(
      (item) =>
        `<li class="gen-check-item" data-tone="${item.tone}">${item.text}</li>`
    )
    .join('');
}

function renderOutput(pattern: Pattern) {
  const svg = renderSvg(pattern, {
    fill: fillSelect.value,
    background: bgSelect.value || undefined,
  });
  svgField.value = svg;
  copySvgButton.setAttribute('data-copy', svg);
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  svgLink.href = blobUrl;

  const current = notation();
  notationField.value = current;
  window.history.replaceState(null, '', `#${current}`);
  copyLinkButton.setAttribute('data-copy', location.href);
}

/** Everything worth framing: the export box, plus the light in step 1. */
function layoutBounds(): Bounds {
  const state = getState();
  const view = derived();
  const [ox, oy] = view.origin;
  const box: Bounds = {
    x0: ox,
    y0: oy,
    x1: ox + view.pattern.cols,
    y1: oy + view.pattern.rows,
  };
  if (state.mode === 'manual') return box;
  const b = sceneBounds(state.scene);
  const [lx, ly] = lightMarker(state.scene);
  return {
    x0: Math.min(b.minI, lx - 1),
    y0: Math.min(b.minJ, ly - 1),
    x1: Math.max(b.maxI, lx + 1),
    y1: Math.max(b.maxJ, ly + 1),
  };
}

function render() {
  const state = getState();
  const view = derived();
  const light = state.mode === 'light';
  if (takeRefit()) fitCamera(layoutBounds());
  const [lx, ly] = lightMarker(state.scene);
  renderCanvas({
    pattern: view.pattern,
    origin: view.origin,
    connections: listConnections(view.pattern),
    fixedCuts: view.fixedCuts,
    fill: fillSelect.value,
    background: bgSelect.value,
    showSizes: sizesToggle.checked,
    light: light
      ? {
          x: lx,
          y: ly,
          directional: state.scene.light.kind === 'directional',
          toward: sceneCentre(state.scene),
        }
      : undefined,
    spheres: light ? state.scene.spheres : undefined,
    selected: light ? state.selected : undefined,
  });
  canvas.classList.toggle('is-manual', !light);
  renderChecks(view.pattern);
  renderOutput(view.pattern);
  for (const button of root.querySelectorAll<HTMLElement>('[data-step]')) {
    button.setAttribute(
      'aria-pressed',
      String((button.dataset.step === 'detail') === !light)
    );
  }
  $<HTMLElement>('#gen-light-panel').hidden = !light;
  $<HTMLElement>('#gen-manual-panel').hidden = light;
  $<HTMLElement>('#gen-legend-light').hidden = !light;
  $<HTMLElement>('#gen-legend-manual').hidden = light;
}

/** Step 2 starts from the light result unless the light setup is unchanged. */
function goToDetail() {
  const state = getState();
  if (state.mode === 'manual') return;
  if (state.baked === state.scene) {
    update({ mode: 'manual', selected: undefined }, { refit: true });
    return;
  }
  const view = derived();
  update(
    {
      mode: 'manual',
      pattern: view.pattern,
      origin: view.origin,
      baked: state.scene,
      selected: undefined,
    },
    { refit: true }
  );
}

function goToLight() {
  if (getState().mode === 'light') return;
  update({ mode: 'light' }, { refit: true });
}

function applyNotation(value: string) {
  if (isSceneNotation(value)) {
    update(
      { mode: 'light', scene: parseScene(value), selected: undefined },
      { refit: true }
    );
  } else {
    update(
      {
        mode: 'manual',
        pattern: parse(value),
        origin: [0, 0],
        selected: undefined,
      },
      { refit: true }
    );
  }
}

initManual();
initLight();

canvas.addEventListener('click', (event) => {
  const joint = (event.target as Element).closest('circle[data-key]');
  if (!joint || joint.classList.contains('is-fixed') || wasDragging()) return;
  const key = joint.getAttribute('data-key') ?? '';
  const state = getState();
  if (state.mode === 'manual') {
    update({ pattern: toggleCut(state.pattern, key) });
    return;
  }
  // Rebuilt from the cuts in effect, so ones left behind by moved spheres
  // cannot resurface later.
  const view = derived();
  const [ox, oy] = view.origin;
  const toScene = (k: string) => mapCut(k, (i, j) => [i + ox, j + oy]);
  const cuts = new Set(
    [...view.pattern.cuts].filter((k) => !view.fixedCuts.has(k)).map(toScene)
  );
  const sceneKey = toScene(key);
  if (cuts.has(sceneKey)) cuts.delete(sceneKey);
  else cuts.add(sceneKey);
  update({ scene: { ...state.scene, cuts } });
});

root.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLElement>(
    '[data-step], [data-zoom]'
  );
  if (!button) return;
  if (button.dataset.step) {
    if (button.dataset.step === 'detail') goToDetail();
    else goToLight();
    return;
  }
  if (button.dataset.zoom === 'in') zoomCamera(1.25);
  else if (button.dataset.zoom === 'out') zoomCamera(0.8);
  else fitCamera(layoutBounds());
});

$('#gen-undo').addEventListener('click', () => {
  showError(undefined);
  undo();
});
document.addEventListener('keydown', (event) => {
  if ((event.target as HTMLElement).closest('input, textarea, select')) return;
  if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
    event.preventDefault();
    showError(undefined);
    undo();
  }
});

for (const control of [fillSelect, bgSelect, sizesToggle]) {
  control.addEventListener('change', render);
}

notationField.addEventListener('change', () => {
  try {
    applyNotation(notationField.value.trim());
    showError(undefined);
  } catch (error) {
    showError(text('badNotation', { msg: (error as Error).message }));
    notationField.value = notation();
  }
});

window.addEventListener('hashchange', () => {
  try {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash || hash === notation()) return;
    applyNotation(hash);
    showError(undefined);
  } catch (error) {
    showError(text('badNotation', { msg: (error as Error).message }));
  }
});

// PNG export rasterises the exact SVG that is offered for download.
$('#gen-png-dl').addEventListener('click', () => {
  const { pattern } = derived();
  const width = Number(pngWidthSelect.value);
  const svg = renderSvg(pattern, {
    fill: fillSelect.value,
    background: bgSelect.value || undefined,
    width,
  });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const image = new Image();
  image.addEventListener('load', () => {
    const bitmap = document.createElement('canvas');
    bitmap.width = width;
    bitmap.height = Math.round((width * pattern.rows) / pattern.cols);
    const context = bitmap.getContext('2d');
    if (!context) throw new Error('canvas 2d context unavailable');
    context.drawImage(image, 0, 0, bitmap.width, bitmap.height);
    URL.revokeObjectURL(url);
    bitmap.toBlob((blob) => {
      if (!blob) throw new Error('png encoding failed');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `kumo-sphere-${width}w.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, 'image/png');
  });
  image.src = url;
});

subscribe(render);
render();
