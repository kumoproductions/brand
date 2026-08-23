import React from 'react';

export function Tag({ selected = false, onClick, onRemove, disabled = false, children }) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick && !disabled;
  return (
    <span
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }) : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 28, padding: '0 10px', boxSizing: 'border-box',
        background: selected ? 'var(--solid)' : hover && interactive ? 'var(--surface-sunken)' : 'var(--surface-card)',
        color: selected ? 'var(--on-solid)' : 'var(--text-primary)',
        border: `1px solid ${selected ? 'var(--solid)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1,
        cursor: interactive ? 'pointer' : 'default', userSelect: 'none',
        opacity: disabled ? 0.4 : 1,
        transition: 'background var(--dur) var(--ease), color var(--dur) var(--ease)'
      }}
    >
      {children}
      {onRemove && !disabled && (
        <svg onClick={e => { e.stopPropagation(); onRemove(); }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: 'pointer', opacity: 0.6 }}><path d="M18 6 6 18M6 6l12 12" /></svg>
      )}
    </span>
  );
}
