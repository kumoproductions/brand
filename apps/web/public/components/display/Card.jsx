import React from 'react';

export function Card({ title, meta, footer, padding = 'var(--space-6)', inverse = false, children, style }) {
  return (
    <div style={{
      background: inverse ? 'var(--surface-inverse)' : 'var(--surface-card)',
      color: inverse ? 'var(--text-inverse)' : 'var(--text-primary)',
      border: inverse ? '1px solid transparent' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      ...style
    }}>
      {(title || meta) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-4)', padding: `var(--space-4) ${padding} 0 ${padding}` }}>
          {title && <div style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)' }}>{title}</div>}
          {meta && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: inverse ? '#9BA0A3' : 'var(--text-secondary)' }}>{meta}</div>}
        </div>
      )}
      <div style={{ padding, flex: 1 }}>{children}</div>
      {footer && (
        <div style={{ padding: `var(--space-3) ${padding}`, borderTop: `1px solid ${inverse ? 'rgba(255,255,255,0.12)' : 'var(--border-default)'}`, fontSize: 'var(--text-sm)', color: inverse ? '#9BA0A3' : 'var(--text-secondary)' }}>{footer}</div>
      )}
    </div>
  );
}
