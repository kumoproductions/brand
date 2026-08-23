import React from 'react';

export function Switch({ checked = false, onChange, label, disabled = false, name }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <input
          type="checkbox" role="switch" name={name} checked={checked} disabled={disabled}
          onChange={e => onChange && onChange(e.target.checked, e)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'inherit' }}
        />
        <span aria-hidden="true" style={{
          width: 36, height: 20, boxSizing: 'border-box', borderRadius: 'var(--radius-full)', padding: 2,
          background: checked ? 'var(--solid)' : 'var(--border-strong)',
          boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
          display: 'inline-flex',
          transition: 'background var(--dur) var(--ease), box-shadow var(--dur) var(--ease)'
        }}>
          <span style={{ width: 16, height: 16, borderRadius: 'var(--radius-full)', background: 'var(--on-solid)', transform: checked ? 'translateX(16px)' : 'translateX(0)', transition: 'transform var(--dur) var(--ease)' }}></span>
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
