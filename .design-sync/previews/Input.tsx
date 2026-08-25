import React from 'react';
import { Input } from '@kumoproductions/branding';

const noop = () => {};

export const States = () => (
  <div style={{ display: 'grid', gap: 12, width: 300 }}>
    <Input value="" onChange={noop} placeholder="name@kumo.productions" />
    <Input value="director@kumo.productions" onChange={noop} />
    <Input invalid value="motion@" onChange={noop} />
    <Input disabled value="Read only" onChange={noop} />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'grid', gap: 12, width: 300 }}>
    <Input size="sm" value="AURORA_MAIN_TITLE_v03" onChange={noop} />
    <Input size="md" value="AURORA_MAIN_TITLE_v03" onChange={noop} />
    <Input size="lg" value="AURORA_MAIN_TITLE_v03" onChange={noop} />
  </div>
);

export const Labeled = () => (
  <div style={{ display: 'grid', gap: 14, width: 300, fontFamily: 'var(--font-body)' }}>
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Delivery email</span>
      <Input value="post@kumo.productions" onChange={noop} type="email" name="delivery-email" />
    </label>
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Timecode in</span>
      <Input value="00:00:58:12" onChange={noop} name="tc-in" />
    </label>
  </div>
);
