// Step 2, detail: paint particles anywhere on the world grid, stamp presets,
// and transform the whole pattern. The export box follows the particles.
import {
  PRESETS,
  type Pattern,
  type World,
  cellKey,
  emptyPattern,
  fromWorld,
  mirror,
  paintWorld,
  parse,
  placeable,
  rotate,
  stampWorld,
  toWorld,
} from '../../utils/particles';
import { canvas, hideHover, showHover, wasDragging, worldCell } from './canvas';
import { $, localOrientation, root, showError, text } from './dom';
import { getState, subscribe, update } from './store';

type Tool =
  | { kind: 'paint'; n: number }
  | { kind: 'erase' }
  | { kind: 'stamp'; id: string };

let tool: Tool = { kind: 'paint', n: 4 };
let stampOrientation = 0;

const presets = new Map(PRESETS.map((p) => [p.id, parse(p.notation)]));
const active = () => getState().mode === 'manual';

function commitWorld(world: World) {
  const { pattern, origin } = fromWorld(world);
  showError(undefined);
  update({ pattern, origin });
}

function commit(pattern: Pattern) {
  showError(undefined);
  update({ pattern });
}

function renderTools() {
  for (const button of root.querySelectorAll<HTMLElement>('[data-tool]')) {
    const kind = button.dataset.tool;
    const pressed =
      (kind === 'paint' &&
        tool.kind === 'paint' &&
        Number(button.dataset.size) === tool.n) ||
      (kind === 'erase' && tool.kind === 'erase') ||
      (kind === 'stamp' &&
        tool.kind === 'stamp' &&
        button.dataset.preset === tool.id);
    button.setAttribute('aria-pressed', String(pressed));
  }
  $('#gen-stamp-mirror').setAttribute(
    'aria-pressed',
    String(Boolean(stampOrientation & 4))
  );
  $('#gen-orientation').textContent = localOrientation(stampOrientation);
}

export function initManual(): void {
  canvas.addEventListener('pointermove', (event) => {
    if (!active()) return;
    const [wx, wy] = worldCell(event);
    const { pattern, origin } = getState();
    const i = wx - origin[0];
    const j = wy - origin[1];
    const blocked =
      tool.kind === 'paint' &&
      !pattern.cells.has(cellKey(i, j)) &&
      !placeable(pattern, i, j);
    showHover(wx, wy, blocked);
  });
  canvas.addEventListener('pointerleave', hideHover);

  canvas.addEventListener('click', (event) => {
    if (!active() || event.altKey || wasDragging()) return;
    if ((event.target as Element).closest('circle[data-key]')) return;
    const [wx, wy] = worldCell(event);
    const { pattern, origin } = getState();
    const world = toWorld(pattern, origin);
    if (tool.kind === 'stamp') {
      commitWorld(
        stampWorld(
          world,
          presets.get(tool.id) as Pattern,
          wx,
          wy,
          stampOrientation
        )
      );
      return;
    }
    const n = tool.kind === 'erase' ? 0 : tool.n;
    if ((world.cells.get(cellKey(wx, wy)) ?? 0) === n) return;
    if (n && !placeable(pattern, wx - origin[0], wy - origin[1])) {
      showError(text('badPlace'));
      return;
    }
    commitWorld(paintWorld(world, wx, wy, n));
  });

  canvas.addEventListener('contextmenu', (event) => {
    if (!active()) return;
    event.preventDefault();
    const [wx, wy] = worldCell(event);
    const { pattern, origin } = getState();
    const world = toWorld(pattern, origin);
    if (!world.cells.has(cellKey(wx, wy))) return;
    commitWorld(paintWorld(world, wx, wy, 0));
  });

  root.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-tool]'
    );
    if (!button) return;
    if (button.dataset.tool === 'paint') {
      tool = { kind: 'paint', n: Number(button.dataset.size) };
    } else if (button.dataset.tool === 'erase') {
      tool = { kind: 'erase' };
    } else {
      tool = { kind: 'stamp', id: button.dataset.preset ?? '' };
    }
    renderTools();
  });

  $('#gen-stamp-rotate').addEventListener('click', () => {
    stampOrientation = (stampOrientation & 4) | ((stampOrientation + 1) & 3);
    renderTools();
  });
  $('#gen-stamp-mirror').addEventListener('click', () => {
    stampOrientation ^= 4;
    renderTools();
  });
  $('#gen-rotate').addEventListener('click', () =>
    commit(rotate(getState().pattern))
  );
  $('#gen-mirror').addEventListener('click', () =>
    commit(mirror(getState().pattern))
  );
  $('#gen-clear').addEventListener('click', () => commit(emptyPattern(1, 1)));

  document.addEventListener('keydown', (event) => {
    if (
      !active() ||
      (event.target as HTMLElement).closest('input, textarea, select')
    ) {
      return;
    }
    if (/^[1-7]$/.test(event.key)) {
      tool = { kind: 'paint', n: Number(event.key) };
      renderTools();
    } else if (event.key === '0' || event.key === 'Backspace') {
      tool = { kind: 'erase' };
      renderTools();
    }
  });

  subscribe(renderTools);
  renderTools();
}
