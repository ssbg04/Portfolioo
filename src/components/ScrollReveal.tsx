import React from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: string;
  delay?: number;
}

/**
 * High-performance instant container that bypasses expensive
 * scroll observers, GPU layer cloning, and layout recalculations.
 */
export default function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  return <div className={className}>{children}</div>;
}
