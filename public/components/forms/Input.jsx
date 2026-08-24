import React from 'react';

const HS = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };

export function Input({ value, onChange, placeholder, type = 'text', size = 'md', invalid = false, disabled = false, name, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        // Site idiom (contact form): transparent field, gray hairline, square.
        height: HS[size] || HS.md, boxSizing: 'border-box', width: '100%', padding: '0 10px',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-primary)',
        background: 'transparent',
        border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--accent-soft)' : 'var(--border-strong)'}`,
        borderRadius: 0, outline: 'none',
        boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
        ...style
      }}
    />
  );
}
