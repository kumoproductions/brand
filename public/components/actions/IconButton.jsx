import React from 'react';

const SZ = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };

export function IconButton({ label, variant = 'ghost', size = 'md', disabled = false, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const outlined = variant === 'outline';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: SZ[size] || SZ.md, height: SZ[size] || SZ.md, boxSizing: 'border-box', padding: 0,
        color: 'var(--text-primary)',
        background: hover && !disabled ? 'var(--surface-sunken)' : 'transparent',
        border: outlined ? '1px solid var(--border-strong)' : '1px solid transparent',
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur) var(--ease), box-shadow var(--dur) var(--ease)'
      }}
    >{children}</button>
  );
}
