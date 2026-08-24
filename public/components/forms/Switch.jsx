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
          // Off state is an outline track like the site's transparent fields.
          width: 36, height: 20, boxSizing: 'border-box', borderRadius: 'var(--radius-full)', padding: 2,
          background: checked ? 'var(--solid)' : 'transparent',
          border: `1px solid ${checked ? 'var(--solid)' : 'var(--border-strong)'}`,
          boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
          display: 'inline-flex', alignItems: 'center',
          transition: 'background var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)'
        }}>
          <span style={{ width: 14, height: 14, borderRadius: 'var(--radius-full)', background: checked ? 'var(--on-solid)' : 'var(--border-strong)', transform: checked ? 'translateX(16px)' : 'translateX(0)', transition: 'transform var(--dur) var(--ease), background var(--dur) var(--ease)' }}></span>
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
