import React from 'react';
import { Badge, Button, Card } from '@kumoproductions/branding';

export const Basic = () => (
  <Card title="Render queue" meta="C24015" footer="Updated 5 min ago" style={{ width: 320 }}>
    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
      delivery_v3.mov — 00:00:30<br />4K ProRes 422 HQ
    </div>
  </Card>
);

export const Inverse = () => (
  <Card inverse title="On-screen" meta="16:9" style={{ width: 320 }}>
    <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
      Space-black plate for dark compositions.<br />Logos placed here use inverse rendering.
    </div>
  </Card>
);

export const Composed = () => (
  <Card title="Project — Showreel 2026" meta="MV" style={{ width: 360 }}
    footer={
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>3 cuts in review</span>
        <Button size="sm" variant="secondary">Open</Button>
      </div>
    }>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Badge tone="accent">In production</Badge>
        <Badge mono>v1.0</Badge>
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
        Motion / 3DCG direction for the 2026 showreel. Deadline 09-30.
      </div>
    </div>
  </Card>
);
