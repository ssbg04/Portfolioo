import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Mouse spring for smooth desktop ambient lighting tracking
  const mouseX = useSpring(0, { stiffness: 50, damping: 28 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 28 });

  // Native window scroll tracking
  const { scrollY } = useScroll();

  // Distinct parallax movement across scroll depths
  // Layer 1: Dot Matrix Grid (drifts downward with scroll)
  const gridY = useTransform(scrollY, [0, 2000], [0, 140]);

  // Layer 2: Primary Indigo-Blue Orb (moves down and right)
  const orb1ScrollY = useTransform(scrollY, [0, 2000], [0, 380]);
  const orb1ScrollX = useTransform(scrollY, [0, 2000], [0, 120]);

  // Layer 3: Secondary Violet-Cyan Orb (moves up and counter-left)
  const orb2ScrollY = useTransform(scrollY, [0, 2000], [0, -320]);
  const orb2ScrollX = useTransform(scrollY, [0, 2000], [0, -100]);

  // Layer 4: Emerald-Teal Accent Glow (floats diagonally)
  const orb3ScrollY = useTransform(scrollY, [0, 2000], [0, -220]);
  const orb3ScrollX = useTransform(scrollY, [0, 2000], [0, 80]);

  // Layer 5: Floating Geometric Depth Rings (distinct, noticeable parallax markers)
  const ring1Y = useTransform(scrollY, [0, 2000], [0, 450]);
  const ring2Y = useTransform(scrollY, [0, 2000], [0, -280]);

  useEffect(() => {
    setMounted(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Responsive mouse parallax offset (up to ~55px)
      mouseX.set((e.clientX - centerX) * 0.06);
      mouseY.set((e.clientY - centerY) * 0.06);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* ─── Layer 1: Visible Parallax Dot Matrix Grid ─── */}
      <motion.div
        style={reducedMotion ? {} : { y: gridY }}
        className="absolute -top-32 -bottom-32 inset-x-0 bg-[radial-gradient(hsla(var(--foreground)/0.18)_1.2px,transparent_1.2px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_85%_85%_at_50%_50%,#000_65%,transparent_100%)] opacity-60 dark:opacity-45 will-change-transform"
      />

      {/* ─── Layer 2: Vibrant Indigo-Blue Gradient Orb (Top-Left) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: orb1ScrollX,
                y: orb1ScrollY,
                translateX: mouseX,
                translateY: mouseY,
              }
        }
        className="absolute -top-40 -left-40 w-[520px] sm:w-[620px] h-[520px] sm:h-[620px] rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-500/20 to-purple-600/15 dark:from-blue-500/25 dark:via-indigo-500/25 dark:to-cyan-400/20 blur-[85px] will-change-transform"
      />

      {/* ─── Layer 3: Violet-Pink-Cyan Secondary Orb (Center-Right) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: orb2ScrollX,
                y: orb2ScrollY,
                translateX: useTransform(mouseX, (v) => -v * 1.3),
                translateY: useTransform(mouseY, (v) => -v * 1.3),
              }
        }
        className="absolute top-1/3 -right-36 w-[500px] sm:w-[580px] h-[500px] sm:h-[580px] rounded-full bg-gradient-to-bl from-purple-600/25 via-fuchsia-500/20 to-cyan-500/15 dark:from-purple-500/25 dark:via-pink-500/20 dark:to-indigo-500/20 blur-[90px] will-change-transform"
      />

      {/* ─── Layer 4: Emerald-Teal Radiant Orb (Lower Section) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: orb3ScrollX,
                y: orb3ScrollY,
                translateX: useTransform(mouseX, (v) => v * 0.9),
              }
        }
        className="absolute -bottom-48 left-1/4 w-[480px] sm:w-[560px] h-[480px] sm:h-[560px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-blue-500/15 dark:from-emerald-400/20 dark:via-cyan-500/20 dark:to-blue-500/20 blur-[85px] will-change-transform"
      />

      {/* ─── Layer 5: High-Visibility Parallax Depth Markers ─── */}
      {/* Subtle floating ambient rings that visibly move faster/slower than cards */}
      <motion.div
        style={reducedMotion ? {} : { y: ring1Y }}
        className="hidden md:block absolute top-1/4 left-[8%] w-72 h-72 rounded-full border border-primary-custom/20 dark:border-primary-custom/25 [mask-image:radial-gradient(circle_at_center,transparent_45%,#000_65%)] will-change-transform"
      />
      <motion.div
        style={reducedMotion ? {} : { y: ring2Y }}
        className="hidden md:block absolute top-2/3 right-[10%] w-96 h-96 rounded-full border border-secondary-custom/20 dark:border-secondary-custom/25 [mask-image:radial-gradient(circle_at_center,transparent_45%,#000_65%)] will-change-transform"
      />
    </div>
  );
}
