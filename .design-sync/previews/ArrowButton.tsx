import React from 'react';
import { ArrowButton } from '@kumoproductions/branding';

export const Directions = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
    <ArrowButton label="View projects" />
    <ArrowButton label="Contact" external />
    <ArrowButton label="Back" reverse />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
    <ArrowButton label="Back" reverse size="sm" />
    <ArrowButton label="View projects" size="md" />
    <ArrowButton label="Showreel" size="lg" />
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
    <ArrowButton label="Render queue" />
    <ArrowButton label="Render queue" disabled />
    <ArrowButton ariaLabel="Next shot" />
  </div>
);
