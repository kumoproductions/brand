import React from 'react';
import { Button, Dialog } from '@kumoproductions/branding';

/* The wrapper's transform makes it the containing block for the Dialog's
   position:fixed overlay, so the scrim + centering stay inside the card
   instead of anchoring to the harness viewport. */
export const Open = () => (
  <div style={{ transform: 'translateZ(0)', height: 400 }}>
    <Dialog
      open
      title="Delete render?"
      meta="C24015"
      onClose={() => {}}
      footer={
        <>
          <Button variant="secondary">Cancel</Button>
          <Button>Delete</Button>
        </>
      }
    >
      This removes delivery_v3.mov from the queue. The source project is not affected.
    </Dialog>
  </div>
);
