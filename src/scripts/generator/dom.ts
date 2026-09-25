// DOM helpers and localized strings shared by the generator modules.
import { orientationLabel } from '../../utils/particles';

export const root = document.getElementById('generator') as HTMLElement;

export function $<T extends Element>(selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`generator: missing ${selector}`);
  return element;
}

const strings = JSON.parse(
  $<HTMLElement>('#gen-strings').textContent ?? '{}'
) as Record<string, string>;

export const text = (
  key: string,
  vars: Record<string, string | number> = {}
): string =>
  (strings[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) =>
    String(vars[name] ?? '')
  );

const errorLine = $<HTMLElement>('#gen-error');

export function showError(message?: string): void {
  errorLine.hidden = !message;
  errorLine.textContent = message ?? '';
}

/** Relative-luminance test for picking contrasting chrome. */
export function isLightColor(hex: string): boolean {
  const v = Number.parseInt(hex.slice(1), 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}

export function localOrientation(orientation: number): string {
  return orientationLabel(orientation)
    .replace('as is', text('asIs'))
    .replace('mirrored', text('mirrored'));
}
