import React from 'react';

export function Tooltip({ content, side = 'top', children }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top:    { bottom: '100%', left: '50%', transform: 'translate(-50%, -6px)' },
    bottom: { top: '100%', left: '50%', transform: 'translate(-50%, 6px)' },
    left:   { right: '100%', top: '50%', transform: 'translate(-6px, -50%)' },
    right:  { left: '100%', top: '50%', transform: 'translate(6px, -50%)' }
  }[side];
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span role="tooltip" style={{
          position: 'absolute', ...pos, zIndex: 1100,
          background: 'var(--solid)', color: 'var(--on-solid)',
          padding: '5px 8px',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', lineHeight: 1.4,
          whiteSpace: 'nowrap', pointerEvents: 'none'
        }}>{content}</span>
      )}
    </span>
  );
}
