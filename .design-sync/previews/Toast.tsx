import React from 'react';
import { Toast } from '@kumoproductions/branding';

export const Inverse = () => (
  <Toast
    title="Render complete"
    description="delivery_v3.mov — 00:00:30"
    onClose={() => {}}
  />
);

export const Light = () => (
  <Toast
    tone="light"
    title="Draft saved"
    description="Autosaved to project C24015."
    onClose={() => {}}
  />
);

export const WithAction = () => (
  <Toast
    title="Render complete"
    description="delivery_v3.mov — 00:00:30"
    onClose={() => {}}
    action={
      <button
        type="button"
        style={{
          appearance: 'none',
          background: 'none',
          border: '1px solid currentColor',
          color: 'inherit',
          padding: '3px 10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          alignSelf: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        View
      </button>
    }
  />
);
