import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Smooth mouse inertia on desktop
  const mouseX = useSpring(0, { stiffness: 40, damping: 24 });
  const mouseY = useSpring(0, { stiffness: 40, damping: 24 });

  // Native window scroll tracking
  const { scrollY } = useScroll();

  // ─── Layer 1: Dot Matrix Grid ───
  const gridY = useTransform(scrollY, [0, 3000], [0, 100]);

  // ─── Unified Direction Movement (Prevents any collision during scroll) ───
  // All shapes drift in the same cohesive direction at gentle depth offsets
  const shape1ScrollY = useTransform(scrollY, [0, 3000], [0, 160]);
  const shape1ScrollX = useTransform(scrollY, [0, 3000], [0, 30]);
  const shape1Rotate = useTransform(scrollY, [0, 3000], [0, 12]);
  // Shape 1: Zooms in a little as you scroll
  const shape1Scale = useTransform(scrollY, [0, 1500, 3000], [0.95, 1.08, 1.0]);

  const shape2ScrollY = useTransform(scrollY, [0, 3000], [0, 120]);
  const shape2ScrollX = useTransform(scrollY, [0, 3000], [0, -25]);
  const shape2Rotate = useTransform(scrollY, [0, 3000], [0, -15]);
  // Shape 2: Zooms out a little as you scroll
  const shape2Scale = useTransform(scrollY, [0, 1500, 3000], [1.06, 0.92, 0.98]);

  const shape3ScrollY = useTransform(scrollY, [0, 3000], [0, 140]);
  const shape3ScrollX = useTransform(scrollY, [0, 3000], [0, 30]);
  const shape3Rotate = useTransform(scrollY, [0, 3000], [-5, 10]);
  // Shape 3: Zooms in a little as you scroll past it
  const shape3Scale = useTransform(scrollY, [0, 1500, 3000], [0.92, 1.07, 1.0]);

  const shape4ScrollY = useTransform(scrollY, [0, 3000], [0, 110]);
  const shape4ScrollX = useTransform(scrollY, [0, 3000], [0, -25]);
  const shape4Rotate = useTransform(scrollY, [0, 3000], [0, 15]);
  // Shape 4: Zooms out a little
  const shape4Scale = useTransform(scrollY, [0, 1500, 3000], [1.05, 0.93, 1.02]);

  // Unified Scroll + Mouse transforms (prevents Framer Motion transform collisions)
  const shape1FinalX = useTransform([shape1ScrollX, mouseX], ([sX, mX]) => (sX as number) + (mX as number));
  const shape1FinalY = useTransform([shape1ScrollY, mouseY], ([sY, mY]) => (sY as number) + (mY as number));

  const shape2FinalX = useTransform([shape2ScrollX, mouseX], ([sX, mX]) => (sX as number) - (mX as number) * 1.1);
  const shape2FinalY = useTransform([shape2ScrollY, mouseY], ([sY, mY]) => (sY as number) - (mY as number) * 1.1);

  const shape3FinalX = useTransform([shape3ScrollX, mouseX], ([sX, mX]) => (sX as number) + (mX as number) * 0.8);
  const shape3FinalY = useTransform([shape3ScrollY, mouseY], ([sY, mY]) => (sY as number) + (mY as number) * 0.8);

  const shape4FinalX = useTransform([shape4ScrollX, mouseX], ([sX, mX]) => (sX as number) - (mX as number) * 0.9);
  const shape4FinalY = useTransform([shape4ScrollY, mouseY], ([sY, mY]) => (sY as number) + (mY as number) * 0.9);

  useEffect(() => {
    setMounted(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set((e.clientX - centerX) * 0.04);
      mouseY.set((e.clientY - centerY) * 0.04);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* ─── Layer 1: Dot Matrix Grid (Code Matrix) ─── */}
      <motion.div
        style={reducedMotion ? {} : { y: gridY }}
        className="absolute -top-32 -bottom-32 inset-x-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-40 will-change-transform"
      />

      {/* ─── 1. Top-Left: Stylized Code Brackets & Tag </> (Zooms in subtly on scroll) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: shape1FinalX,
                y: shape1FinalY,
                rotate: shape1Rotate,
                scale: shape1Scale,
              }
        }
        className="absolute top-[3%] left-[4%] sm:left-[10%] w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] will-change-transform"
      >
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-xs">
          <defs>
            <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--secondary-color)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Background Outer Hex / Diamond Frame */}
          <polygon
            points="250,30 450,140 450,360 250,470 50,360 50,140"
            fill="url(#codeGrad)"
            stroke="var(--primary-color)"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          {/* Inner Dashed Tech Ring */}
          <circle
            cx="250"
            cy="250"
            r="170"
            fill="none"
            stroke="var(--primary-color)"
            strokeOpacity="0.10"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          {/* Left Angle Bracket < */}
          <path
            d="M 190 170 L 110 250 L 190 330"
            fill="none"
            stroke="var(--primary-color)"
            strokeOpacity="0.30"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center Forward Slash / */}
          <line
            x1="275"
            y1="160"
            x2="225"
            y2="340"
            stroke="var(--secondary-color)"
            strokeOpacity="0.28"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right Angle Bracket > */}
          <path
            d="M 310 170 L 390 250 L 310 330"
            fill="none"
            stroke="var(--primary-color)"
            strokeOpacity="0.30"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Dev Watermark text */}
          <text
            x="250"
            y="410"
            textAnchor="middle"
            fill="var(--primary-color)"
            fillOpacity="0.25"
            fontSize="13"
            fontFamily="var(--font-mono)"
            letterSpacing="6"
          >
            &lt;DEV_ENGINE /&gt;
          </text>
        </svg>
      </motion.div>

      {/* ─── 2. Upper-Mid Right: Cisco Network Topology & Graph Nodes (Zooms out subtly on scroll) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: shape2FinalX,
                y: shape2FinalY,
                rotate: shape2Rotate,
                scale: shape2Scale,
              }
        }
        className="absolute top-[20%] right-[4%] sm:right-[10%] w-[350px] sm:w-[440px] h-[350px] sm:h-[440px] will-change-transform"
      >
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-xs">
          {/* Connecting Bus Lines */}
          <line x1="250" y1="250" x2="120" y2="130" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="250" y1="250" x2="380" y2="120" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="250" y1="250" x2="390" y2="380" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="250" y1="250" x2="110" y2="370" stroke="var(--secondary-color)" strokeOpacity="0.20" strokeWidth="1.5" />
          <line x1="120" y1="130" x2="380" y2="120" stroke="var(--secondary-color)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="110" y1="370" x2="390" y2="380" stroke="var(--secondary-color)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />

          {/* Central Hub Switch / Router Node */}
          <circle cx="250" cy="250" r="50" fill="var(--secondary-color)" fillOpacity="0.05" stroke="var(--secondary-color)" strokeOpacity="0.28" strokeWidth="1.8" />
          <circle cx="250" cy="250" r="68" fill="none" stroke="var(--secondary-color)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="5 5" />
          {/* Core Arrows Symbol in Center */}
          <path d="M 235 240 L 250 225 L 265 240 M 250 225 L 250 275 M 235 260 L 250 275 L 265 260" stroke="var(--secondary-color)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />

          {/* Satellite Nodes */}
          <circle cx="120" cy="130" r="28" fill="var(--primary-color)" fillOpacity="0.04" stroke="var(--primary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="120" cy="130" r="10" fill="var(--primary-color)" fillOpacity="0.25" />

          <circle cx="380" cy="120" r="28" fill="var(--secondary-color)" fillOpacity="0.04" stroke="var(--secondary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="380" cy="120" r="10" fill="var(--secondary-color)" fillOpacity="0.25" />

          <circle cx="390" cy="380" r="32" fill="var(--primary-color)" fillOpacity="0.04" stroke="var(--primary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="390" cy="380" r="12" fill="var(--primary-color)" fillOpacity="0.25" />

          <circle cx="110" cy="370" r="26" fill="var(--secondary-color)" fillOpacity="0.04" stroke="var(--secondary-color)" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="110" cy="370" r="9" fill="var(--secondary-color)" fillOpacity="0.25" />

          {/* Network Data Tag */}
          <text
            x="250"
            y="335"
            textAnchor="middle"
            fill="var(--secondary-color)"
            fillOpacity="0.25"
            fontSize="12"
            fontFamily="var(--font-mono)"
            letterSpacing="4"
          >
            NODE_TOPOLOGY
          </text>
        </svg>
      </motion.div>

      {/* ─── 3. Lower-Mid Left: Floating Developer Terminal / IDE Blueprint (Zooms in subtly on scroll) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: shape3FinalX,
                y: shape3FinalY,
                rotate: shape3Rotate,
                scale: shape3Scale,
              }
        }
        className="absolute top-[56%] left-[4%] sm:left-[11%] w-[340px] sm:w-[430px] h-[340px] sm:h-[430px] will-change-transform"
      >
        <svg viewBox="0 0 480 380" className="w-full h-full">
          {/* Main Terminal Window Frame */}
          <rect
            x="30"
            y="30"
            width="420"
            height="320"
            rx="20"
            fill="var(--primary-color)"
            fillOpacity="0.03"
            stroke="var(--primary-color)"
            strokeOpacity="0.22"
            strokeWidth="1.5"
          />
          {/* Terminal Window Header Bar */}
          <line x1="30" y1="75" x2="450" y2="75" stroke="var(--primary-color)" strokeOpacity="0.18" strokeWidth="1.2" />
          {/* 3 Header Window Dots */}
          <circle cx="65" cy="53" r="6" fill="var(--primary-color)" fillOpacity="0.30" />
          <circle cx="85" cy="53" r="6" fill="var(--primary-color)" fillOpacity="0.20" />
          <circle cx="105" cy="53" r="6" fill="var(--primary-color)" fillOpacity="0.20" />

          {/* Terminal Header Title */}
          <text x="240" y="58" textAnchor="middle" fill="var(--primary-color)" fillOpacity="0.25" fontSize="11" fontFamily="var(--font-mono)">
            portfolio_runtime.sh
          </text>

          {/* Terminal Prompt >_ */}
          <text x="65" y="125" fill="var(--primary-color)" fillOpacity="0.40" fontSize="20" fontFamily="var(--font-mono)" fontWeight="bold">
            &gt;_
          </text>
          {/* Mock Code Line Bars */}
          <rect x="110" y="114" width="180" height="12" rx="4" fill="var(--primary-color)" fillOpacity="0.14" />
          <rect x="65" y="155" width="260" height="10" rx="4" fill="var(--foreground)" fillOpacity="0.08" />
          <rect x="65" y="185" width="200" height="10" rx="4" fill="var(--foreground)" fillOpacity="0.08" />
          <rect x="65" y="215" width="310" height="10" rx="4" fill="var(--secondary-color)" fillOpacity="0.12" />
          <rect x="65" y="245" width="150" height="10" rx="4" fill="var(--foreground)" fillOpacity="0.08" />
          <rect x="65" y="275" width="230" height="10" rx="4" fill="var(--primary-color)" fillOpacity="0.10" />

          {/* Blinking Cursor Bar */}
          <rect x="302" y="112" width="10" height="16" rx="2" fill="var(--primary-color)" fillOpacity="0.35" />
        </svg>
      </motion.div>

      {/* ─── 4. Bottom-Right: Git Commit Graph & Curly Braces { } (Zooms out subtly on scroll) ─── */}
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                x: shape4FinalX,
                y: shape4FinalY,
                rotate: shape4Rotate,
                scale: shape4Scale,
              }
        }
        className="absolute bottom-[4%] right-[5%] sm:right-[12%] w-[360px] sm:w-[450px] h-[360px] sm:h-[450px] will-change-transform"
      >
        <svg viewBox="0 0 500 500" className="w-full h-full">
          {/* Left Large Curly Brace { */}
          <path
            d="M 140 80 Q 90 80 90 160 Q 90 230 60 250 Q 90 270 90 340 Q 90 420 140 420"
            fill="none"
            stroke="var(--primary-color)"
            strokeOpacity="0.25"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Right Large Curly Brace } */}
          <path
            d="M 360 80 Q 410 80 410 160 Q 410 230 440 250 Q 410 270 410 340 Q 410 420 360 420"
            fill="none"
            stroke="var(--primary-color)"
            strokeOpacity="0.25"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Git Commit Branch Graph in Center */}
          {/* Main Branch Line */}
          <line x1="220" y1="100" x2="220" y2="400" stroke="var(--primary-color)" strokeOpacity="0.25" strokeWidth="2" />
          {/* Feature Branch Curve */}
          <path
            d="M 220 160 C 220 200 280 200 280 250 C 280 300 220 300 220 340"
            fill="none"
            stroke="var(--secondary-color)"
            strokeOpacity="0.28"
            strokeWidth="2"
            strokeDasharray="5 3"
          />

          {/* Commit Nodes */}
          <circle cx="220" cy="120" r="9" fill="var(--primary-color)" fillOpacity="0.35" stroke="var(--primary-color)" strokeWidth="2" />
          <circle cx="220" cy="180" r="7" fill="var(--primary-color)" fillOpacity="0.30" />
          <circle cx="280" cy="250" r="9" fill="var(--secondary-color)" fillOpacity="0.40" stroke="var(--secondary-color)" strokeWidth="2" />
          <circle cx="220" cy="320" r="7" fill="var(--primary-color)" fillOpacity="0.30" />
          <circle cx="220" cy="380" r="9" fill="var(--primary-color)" fillOpacity="0.35" stroke="var(--primary-color)" strokeWidth="2" />

          {/* Git Branch Label */}
          <text
            x="250"
            y="450"
            textAnchor="middle"
            fill="var(--primary-color)"
            fillOpacity="0.25"
            fontSize="12"
            fontFamily="var(--font-mono)"
            letterSpacing="5"
          >
            git:main [HEAD]
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
