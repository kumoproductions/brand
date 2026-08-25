import React from 'react';
import { Button } from '@kumoproductions/branding';

export const Variants = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="accent">Accent</Button>
    <Button disabled>Disabled</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

const Gear = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1" />
  </svg>
);

export const WithIcon = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    <Button variant="secondary"><Gear /> Render settings</Button>
    <Button variant="primary"><Gear /> Start render</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ width: 320 }}>
    <Button fullWidth>Submit request</Button>
  </div>
);
