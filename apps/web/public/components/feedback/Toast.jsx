import React from 'react';

export function Toast({ open = true, tone = 'inverse', title, description, onClose, action }) {
  if (!open) return null;
  const dark = tone === 'inverse';
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
      minWidth: 260, maxWidth: 420, boxSizing: 'border-box',
      padding: 'var(--space-3) var(--space-4)',
      background: dark ? 'var(--surface-inverse)' : 'var(--surface-card)',
      color: dark ? 'var(--text-inverse)' : 'var(--text-primary)',
      border: dark ? '1px solid transparent' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-overlay)',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)' }}>{title}</div>}
        {description && <div style={{ fontSize: 'var(--text-sm)', color: dark ? '#9BA0A3' : 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{description}</div>}
      </div>
      {action}
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" style={{ appearance: 'none', background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'inherit', opacity: 0.6, display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
