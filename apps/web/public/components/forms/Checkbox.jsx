import React from 'react';

export function Checkbox({ checked = false, onChange, label, disabled = false, name }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <input
          type="checkbox" name={name} checked={checked} disabled={disabled}
          onChange={e => onChange && onChange(e.target.checked, e)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'inherit' }}
        />
        <span aria-hidden="true" style={{
          width: 18, height: 18, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? 'var(--solid)' : 'var(--surface-card)',
          border: `1px solid ${checked ? 'var(--solid)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
          transition: 'background var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)'
        }}>
          {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth="3" style={{ stroke: 'var(--on-solid)' }} strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>}
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
