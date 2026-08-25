import React from 'react';
import { Switch } from '@kumoproductions/branding';

const noop = () => {};

export const States = () => (
  <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
    <Switch checked onChange={noop} label="Auto render" />
    <Switch checked={false} onChange={noop} label="Watermark" />
    <Switch disabled label="Locked" />
    <Switch disabled checked onChange={noop} label="Archive sync (managed)" />
  </div>
);

export const RenderSettings = () => (
  <div style={{ display: 'grid', gap: 12, width: 280, fontFamily: 'var(--font-body)' }}>
    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Render settings</span>
    <Switch checked onChange={noop} label="Auto render" />
    <Switch checked onChange={noop} label="Subtitles" />
    <Switch checked={false} onChange={noop} label="Draft quality" />
    <Switch checked={false} onChange={noop} label="Loop preview" />
  </div>
);
