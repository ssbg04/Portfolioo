import React, { useEffect, useState } from 'react';

export default function Background() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Neo-Brutalist Universal Graph Paper Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Subtle Neo-Brutalist Paper Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-custom/40 pointer-events-none" />
    </div>
  );
}
