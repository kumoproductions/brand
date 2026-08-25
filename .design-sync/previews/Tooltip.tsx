import React from 'react';
import { Button, Tooltip } from '@kumoproductions/branding';

/* The bubble renders only while the trigger is hovered/focused. For a static
   capture we focus the inner button; focusin bubbles to the Tooltip wrapper. */
export const OpenState = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.querySelector('button')?.focus();
  }, []);
  return (
    <div ref={ref} style={{ padding: '40px 20px 8px' }}>
      <Tooltip content="Sphere grid — unit a">
        <Button variant="ghost">Focused trigger</Button>
      </Tooltip>
    </div>
  );
};

export const Placements = () => (
  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap', padding: 'var(--space-2)' }}>
    <Tooltip content="Renders delivery_v3.mov" side="top">
      <Button variant="ghost">Top</Button>
    </Tooltip>
    <Tooltip content="Queue position 2 of 5" side="bottom">
      <Button variant="ghost">Bottom</Button>
    </Tooltip>
    <Tooltip content="Project C24015" side="left">
      <Button variant="ghost">Left</Button>
    </Tooltip>
    <Tooltip content="00:00:30 total runtime" side="right">
      <Button variant="ghost">Right</Button>
    </Tooltip>
  </div>
);
