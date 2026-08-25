import React from 'react';
import { Select } from '@kumoproductions/branding';

const noop = () => {};
const RATIOS = ['16:9', 'CINEMASCOPE', '1:1', '9:16'];
const CODECS = [
  { value: 'prores-4444', label: 'ProRes 4444' },
  { value: 'prores-422hq', label: 'ProRes 422 HQ' },
  { value: 'h264', label: 'H.264' },
];

export const States = () => (
  <div style={{ display: 'grid', gap: 12, width: 300 }}>
    <Select value="16:9" onChange={noop} options={RATIOS} />
    <Select value="" onChange={noop} placeholder="Aspect ratio" options={RATIOS} />
    <Select invalid value="" onChange={noop} placeholder="Codec required" options={CODECS} />
    <Select disabled value="prores-422hq" onChange={noop} options={CODECS} />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'grid', gap: 12, width: 300 }}>
    <Select size="sm" value="CINEMASCOPE" onChange={noop} options={RATIOS} />
    <Select size="md" value="CINEMASCOPE" onChange={noop} options={RATIOS} />
    <Select size="lg" value="CINEMASCOPE" onChange={noop} options={RATIOS} />
  </div>
);

export const Labeled = () => (
  <div style={{ display: 'grid', gap: 14, width: 300, fontFamily: 'var(--font-body)' }}>
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Master codec</span>
      <Select value="prores-4444" onChange={noop} options={CODECS} name="codec" />
    </label>
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Aspect ratio</span>
      <Select value="" onChange={noop} placeholder="Select ratio" options={RATIOS} name="ratio" />
    </label>
  </div>
);
