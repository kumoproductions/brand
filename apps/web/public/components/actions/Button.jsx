import React from 'react';

const HS = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };
const PX = { sm: '0 12px', md: '0 18px', lg: '0 22px' };
const FS = { sm: 'var(--text-sm)', md: 'var(--text-base)', lg: 'var(--text-md)' };
const VARIANTS = {
  primary:   { bg: 'var(--solid)', bgHover: 'var(--solid-hover)', fg: 'var(--on-solid)', border: '1px solid transparent' },
  accent:    { bg: 'var(--accent)', bgHover: 'var(--accent-hover)', fg: 'var(--text-on-accent)', border: '1px solid transparent' },
  secondary: { bg: 'var(--surface-card)', bgHover: 'var(--surface-sunken)', fg: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
  ghost:     { bg: 'transparent', bgHover: 'var(--surface-sunken)', fg: 'var(--text-primary)', border: '1px solid transparent' }
};

export function Button({ variant = 'primary', size = 'md', disabled = false, fullWidth = false, type = 'button', onClick, children }) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
        height: HS[size] || HS.md, padding: PX[size] || PX.md, boxSizing: 'border-box',
        fontFamily: 'var(--font-body)', fontSize: FS[size] || FS.md, fontWeight: 'var(--weight-medium)', lineHeight: 1,
        color: v.fg, background: hover && !disabled ? v.bgHover : v.bg, border: v.border,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
        opacity: disabled ? 0.4 : active ? 0.85 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur) var(--ease), box-shadow var(--dur) var(--ease), opacity var(--dur) var(--ease)'
      }}
    >{children}</button>
  );
}
