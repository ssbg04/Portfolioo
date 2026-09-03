import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Smooth mouse inertia on desktop (disabled on touch/portrait)
  const mouseX = useSpring(0, { stiffness: 35, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 35, damping: 25 });

  // Native window scroll tracking
  const { scrollY } = useScroll();

  // ─── Layer 1: Dot Matrix Grid ───
  const gridY = useTransform(scrollY, [0, 3000], [0, 90]);

  // ─── LANDSCAPE PARALLAX MECHANICS ───
  // 1. Controlled vertical drift in the same cohesive direction
  const lsShape1Y = useTransform(scrollY, [0, 3000], [0, 140]);
  const lsShape1X = useTransform(scrollY, [0, 3000], [0, 25]);
  const lsShape1Rotate = useTransform(scrollY, [0, 3000], [0, 15]);
  const lsShape1Scale = useTransform(scrollY, [0, 1500, 3000], [0.95, 1.06, 1.0]);

  // Shape 2 (Upper Right - Cisco Topology)
  const lsShape2Y = useTransform(scrollY, [0, 3000], [0, 110]);
  const lsShape2X = useTransform(scrollY, [0, 3000], [0, -20]);
  const lsShape2Rotate = useTransform(scrollY, [0, 3000], [0, -15]);
  const lsShape2Scale = useTransform(scrollY, [0, 1500, 3000], [1.04, 0.94, 0.98]);
  // Landscape Right-Side Collision Fix: Shape 2 fades out as you reach the lower half
  const lsShape2Opacity = useTransform(scrollY, [0, 1000, 1700], [1, 0.9, 0]);

  // Shape 3 (Lower-Mid Left - Terminal Window)
  const lsShape3Y = useTransform(scrollY, [0, 3000], [0, 130]);
  const lsShape3X = useTransform(scrollY, [0, 3000], [0, 25]);
  const lsShape3Rotate = useTransform(scrollY, [0, 3000], [-5, 12]);
  const lsShape3Scale = useTransform(scrollY, [0, 1500, 3000], [0.93, 1.05, 1.0]);

  // Shape 4 (Lower Right - Git Braces)
  const lsShape4Y = useTransform(scrollY, [0, 3000], [0, 100]);
  const lsShape4X = useTransform(scrollY, [0, 3000], [0, -20]);
  const lsShape4Rotate = useTransform(scrollY, [0, 3000], [0, 15]);
  const lsShape4Scale = useTransform(scrollY, [0, 1500, 3000], [0.94, 1.04, 1.0]);
  // Landscape Right-Side Collision Fix: Shape 4 fades in only when entering the lower half
  const lsShape4Opacity = useTransform(scrollY, [700, 1400, 3000], [0, 0.9, 1]);

  // Combined mouse tracking for desktop landscape with increased travel
  const lsShape1FinalX = useTransform([lsShape1X, mouseX], ([sX, mX]) => (sX as number) + (mX as number) * 1.2);
  const lsShape1FinalY = useTransform([lsShape1Y, mouseY], ([sY, mY]) => (sY as number) + (mY as number) * 1.2);

  const lsShape2FinalX = useTransform([lsShape2X, mouseX], ([sX, mX]) => (sX as number) - (mX as number) * 1.3);
  const lsShape2FinalY = useTransform([lsShape2Y, mouseY], ([sY, mY]) => (sY as number) - (mY as number) * 1.3);

  const lsShape3FinalX = useTransform([lsShape3X, mouseX], ([sX, mX]) => (sX as number) + (mX as number) * 1.1);
  const lsShape3FinalY = useTransform([lsShape3Y, mouseY], ([sY, mY]) => (sY as number) + (mY as number) * 1.1);

  const lsShape4FinalX = useTransform([lsShape4X, mouseX], ([sX, mX]) => (sX as number) - (mX as number) * 1.2);
  const lsShape4FinalY = useTransform([lsShape4Y, mouseY], ([sY, mY]) => (sY as number) + (mY as number) * 1.2);

  // ─── PORTRAIT PARALLAX MECHANICS (MOBILE & VERTICAL TABLET) ───
  // In portrait, shapes follow a vertical spine watermark approach with section focus
  const ptShape1Y = useTransform(scrollY, [0, 1200], [0, 90]);
  const ptShape1Opacity = useTransform(scrollY, [0, 600, 1200], [0.9, 0.5, 0.1]);

  const ptShape2Y = useTransform(scrollY, [400, 1800], [-40, 70]);
  const ptShape2Opacity = useTransform(scrollY, [300, 900, 1600], [0.1, 0.85, 0.15]);

  const ptShape3Y = useTransform(scrollY, [1200, 2600], [-40, 70]);
  const ptShape3Opacity = useTransform(scrollY, [1100, 1800, 2400], [0.1, 0.85, 0.15]);

  const ptShape4Y = useTransform(scrollY, [2000, 3200], [-30, 60]);
  const ptShape4Opacity = useTransform(scrollY, [1800, 2500, 3200], [0.1, 0.9, 0.9]);

  useEffect(() => {
    setMounted(true);

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Only track mouse in landscape desktop
      if (window.innerHeight <= window.innerWidth) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        mouseX.set((e.clientX - centerX) * 0.065);
        mouseY.set((e.clientY - centerY) * 0.065);
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* ─── Layer 1: Dot Matrix Grid (Code Matrix) ─── */}
      <motion.div
        style={reducedMotion ? {} : { y: gridY }}
        className="absolute -top-32 -bottom-32 inset-x-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-35 will-change-transform"
      />

      {/* ─── 1. Code Tag </> (Top-Left in Landscape / Center Crest in Portrait) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : isPortrait
            ? { y: ptShape1Y, opacity: ptShape1Opacity }
            : {
                x: lsShape1FinalX,
                y: lsShape1FinalY,
                rotate: lsShape1Rotate,
                scale: lsShape1Scale,
              }
        }
        className={
          isPortrait
            ? 'absolute top-[4%] left-1/2 -translate-x-1/2 w-[270px] h-[270px] will-change-transform'
            : 'absolute top-[4%] left-[3%] sm:left-[8%] w-[320px] lg:w-[410px] h-[320px] lg:h-[410px] will-change-transform'
        }
      >
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-xs">
          <defs>
            <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--secondary-color)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon
            points="250,30 450,140 450,360 250,470 50,360 50,140"
            fill="url(#codeGrad)"
            stroke="var(--primary-color)"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <circle cx="250" cy="250" r="170" fill="none" stroke="var(--primary-color)" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="6 6" />
          <path d="M 190 170 L 110 250 L 190 330" fill="none" stroke="var(--primary-color)" strokeOpacity="0.28" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="275" y1="160" x2="225" y2="340" stroke="var(--secondary-color)" strokeOpacity="0.26" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 310 170 L 390 250 L 310 330" fill="none" stroke="var(--primary-color)" strokeOpacity="0.28" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="250" y="410" textAnchor="middle" fill="var(--primary-color)" fillOpacity="0.25" fontSize="13" fontFamily="var(--font-mono)" letterSpacing="6">
            &lt;DEV_ENGINE /&gt;
          </text>
        </svg>
      </motion.div>

      {/* ─── 2. Cisco Network Topology (Upper Right in Landscape / Right Gutter in Portrait) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : isPortrait
            ? { y: ptShape2Y, opacity: ptShape2Opacity }
            : {
                x: lsShape2FinalX,
                y: lsShape2FinalY,
                rotate: lsShape2Rotate,
                scale: lsShape2Scale,
                opacity: lsShape2Opacity,
              }
        }
        className={
          isPortrait
            ? 'absolute top-[30%] -right-12 w-[260px] h-[260px] will-change-transform'
            : 'absolute top-[8%] right-[3%] sm:right-[7%] w-[310px] lg:w-[390px] h-[310px] lg:h-[390px] will-change-transform'
        }
      >
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-xs">
          <line x1="250" y1="250" x2="120" y2="130" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="250" y1="250" x2="380" y2="120" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="250" y1="250" x2="390" y2="380" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="250" y1="250" x2="110" y2="370" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="120" y1="130" x2="380" y2="120" stroke="var(--secondary-color)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="110" y1="370" x2="390" y2="380" stroke="var(--secondary-color)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />

          <circle cx="250" cy="250" r="50" fill="var(--secondary-color)" fillOpacity="0.05" stroke="var(--secondary-color)" strokeOpacity="0.28" strokeWidth="1.8" />
          <circle cx="250" cy="250" r="68" fill="none" stroke="var(--secondary-color)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M 235 240 L 250 225 L 265 240 M 250 225 L 250 275 M 235 260 L 250 275 L 265 260" stroke="var(--secondary-color)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />

          <circle cx="120" cy="130" r="28" fill="var(--primary-color)" fillOpacity="0.04" stroke="var(--primary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="120" cy="130" r="10" fill="var(--primary-color)" fillOpacity="0.25" />

          <circle cx="380" cy="120" r="28" fill="var(--secondary-color)" fillOpacity="0.04" stroke="var(--secondary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="380" cy="120" r="10" fill="var(--secondary-color)" fillOpacity="0.25" />

          <circle cx="390" cy="380" r="32" fill="var(--primary-color)" fillOpacity="0.04" stroke="var(--primary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="390" cy="380" r="12" fill="var(--primary-color)" fillOpacity="0.25" />

          <circle cx="110" cy="370" r="26" fill="var(--secondary-color)" fillOpacity="0.04" stroke="var(--secondary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="110" cy="370" r="9" fill="var(--secondary-color)" fillOpacity="0.25" />

          <text x="250" y="335" textAnchor="middle" fill="var(--secondary-color)" fillOpacity="0.25" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="4">
            NODE_TOPOLOGY
          </text>
        </svg>
      </motion.div>

      {/* ─── 3. Terminal IDE Blueprint (Mid-Left in Landscape / Left Gutter in Portrait) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : isPortrait
            ? { y: ptShape3Y, opacity: ptShape3Opacity }
            : {
                x: lsShape3FinalX,
                y: lsShape3FinalY,
                rotate: lsShape3Rotate,
                scale: lsShape3Scale,
              }
        }
        className={
          isPortrait
            ? 'absolute top-[54%] -left-12 w-[260px] h-[260px] will-change-transform'
            : 'absolute top-[54%] left-[3%] sm:left-[8%] w-[310px] lg:w-[390px] h-[310px] lg:h-[390px] will-change-transform'
        }
      >
        <svg viewBox="0 0 480 380" className="w-full h-full">
          <rect x="30" y="30" width="420" height="320" rx="20" fill="var(--primary-color)" fillOpacity="0.03" stroke="var(--primary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <line x1="30" y1="75" x2="450" y2="75" stroke="var(--primary-color)" strokeOpacity="0.18" strokeWidth="1.2" />
          <circle cx="65" cy="53" r="6" fill="var(--primary-color)" fillOpacity="0.30" />
          <circle cx="85" cy="53" r="6" fill="var(--primary-color)" fillOpacity="0.20" />
          <circle cx="105" cy="53" r="6" fill="var(--primary-color)" fillOpacity="0.20" />
          <text x="240" y="58" textAnchor="middle" fill="var(--primary-color)" fillOpacity="0.25" fontSize="11" fontFamily="var(--font-mono)">
            portfolio_runtime.sh
          </text>
          <text x="65" y="125" fill="var(--primary-color)" fillOpacity="0.40" fontSize="20" fontFamily="var(--font-mono)" fontWeight="bold">
            &gt;_
          </text>
          <rect x="110" y="114" width="180" height="12" rx="4" fill="var(--primary-color)" fillOpacity="0.14" />
          <rect x="65" y="155" width="260" height="10" rx="4" fill="var(--foreground)" fillOpacity="0.08" />
          <rect x="65" y="185" width="200" height="10" rx="4" fill="var(--foreground)" fillOpacity="0.08" />
          <rect x="65" y="215" width="310" height="10" rx="4" fill="var(--secondary-color)" fillOpacity="0.12" />
          <rect x="65" y="245" width="150" height="10" rx="4" fill="var(--foreground)" fillOpacity="0.08" />
          <rect x="65" y="275" width="230" height="10" rx="4" fill="var(--primary-color)" fillOpacity="0.10" />
          <rect x="302" y="112" width="10" height="16" rx="2" fill="var(--primary-color)" fillOpacity="0.35" />
        </svg>
      </motion.div>

      {/* ─── 4. Git Commit Tree & Braces (Lower-Right in Landscape / Bottom Crest in Portrait) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : isPortrait
            ? { y: ptShape4Y, opacity: ptShape4Opacity }
            : {
                x: lsShape4FinalX,
                y: lsShape4FinalY,
                rotate: lsShape4Rotate,
                scale: lsShape4Scale,
                opacity: lsShape4Opacity,
              }
        }
        className={
          isPortrait
            ? 'absolute top-[78%] left-1/2 -translate-x-1/2 w-[270px] h-[270px] will-change-transform'
            : 'absolute top-[52%] right-[5%] sm:right-[10%] w-[320px] lg:w-[400px] h-[320px] lg:h-[400px] will-change-transform'
        }
      >
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <path d="M 140 80 Q 90 80 90 160 Q 90 230 60 250 Q 90 270 90 340 Q 90 420 140 420" fill="none" stroke="var(--primary-color)" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 360 80 Q 410 80 410 160 Q 410 230 440 250 Q 410 270 410 340 Q 410 420 360 420" fill="none" stroke="var(--primary-color)" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />

          <line x1="220" y1="100" x2="220" y2="400" stroke="var(--primary-color)" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M 220 160 C 220 200 280 200 280 250 C 280 300 220 300 220 340" fill="none" stroke="var(--secondary-color)" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="5 3" />

          <circle cx="220" cy="120" r="9" fill="var(--primary-color)" fillOpacity="0.35" stroke="var(--primary-color)" strokeWidth="2" />
          <circle cx="220" cy="180" r="7" fill="var(--primary-color)" fillOpacity="0.30" />
          <circle cx="280" cy="250" r="9" fill="var(--secondary-color)" fillOpacity="0.40" stroke="var(--secondary-color)" strokeWidth="2" />
          <circle cx="220" cy="320" r="7" fill="var(--primary-color)" fillOpacity="0.30" />
          <circle cx="220" cy="380" r="9" fill="var(--primary-color)" fillOpacity="0.35" stroke="var(--primary-color)" strokeWidth="2" />

          <text x="250" y="450" textAnchor="middle" fill="var(--primary-color)" fillOpacity="0.25" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="5">
            git:main [HEAD]
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
