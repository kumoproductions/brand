import React from 'react';
import { Radio } from '@kumoproductions/branding';

const noop = () => {};

export const AspectRatio = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Radio name="ratio" value="16:9" checked onChange={noop} label="16:9" />
    <Radio name="ratio" value="scope" checked={false} onChange={noop} label="Scope" />
    <Radio name="ratio" value="1:1" checked={false} onChange={noop} label="1:1" />
    <Radio name="ratio" value="9:16" checked={false} onChange={noop} label="9:16" />
  </div>
);

export const RenderQuality = () => (
  <div style={{ display: 'grid', gap: 12, width: 280, fontFamily: 'var(--font-body)' }}>
    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Render quality</span>
    <Radio name="quality" value="draft" checked={false} onChange={noop} label="Draft (half res)" />
    <Radio name="quality" value="final" checked onChange={noop} label="Final (full res)" />
    <Radio name="quality" value="archive" checked={false} onChange={noop} disabled label="Archive master (LTO only)" />
  </div>
);
