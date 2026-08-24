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
        // Site idiom: icon controls shift color only (text-cloud -> white).
        color: hover && !disabled ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: 'transparent',
        border: `1px solid ${outlined ? (hover && !disabled ? 'var(--text-primary)' : 'var(--border-strong)') : 'transparent'}`,
        boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'color var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)'
      }}
    >{children}</button>
  );
}
