// Generator state: the light scene (step 1), the pattern being edited in
// detail (step 2) with its position in the shared world, and which step is
// showing. Every change goes through update() so the undo stack and the
// subscribers stay in step.
import {
  type DerivedScene,
  PRESETS,
  type Pattern,
  type Preset,
  type Scene,
  defaultScene,
  deriveScene,
  isSceneNotation,
  normalizeScene,
  parse,
  parseScene,
  serialize,
  serializeScene,
} from '../../utils/particles';

export type Mode = 'light' | 'manual';

export interface State {
  mode: Mode;
  pattern: Pattern;
  /** World position of the pattern's cell (0,0) in step 2. */
  origin: [number, number];
  scene: Scene;
  /** Scene the pattern was last derived from; detail edits survive while it is unchanged. */
  baked: Scene | undefined;
  /** Index of the selected sphere in light mode. */
  selected: number | undefined;
}

function fromHash(): Partial<State> {
  try {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return {};
    return isSceneNotation(hash)
      ? { mode: 'light', scene: parseScene(hash) }
      : { mode: 'manual', pattern: parse(hash) };
  } catch {
    // A stale or hand-edited link falls back to the defaults.
    return {};
  }
}

const central = PRESETS.find((p) => p.id === 'central') as Preset;

let state: State = {
  mode: 'light',
  pattern: parse(central.notation),
  origin: [0, 0],
  scene: defaultScene(11),
  baked: undefined,
  selected: undefined,
  ...fromHash(),
};

const undoStack: State[] = [];
const listeners = new Set<() => void>();
let derivedCache: { state: State; value: DerivedScene } | undefined;
let refitPending = true;

export const getState = (): State => state;

export function subscribe(listener: () => void): void {
  listeners.add(listener);
}

/** Pushes the current state onto the undo stack. */
export function record(): void {
  undoStack.push(state);
  if (undoStack.length > 80) undoStack.shift();
}

export interface UpdateOptions {
  record?: boolean;
  /** Ask the canvas to frame the whole layout again on the next render. */
  refit?: boolean;
}

export function update(patch: Partial<State>, options: UpdateOptions = {}) {
  if (options.record !== false) record();
  if (options.refit) refitPending = true;
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export function undo(): boolean {
  const previous = undoStack.pop();
  if (!previous) return false;
  state = previous;
  for (const listener of listeners) listener();
  return true;
}

/** Whether a refit was requested since the last call. */
export function takeRefit(): boolean {
  const pending = refitPending;
  refitPending = false;
  return pending;
}

/** The pattern on the canvas, with the light scene's metadata when active. */
export function derived(): DerivedScene {
  if (state.mode === 'manual') {
    return {
      pattern: state.pattern,
      fixedCuts: new Set(),
      origin: state.origin,
    };
  }
  if (derivedCache?.state !== state) {
    derivedCache = { state, value: deriveScene(state.scene) };
  }
  return derivedCache.value;
}

/** Hash form of the current step's state. */
export function notation(): string {
  return state.mode === 'light'
    ? serializeScene(normalizeScene(state.scene))
    : serialize(state.pattern);
}
