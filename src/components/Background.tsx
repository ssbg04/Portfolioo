import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [isLowTierOrMobile, setIsLowTierOrMobile] = useState(false);

  // Mouse spring for smooth desktop lighting tracking
  const mouseX = useSpring(0, { stiffness: 40, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 40, damping: 25 });

  // Window scroll progress
  const { scrollY } = useScroll();

  // Decoupled scroll parallax for each ambient layer
  const gridY = useTransform(scrollY, [0, 3000], [0, 90]);
  const orb1ScrollY = useTransform(scrollY, [0, 3000], [0, 260]);
  const orb1ScrollX = useTransform(scrollY, [0, 3000], [0, 80]);

  const orb2ScrollY = useTransform(scrollY, [0, 3000], [0, -280]);
  const orb2ScrollX = useTransform(scrollY, [0, 3000], [0, -70]);

  const orb3ScrollY = useTransform(scrollY, [0, 3000], [0, -160]);

  useEffect(() => {
    setMounted(true);

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowTier = document.documentElement.dataset.tier === 'low';

    if (isCoarse || prefersReduced || isLowTier) {
      setIsLowTierOrMobile(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Gentle offset (max ~35px)
      mouseX.set((e.clientX - centerX) * 0.04);
      mouseY.set((e.clientY - centerY) * 0.04);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Static fallback during SSR or for low-end mobile/reduced-motion users
  if (!mounted || isLowTierOrMobile) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Subtle Dot Matrix Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-40" />

        {/* Gentle Ambient Corner Glows (Static) */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-custom/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-secondary-custom/6 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-primary-custom/6 blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ── Layer 1: Parallax Dot Matrix Grid ── */}
      <motion.div
        style={{ y: gridY }}
        className="absolute -top-24 -bottom-24 inset-x-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-40 will-change-transform"
      />

      {/* ── Layer 2: Top-Left Ambient Orb (Drifts down + tracks cursor) ── */}
      <motion.div
        style={{
          x: orb1ScrollX,
          y: orb1ScrollY,
          translateX: mouseX,
          translateY: mouseY,
        }}
        className="absolute -top-36 -left-36 w-[420px] h-[420px] rounded-full bg-primary-custom/9 blur-[130px] will-change-transform"
      />

      {/* ── Layer 3: Middle-Right Secondary Glow (Drifts up opposite + inverse cursor) ── */}
      <motion.div
        style={{
          x: orb2ScrollX,
          y: orb2ScrollY,
          translateX: useTransform(mouseX, (v) => -v * 1.2),
          translateY: useTransform(mouseY, (v) => -v * 1.2),
        }}
        className="absolute top-1/3 -right-36 w-[440px] h-[440px] rounded-full bg-secondary-custom/7 blur-[145px] will-change-transform"
      />

      {/* ── Layer 4: Lower Primary Glow (Slow floating depth) ── */}
      <motion.div
        style={{
          y: orb3ScrollY,
          translateX: useTransform(mouseX, (v) => v * 0.7),
        }}
        className="absolute -bottom-36 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-custom/7 blur-[130px] will-change-transform"
      />
    </div>
  );
}
