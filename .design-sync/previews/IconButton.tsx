import React from 'react';
import { IconButton } from '@kumoproductions/branding';

const Gear = ({ px = 16 }: { px?: number }) => (
  <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1" />
  </svg>
);

const X = ({ px = 16 }: { px?: number }) => (
  <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const Play = ({ px = 16 }: { px?: number }) => (
  <svg width={px} height={px} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const Variants = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    <IconButton label="Render settings"><Gear /></IconButton>
    <IconButton label="Close panel" variant="outline"><X /></IconButton>
    <IconButton label="Play showreel" variant="outline"><Play /></IconButton>
  </div>
);

export const SizesGhost = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    <IconButton label="Render settings" size="sm"><Gear px={14} /></IconButton>
    <IconButton label="Render settings" size="md"><Gear px={18} /></IconButton>
    <IconButton label="Render settings" size="lg"><Gear px={24} /></IconButton>
  </div>
);

export const SizesOutline = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    <IconButton label="Play showreel" variant="outline" size="sm"><Play px={14} /></IconButton>
    <IconButton label="Play showreel" variant="outline" size="md"><Play px={18} /></IconButton>
    <IconButton label="Play showreel" variant="outline" size="lg"><Play px={24} /></IconButton>
  </div>
);

export const Disabled = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    <IconButton label="Close panel" disabled><X /></IconButton>
    <IconButton label="Render settings" variant="outline" disabled><Gear /></IconButton>
  </div>
);
