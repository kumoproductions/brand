import React from 'react';

/* Site navigation idiom: plain text items, no rail; a 1px underline grows
   from the left on hover and stays full-width on the active item. */
export function Tabs({ items = [], value, onChange, size = 'md' }) {
  const list = items.map(it => (typeof it === 'string' ? { value: it, label: it } : it));
  const [hover, setHover] = React.useState(null);
  return (
    <div role="tablist" style={{ display: 'flex', gap: 'var(--space-6)', fontFamily: 'var(--font-body)' }}>
      {list.map(it => {
        const active = it.value === value;
        const lit = active || (hover === it.value && !it.disabled);
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
              position: 'relative',
              padding: size === 'sm' ? '4px 0 6px 0' : '6px 0 8px 0',
              fontFamily: 'inherit', fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
              fontWeight: 'var(--weight-regular)',
              color: lit ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: it.disabled ? 'not-allowed' : 'pointer',
              opacity: it.disabled ? 0.4 : 1,
              transition: 'color var(--dur) var(--ease)'
            }}
          >
            {it.label}
            <span aria-hidden="true" style={{
              position: 'absolute', left: 0, bottom: 0, height: 1,
              width: lit ? '100%' : 0,
              background: 'currentColor',
              transition: 'width var(--dur) var(--ease)'
            }}></span>
          </button>
        );
      })}
    </div>
  );
}
