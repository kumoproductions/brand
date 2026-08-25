import React from 'react';
import { Badge } from '@kumoproductions/branding';

export const Tones = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge>Draft</Badge>
    <Badge tone="outline">Archive</Badge>
    <Badge tone="accent">In production</Badge>
    <Badge tone="sky">Review</Badge>
    <Badge tone="inverse">Delivered</Badge>
  </div>
);

export const StatusTones = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge tone="success">Delivered OK</Badge>
    <Badge tone="warning">Needs review</Badge>
    <Badge tone="danger">Overdue</Badge>
  </div>
);

export const Mono = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge mono>v1.0</Badge>
    <Badge mono tone="outline">C24015</Badge>
    <Badge mono tone="accent">16:9</Badge>
    <Badge mono tone="inverse">4K</Badge>
  </div>
);

export const InContext = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>delivery_v3.mov</span>
    <Badge tone="accent">In production</Badge>
    <Badge mono tone="outline">4K ProRes</Badge>
  </div>
);
