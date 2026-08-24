import React from 'react';

export function Dialog({ open = false, title, meta, onClose, footer, width = 480, children }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-6)' }}
    >
      <div role="dialog" aria-modal="true" style={{
        width, maxWidth: '100%', maxHeight: '85vh', overflow: 'auto', boxSizing: 'border-box',
        background: 'var(--surface-card)', color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-overlay)',
        fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)' }}>{title}</span>
            {meta && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{meta}</span>}
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Close" style={{ appearance: 'none', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div style={{ padding: 'var(--space-6)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)' }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-default)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
