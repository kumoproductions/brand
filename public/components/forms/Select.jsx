import React from 'react';

const HS = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };

export function Select({ value, onChange, options = [], placeholder, size = 'md', invalid = false, disabled = false, name, style }) {
  const [focus, setFocus] = React.useState(false);
  const opts = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <select
        name={name}
        value={value === undefined || value === null ? '' : value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          // Site idiom (contact form): transparent field, gray hairline, square.
          height: HS[size] || HS.md, boxSizing: 'border-box', width: '100%', padding: '0 32px 0 10px',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
          color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: 'transparent',
          border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--accent-soft)' : 'var(--border-strong)'}`,
          borderRadius: 0, outline: 'none', appearance: 'none', WebkitAppearance: 'none',
          boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
          opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
          ...style
        }}
      >
        {placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
