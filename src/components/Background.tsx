import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../lib/hooks';

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Subtle Dot Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-40" />

      {/* Gentle Ambient Corner Glows (Static, highly performant for all devices) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-custom/8 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-secondary-custom/6 blur-[140px]" />
      <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-primary-custom/6 blur-[120px]" />
    </div>
  );
}
