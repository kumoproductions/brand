import React from 'react';
import { Tag } from '@kumoproductions/branding';

export const FilterRow = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Tag selected onClick={() => {}}>Motion</Tag>
    <Tag onClick={() => {}}>3DCG</Tag>
    <Tag onClick={() => {}}>Live</Tag>
    <Tag onClick={() => {}}>MV</Tag>
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Tag>Showreel</Tag>
    <Tag selected>CINEMASCOPE</Tag>
    <Tag disabled>Archive</Tag>
    <Tag selected disabled>Retired</Tag>
  </div>
);

export const Removable = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Tag onRemove={() => {}}>Motion</Tag>
    <Tag onRemove={() => {}}>16:9</Tag>
    <Tag selected onRemove={() => {}}>3DCG</Tag>
  </div>
);
