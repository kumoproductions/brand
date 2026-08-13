import React from 'react';

const TONES = {
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-primary)', border: '1px solid var(--border-default)' },
  outline: { bg: 'transparent', fg: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
  inverse: { bg: 'var(--solid)', fg: 'var(--on-solid)', border: '1px solid transparent' },
  accent:  { bg: 'var(--accent)', fg: 'var(--text-on-accent)', border: '1px solid transparent' },
  sky:     { bg: 'var(--accent-soft-bg)', fg: 'var(--accent)', border: '1px solid transparent' },
  danger:  { bg: 'var(--danger-bg)', fg: 'var(--danger)', border: '1px solid transparent' },
  success: { bg: 'var(--success-bg)', fg: 'var(--success)', border: '1px solid transparent' },
  warning: { bg: 'var(--warning-bg)', fg: 'var(--warning)', border: '1px solid transparent' }
};

export function Badge({ tone = 'neutral', mono = false, children }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 22, padding: '0 8px', boxSizing: 'border-box',
      background: t.bg, color: t.fg, border: t.border, borderRadius: 'var(--radius-sm)',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: 'var(--text-xs)', fontWeight: mono ? 400 : 'var(--weight-medium)',
      letterSpacing: mono ? 'var(--tracking-label)' : 0,
      textTransform: mono ? 'uppercase' : 'none',
      lineHeight: 1, whiteSpace: 'nowrap'
    }}>{children}</span>
  );
}
