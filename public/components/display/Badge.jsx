import React from 'react';

/* Site idiom (News/product badges): outline pill — transparent ground,
   1px border and text in the tone color, uppercase with wide tracking. */
const TONES = {
  neutral: { fg: 'var(--text-primary)', border: 'var(--border-strong)' },
  outline: { fg: 'var(--text-secondary)', border: 'var(--border-strong)' },
  inverse: { fg: 'var(--on-solid)', border: 'var(--solid)', bg: 'var(--solid)' },
  accent:  { fg: 'var(--accent)', border: 'var(--accent)' },
  sky:     { fg: 'var(--accent)', border: 'var(--accent-soft)' },
  danger:  { fg: 'var(--danger)', border: 'var(--danger)' },
  success: { fg: 'var(--success)', border: 'var(--success)' },
  warning: { fg: 'var(--warning)', border: 'var(--warning)' }
};

export function Badge({ tone = 'neutral', mono = false, children }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 22, padding: '0 10px', boxSizing: 'border-box',
      background: t.bg || 'transparent', color: t.fg,
      border: `1px solid ${t.border}`, borderRadius: 'var(--radius-full)',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: 'var(--text-xs)', fontWeight: mono ? 400 : 'var(--weight-semibold)',
      letterSpacing: mono ? 'var(--tracking-label)' : '0.06em',
      textTransform: 'uppercase',
      lineHeight: 1, whiteSpace: 'nowrap'
    }}>{children}</span>
  );
}
