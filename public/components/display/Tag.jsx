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
        // Site idiom: transparent pill with a gray hairline (product tags);
        // selected fills like the contact form's checked segment.
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 26, padding: '0 12px', boxSizing: 'border-box',
        background: selected ? 'var(--solid)' : 'transparent',
        color: selected ? 'var(--on-solid)' : 'var(--text-primary)',
        border: `1px solid ${selected ? 'var(--solid)' : hover && interactive ? 'var(--text-primary)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1,
        cursor: interactive ? 'pointer' : 'default', userSelect: 'none',
        opacity: disabled ? 0.4 : 1,
        transition: 'background var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease)'
      }}
    >
      {children}
      {onRemove && !disabled && (
        <svg onClick={e => { e.stopPropagation(); onRemove(); }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: 'pointer', opacity: 0.6 }}><path d="M18 6 6 18M6 6l12 12" /></svg>
      )}
    </span>
  );
}
