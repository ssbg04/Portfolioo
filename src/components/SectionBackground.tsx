import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export type SectionVariant =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'testimonials'
  | 'contact';

interface SectionBackgroundProps {
  variant: SectionVariant;
  className?: string;
}

export default function SectionBackground({ variant, className = '' }: SectionBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowTier, setIsLowTier] = useState(() => {
    if (typeof document !== 'undefined') {
      return (
        document.documentElement.dataset.tier === 'low' ||
        localStorage.getItem('liteMode') === 'true'
      );
    }
    return false;
  });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkTier = () => {
      setIsLowTier(
        document.documentElement.dataset.tier === 'low' ||
        localStorage.getItem('liteMode') === 'true'
      );
    };
    checkTier();
    window.addEventListener('tier-change', checkTier);
    document.addEventListener('astro:after-swap', checkTier);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    return () => {
      window.removeEventListener('tier-change', checkTier);
      document.removeEventListener('astro:after-swap', checkTier);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Track scroll strictly within this section's viewport pass
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Snappy responsive spring for mechanical brutalist feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    restDelta: 0.001
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Neo-Brutalist Scroll-Linked Transforms (Active ONLY on scroll)
  // ─────────────────────────────────────────────────────────────────────────────
  const marqueeShift = useTransform(smoothProgress, [0, 1], isMobile ? [-50, 50] : [-160, 160]);
  const hatchShift = useTransform(smoothProgress, [0, 1], isMobile ? [-20, 20] : [-60, 60]);
  const stampShiftY = useTransform(smoothProgress, [0, 1], isMobile ? [-15, 15] : [-45, 45]);
  const matrixShiftX = useTransform(smoothProgress, [0, 1], isMobile ? [-15, 15] : [-40, 40]);
  const sealRotate = useTransform(smoothProgress, [0, 1], isMobile ? [-15, 15] : [-35, 35]);
  const bubbleShift = useTransform(smoothProgress, [0, 1], isMobile ? [-12, 12] : [-30, 30]);
  const airmailShift = useTransform(smoothProgress, [0, 1], isMobile ? [-30, 30] : [-90, 90]);

  // In Ultra Fast mode, skip backgrounds
  if (isLowTier) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO: Neo-Brutalist Marquee Ribbon & Retro Halftone Grid         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'hero' && (
        <div className="relative w-full h-full">
          {/* Stark Graphic Halftone Dots */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1.5px,transparent_1.5px)] opacity-10 dark:opacity-15 [background-size:24px_24px]" />

          {/* Angled Neo-Brutalist Marquee Ticker Band (Glides across on scroll) */}
          <motion.div
            style={reducedMotion ? {} : { x: marqueeShift }}
            className="absolute -top-6 -left-32 -right-32 rotate-[-4deg] sm:rotate-[-3deg] pointer-events-none opacity-25 dark:opacity-35"
          >
            <div className="flex items-center gap-8 py-2.5 px-6 bg-[#facc15] text-black border-y-[3px] border-black dark:border-white shadow-[0_4px_0_0_#000] dark:shadow-[0_4px_0_0_#fff] whitespace-nowrap font-mono font-black text-xs sm:text-sm tracking-widest uppercase select-none">
              <span>★ CRIS CHARLES GARCIA</span>
              <span>// FULL STACK DEVELOPER</span>
              <span>★ SYSTEM.READY // 2026</span>
              <span>// LAGUNA, PH</span>
              <span>★ BUILD &amp; SHIP</span>
              <span>// SOFTWARE ENGINEERING</span>
              <span>★ CRIS CHARLES GARCIA</span>
              <span>// FULL STACK DEVELOPER</span>
            </div>
          </motion.div>

          {/* Corner Graphic Technical Crosses */}
          <div className="absolute top-12 left-8 font-mono text-[10px] font-black tracking-widest text-foreground-custom opacity-30 hidden sm:block">
            + - - - - - - - - [NEO_CORE.V1] - - - - - - - - +
          </div>
          <div className="absolute top-12 right-8 font-mono text-[10px] font-black tracking-widest text-foreground-custom opacity-30 hidden sm:block">
            + - - - - - - - - [LOC: 14.59°N] - - - - - - - - +
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. ABOUT: Neo-Brutalist Diagonal Hazard Hatches & Milestone Route   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'about' && (
        <div className="relative w-full h-full">
          {/* Diagonal Hazard Caution Stripes (Glides on scroll) */}
          <motion.div
            style={reducedMotion ? {} : { x: hatchShift }}
            className="absolute -top-4 -left-20 -right-20 h-6 opacity-20 dark:opacity-30 border-y-2 border-border-custom bg-[repeating-linear-gradient(45deg,var(--border-color),var(--border-color)_14px,transparent_14px,transparent_28px)]"
          />

          {/* Brutalist Section Coordinate Watermark */}
          <motion.div
            style={reducedMotion ? {} : { y: stampShiftY }}
            className="absolute top-16 right-8 flex flex-col items-end gap-1.5 opacity-20 dark:opacity-30 hidden sm:flex"
          >
            <span className="px-2.5 py-1 text-[11px] font-mono font-black uppercase bg-[#facc15] text-black border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)]">
              BIO_INDEX // 01
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase border border-border-custom bg-card-custom text-foreground-custom">
              TIMELINE_PROGRESSION
            </span>
          </motion.div>

          {/* Bottom Hazard Stripe */}
          <motion.div
            style={reducedMotion ? {} : { x: hatchShift }}
            className="absolute -bottom-4 -left-20 -right-20 h-6 opacity-20 dark:opacity-30 border-y-2 border-border-custom bg-[repeating-linear-gradient(-45deg,var(--border-color),var(--border-color)_14px,transparent_14px,transparent_28px)]"
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. SKILLS: Neo-Brutalist Silicon Terminal & Pixel Matrix           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'skills' && (
        <div className="relative w-full h-full">
          {/* Technical ASCII Terminal Framing (Translates on scroll) */}
          <motion.div
            style={reducedMotion ? {} : { x: matrixShiftX }}
            className="absolute top-8 left-8 opacity-20 dark:opacity-30 font-mono text-xs font-black hidden sm:block"
          >
            <div className="border-2 border-border-custom p-2 bg-card-custom shadow-[3px_3px_0_0_var(--border-color)] text-foreground-custom">
              ┌── [SYS.SKILL_MATRIX] ────────┐<br />
              │ STACK // COMPILATION // TECH │<br />
              └──────────────────────────────┘
            </div>
          </motion.div>

          {/* Chunky Retro Silicon Block Patterns in Background */}
          <div className="absolute inset-0 opacity-15 dark:opacity-20 flex items-center justify-between px-10 pointer-events-none">
            <div className="w-32 h-32 border-3 border-dashed border-border-custom p-2 flex flex-wrap gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-6 h-6 border-2 border-border-custom bg-[#facc15]/40" />
              ))}
            </div>
            <div className="w-32 h-32 border-3 border-dashed border-border-custom p-2 flex flex-wrap gap-2 hidden md:flex">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-6 h-6 border-2 border-border-custom bg-[#00f0ff]/40" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. PROJECTS: Neo-Brutalist Window Frame & Layout Crop Crosshairs    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'projects' && (
        <div className="relative w-full h-full">
          {/* Retro Window Title Bar Mock in Background */}
          <motion.div
            style={reducedMotion ? {} : { y: stampShiftY }}
            className="absolute top-8 left-1/2 -translate-x-1/2 opacity-20 dark:opacity-30 pointer-events-none"
          >
            <div className="flex items-center gap-3 px-4 py-1.5 border-2 border-border-custom bg-card-custom shadow-[3px_3px_0_0_var(--border-color)]">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-foreground-custom">
                PROJECT_VIEWPORT [1440x900]
              </span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 border border-border-custom bg-[#facc15] font-mono text-[9px] font-black flex items-center justify-center">-</span>
                <span className="w-3 h-3 border border-border-custom bg-[#00f0ff] font-mono text-[9px] font-black flex items-center justify-center">+</span>
                <span className="w-3 h-3 border border-border-custom bg-[#ff2a85] text-white font-mono text-[9px] font-black flex items-center justify-center">×</span>
              </div>
            </div>
          </motion.div>

          {/* Heavy Architectural Corner Registration Marks */}
          <div className="absolute top-6 left-6 font-mono text-base font-black opacity-30 text-foreground-custom">+</div>
          <div className="absolute top-6 right-6 font-mono text-base font-black opacity-30 text-foreground-custom">+</div>
          <div className="absolute bottom-6 left-6 font-mono text-base font-black opacity-30 text-foreground-custom">+</div>
          <div className="absolute bottom-6 right-6 font-mono text-base font-black opacity-30 text-foreground-custom">+</div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. CERTIFICATIONS: Neo-Brutalist Starburst Seal & Official Stamp    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'certifications' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Rotating Official Starburst Stamp (Rotates on scroll) */}
          <motion.div
            style={reducedMotion ? {} : { rotate: sealRotate }}
            className="absolute opacity-20 dark:opacity-30 origin-center pointer-events-none"
          >
            <div className="w-56 h-56 sm:w-72 sm:h-72 border-3 border-dashed border-border-custom rounded-full flex items-center justify-center p-4">
              <div className="w-full h-full border-2 border-border-custom rounded-full flex flex-col items-center justify-center text-center p-2 bg-[#facc15]/10">
                <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-foreground-custom">
                  ★ VERIFIED &amp; CERTIFIED ★
                </span>
                <span className="font-mono text-[9px] font-bold uppercase text-primary-custom my-1">
                  CISCO // CCNA // HASH_OK
                </span>
                <span className="font-mono text-[8px] font-black tracking-wider text-muted-foreground-custom">
                  [ 256-BIT OFFICIAL RECORD ]
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 6. TESTIMONIALS: Neo-Brutalist Comic Speech Bubble Geometry         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'testimonials' && (
        <div className="relative w-full h-full">
          {/* Oversized Comic Speech Bubble Outline in Background */}
          <motion.div
            style={reducedMotion ? {} : { y: bubbleShift }}
            className="absolute top-12 left-10 opacity-20 dark:opacity-30 pointer-events-none hidden sm:block"
          >
            <div className="px-5 py-3 border-3 border-border-custom bg-[#00f0ff]/20 shadow-[4px_4px_0_0_var(--border-color)] rounded-xl relative">
              <span className="font-mono text-xs font-black uppercase text-foreground-custom">
                &ldquo; CLIENT_VOICE // TRUST_MATRIX &rdquo;
              </span>
              <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-border-custom" />
            </div>
          </motion.div>

          {/* Graphic Halftone Bar in Bottom Margin */}
          <div className="absolute bottom-6 left-0 right-0 h-4 border-y-2 border-border-custom opacity-20 dark:opacity-30 bg-[repeating-linear-gradient(90deg,var(--border-color),var(--border-color)_8px,transparent_8px,transparent_16px)]" />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 7. CONTACT: Neo-Brutalist Airmail Dispatch & Priority Postal Bands  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {variant === 'contact' && (
        <div className="relative w-full h-full">
          {/* Airmail Border Band Across Top (Translates on scroll) */}
          <motion.div
            style={reducedMotion ? {} : { x: airmailShift }}
            className="absolute -top-3 -left-32 -right-32 h-6 border-y-2 border-border-custom opacity-25 dark:opacity-35 bg-[repeating-linear-gradient(135deg,#ff2a85,#ff2a85_16px,#00f0ff_16px,#00f0ff_32px,#facc15_32px,#facc15_48px)]"
          />

          {/* Postal Priority Dispatch Stamp */}
          <motion.div
            style={reducedMotion ? {} : { y: stampShiftY }}
            className="absolute top-12 left-10 opacity-25 dark:opacity-35 pointer-events-none hidden sm:block"
          >
            <div className="px-4 py-2 border-3 border-border-custom bg-card-custom shadow-[4px_4px_0_0_var(--border-color)] -rotate-3 text-foreground-custom font-mono">
              <div className="text-xs font-black uppercase tracking-wider">
                AIRMAIL // PRIORITY_DISPATCH
              </div>
              <div className="text-[10px] font-bold text-primary-custom mt-0.5">
                TO: CRIS CHARLES GARCIA ➔ DIRECT_MSG
              </div>
            </div>
          </motion.div>

          {/* Bottom Airmail Band */}
          <motion.div
            style={reducedMotion ? {} : { x: airmailShift }}
            className="absolute -bottom-3 -left-32 -right-32 h-6 border-y-2 border-border-custom opacity-25 dark:opacity-35 bg-[repeating-linear-gradient(-135deg,#ff2a85,#ff2a85_16px,#00f0ff_16px,#00f0ff_32px,#facc15_32px,#facc15_48px)]"
          />
        </div>
      )}
    </div>
  );
}
