import React from 'react';
import { KumoLogo } from '@kumoproductions/branding';

/* Local bundle carries no SVG assets; point at the production origin. */
const ORIGIN = 'https://brand.kumo.productions/';

export const Lockups = () => (
  <div
    style={{
      display: 'flex',
      gap: 'var(--space-6)',
      alignItems: 'center',
      flexWrap: 'wrap',
      background: '#fff',
      border: '1px solid var(--border-default)',
      padding: 'var(--space-5)'
    }}
  >
    <KumoLogo variant="symbol" height={56} basePath={ORIGIN} />
    <KumoLogo variant="primary-tm" height={16} basePath={ORIGIN} />
    <KumoLogo variant="secondary-tm" height={30} basePath={ORIGIN} />
    <KumoLogo variant="abbreviation-tm" height={30} basePath={ORIGIN} />
  </div>
);

export const Inverse = () => (
  <div
    style={{
      display: 'flex',
      gap: 'var(--space-6)',
      alignItems: 'center',
      background: 'var(--surface-inverse)',
      padding: 'var(--space-6) var(--space-5)'
    }}
  >
    <KumoLogo variant="primary-tm" height={16} inverse basePath={ORIGIN} />
  </div>
);
