import React from 'react';
import { Checkbox } from '@kumoproductions/branding';

const noop = () => {};

export const States = () => (
  <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
    <Checkbox checked onChange={noop} label="Subtitles" />
    <Checkbox checked={false} onChange={noop} label="Loop" />
    <Checkbox disabled label="Locked" />
    <Checkbox disabled checked onChange={noop} label="Watermark (fixed)" />
  </div>
);

export const DeliveryOptions = () => (
  <div style={{ display: 'grid', gap: 12, width: 280, fontFamily: 'var(--font-body)' }}>
    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Include in delivery</span>
    <Checkbox checked onChange={noop} label="Burn-in timecode" />
    <Checkbox checked onChange={noop} label="Subtitles (EN + JA)" />
    <Checkbox checked={false} onChange={noop} label="Audio stems" />
    <Checkbox checked={false} onChange={noop} label="Clean plates" />
  </div>
);

export const InlineRow = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Checkbox checked onChange={noop} label="Subtitles" />
    <Checkbox checked={false} onChange={noop} label="Loop" />
    <Checkbox disabled label="Locked" />
  </div>
);
