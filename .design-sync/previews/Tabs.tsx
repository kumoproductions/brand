import React from 'react';
import { Tabs } from '@kumoproductions/branding';

export const Primary = () => (
  <Tabs items={['Works', 'About', 'Process', 'Contact']} value="Works" onChange={() => {}} />
);

export const SmallWithDisabled = () => (
  <Tabs
    size="sm"
    items={[
      { value: 'a', label: '16:9' },
      { value: 'b', label: 'CINEMASCOPE' },
      { value: 'c', label: 'SPHERES', disabled: true },
    ]}
    value="a"
    onChange={() => {}}
  />
);
