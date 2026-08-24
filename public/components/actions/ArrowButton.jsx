import React from 'react';

/* The kumo.productions signature CTA: a plain label + MDI arrow with no box.
   The arrow slides on hover (300ms ease-out-expo) and the text brightens
   (text-cloud -> white idiom, mapped to secondary -> primary tokens). */

const FS = { sm: 'var(--text-base)', md: 'var(--text-md)', lg: 'var(--text-lg)' };
const ICON = { sm: 20, md: 24, lg: 32 };
const GAP = { sm: 4, md: 6, lg: 8 };

const PATHS = {
  right: 'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z',
  left: 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z',
  external: 'M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z'
};

export function ArrowButton({ label, size = 'md', reverse = false, external = false, disabled = false, type = 'button', onClick, ariaLabel }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const icon = external ? 'external' : reverse ? 'left' : 'right';
  const slide = external
    ? 'translate(4px, -4px)'
    : reverse
      ? 'translateX(-6px)'
      : 'translateX(6px)';
  const px = ICON[size] || ICON.md;
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel || (label ? undefined : 'Go')}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        appearance: 'none', background: 'none', border: 'none', margin: 0, padding: 2,
        display: 'inline-flex', alignItems: 'center', gap: GAP[size] || GAP.md,
        flexDirection: reverse ? 'row-reverse' : 'row',
        fontFamily: 'var(--font-body)', fontSize: FS[size] || FS.md, fontWeight: 'var(--weight-medium)', lineHeight: 1,
        color: hover && !disabled ? 'var(--text-primary)' : 'var(--text-secondary)',
        boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'color var(--dur-slow) var(--ease), box-shadow var(--dur) var(--ease)'
      }}
    >
      {label && <span>{label}</span>}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{
          width: px, height: px, flexShrink: 0,
          transform: hover && !disabled ? slide : 'none',
          transition: 'transform var(--dur-slow) var(--ease)'
        }}
      >
        <path fill="currentColor" d={PATHS[icon]} />
      </svg>
    </button>
  );
}
