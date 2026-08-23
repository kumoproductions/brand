import React from 'react';

export function Tabs({ items = [], value, onChange, size = 'md' }) {
  const list = items.map(it => (typeof it === 'string' ? { value: it, label: it } : it));
  const [hover, setHover] = React.useState(null);
  return (
    <div role="tablist" style={{ display: 'flex', gap: 'var(--space-6)', borderBottom: '1px solid var(--border-default)', fontFamily: 'var(--font-body)' }}>
      {list.map(it => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            disabled={it.disabled}
            onClick={() => onChange && onChange(it.value)}
            onMouseEnter={() => setHover(it.value)}
            onMouseLeave={() => setHover(null)}
            style={{
              appearance: 'none', background: 'none', border: 'none', margin: 0,
              padding: size === 'sm' ? '6px 0 8px 0' : '8px 0 10px 0',
              fontFamily: 'inherit', fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              color: active ? 'var(--text-primary)' : hover === it.value ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: active ? 'inset 0 -2px 0 0 var(--solid)' : 'none',
              cursor: it.disabled ? 'not-allowed' : 'pointer',
              opacity: it.disabled ? 0.4 : 1,
              transition: 'color var(--dur) var(--ease)'
            }}
          >{it.label}</button>
        );
      })}
    </div>
  );
}
