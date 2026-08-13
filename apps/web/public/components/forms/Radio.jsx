import React from 'react';

export function Radio({ checked = false, onChange, label, name, value, disabled = false }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <input
          type="radio" name={name} value={value} checked={checked} disabled={disabled}
          onChange={e => onChange && onChange(value, e)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'inherit' }}
        />
        <span aria-hidden="true" style={{
          width: 18, height: 18, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-card)',
          border: `1px solid ${checked ? 'var(--solid)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-full)',
          boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
          transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--solid)', transform: checked ? 'scale(1)' : 'scale(0)', transition: 'transform var(--dur) var(--ease)' }}></span>
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
