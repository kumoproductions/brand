// Canonical patterns extracted from the shipped assets: the four spheres from
// content/sphere/svg and the base composition from symbol-central.svg. The
// cuts are the rule-6 exceptions present in those files.

export interface Preset {
  id: string;
  label: string;
  kind: 'sphere' | 'composition';
  notation: string;
}

export const PRESETS: readonly Preset[] = [
  {
    id: 'sphere-11',
    label: 'Sphere 11',
    kind: 'sphere',
    notation:
      '...1.1.1...-..1.2.2.1..-.1.2.2.2.2.-1.2.3.3.3.2-.2.3.4.4.3.-1.3.4.5.4.3-.2.4.5.5.5.-1.3.5.6.6.3-.1.4.6.7.4.-..2.5.6.4..-...3.3.3...~4:9r',
  },
  {
    id: 'sphere-7',
    label: 'Sphere 7',
    kind: 'sphere',
    notation:
      '..1.1..-.1.2.2.-1.3.4.3-.2.5.5.-1.4.6.3-.2.5.5.-..2.3..~5:5l,6:4l',
  },
  {
    id: 'sphere-5',
    label: 'Sphere 5',
    kind: 'sphere',
    notation: '.1.1.-1.2.1-.2.3.-2.5.3-.4.4.',
  },
  {
    id: 'sphere-3',
    label: 'Sphere 3',
    kind: 'sphere',
    notation: '.1.-2.3-.4.',
  },
  {
    id: 'central',
    label: 'CENTRAL',
    kind: 'composition',
    notation:
      '...1.1.1..........-..1.2.2.1.........-.1.2.2.2.2........-1.2.3.3.3.2.......-.2.3.4.4.3........-1.3.4.5.4.3.......-.2.4.5.5.5........-1.3.5.6.6.3.......-.1.4.6.7.4...3.2..-..2.5.6.4...5.5.2.-...3.3.3...3.6.4.1-............5.5.2.-...........3.4.3.1-.....4......2.2.1.-....2.3.4.4..1.1..-.....1.3.5.2......-........3.2.......-.......1.2.1......-........1.1.......~12:9l,13:8l,4:9r',
  },
];

export const SPHERES = PRESETS.filter((p) => p.kind === 'sphere');

/** Diameters that have a guideline pattern. */
export const CANONICAL_DIAMETERS = [3, 5, 7, 11];

export function spherePreset(diameter: number): Preset | undefined {
  return SPHERES.find((p) => p.id === `sphere-${diameter}`);
}
