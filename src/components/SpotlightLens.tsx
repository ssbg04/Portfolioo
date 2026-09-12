import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpotlightLens() {
  const [active, setActive] = useState(false);
  const [cloneHtml, setCloneHtml] = useState('');
  const [bodySize, setBodySize] = useState({ width: 0, height: 0 });
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [magnifierPos, setMagnifierPos] = useState({ clientX: -100, clientY: -100 });
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isLow = document.documentElement.dataset.tier === 'low' || localStorage.getItem('liteMode') === 'true';
      return fine && !isLow;
    }
    return false;
  });
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);

  // Direct DOM ref for 120 FPS cursor (0 React re-renders on mouse movement)
  const ringRef = useRef<HTMLDivElement>(null);

  // High-frequency coordinates in refs to bypass React render cycle
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isHoveredRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isVisibleRef = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const checkDesktop = () => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isLow = document.documentElement.dataset.tier === 'low' || localStorage.getItem('liteMode') === 'true';
      setIsDesktop(fine && !isLow);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    window.addEventListener('tier-change', checkDesktop);

    const savedMag = localStorage.getItem('magnifierEnabled');
    setMagnifierEnabled(savedMag === 'true');

    const onMagPref = (e: any) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setMagnifierEnabled(e.detail.enabled);
        if (!e.detail.enabled) setActive(false);
      }
    };

    const onToggleMode = () => {
      setActive((prev) => {
        if (!prev) {
          const contentDiv = document.getElementById('magnify-content');
          if (contentDiv) {
            setCloneHtml(contentDiv.innerHTML);
            setBodySize({
              width: document.documentElement.scrollWidth,
              height: document.documentElement.scrollHeight,
            });
            setScroll({ x: window.scrollX, y: window.scrollY });
          }
        }
        return !prev;
      });
    };

    window.addEventListener('magnifier-preference-changed', onMagPref);
    window.addEventListener('toggle-magnifier-mode', onToggleMode);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('tier-change', checkDesktop);
      window.removeEventListener('magnifier-preference-changed', onMagPref);
      window.removeEventListener('toggle-magnifier-mode', onToggleMode);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // 120 FPS RAF Animation Loop (Hardware Accelerated via translate3d)
    const renderLoop = () => {
      // Smooth spring follow with Linear Interpolation (Lerp)
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      const rx = Number(ringPos.current.x.toFixed(2));
      const ry = Number(ringPos.current.y.toFixed(2));
      const mx = Number(mousePos.current.x.toFixed(2));
      const my = Number(mousePos.current.y.toFixed(2));

      if (ringRef.current) {
        let scale = 1;
        if (isMouseDownRef.current) {
          scale = 0.82;
        } else if (isHoveredRef.current) {
          scale = 1.65;
        }

        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.opacity = isVisibleRef.current ? '1' : '0';
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    rafId.current = requestAnimationFrame(renderLoop);

    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      isVisibleRef.current = true;

      // If magnifier active, update its position
      if (active) {
        setMagnifierPos({ clientX: e.clientX, clientY: e.clientY });
      }

      // Fast check for interactive targets
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, [role="button"], input, textarea, select, .bento-card, .cursor-pointer')
        );
        isHoveredRef.current = isInteractive;

        if (ringRef.current) {
          if (isInteractive) {
            ringRef.current.style.borderColor = 'var(--primary-custom)';
            ringRef.current.style.backgroundColor = 'rgba(56, 189, 248, 0.12)';
            ringRef.current.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.25)';
          } else {
            ringRef.current.style.borderColor = '';
            ringRef.current.style.backgroundColor = '';
            ringRef.current.style.boxShadow = '';
          }
        }
      }
    };

    const handlePointerDown = () => {
      isMouseDownRef.current = true;
    };

    const handlePointerUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) return;

      if (e.key.toLowerCase() === 'r' && !active && magnifierEnabled) {
        const contentDiv = document.getElementById('magnify-content');
        if (contentDiv) {
          setCloneHtml(contentDiv.innerHTML);
          setBodySize({
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
          });
          setScroll({ x: window.scrollX, y: window.scrollY });
          setMagnifierPos({ clientX: mousePos.current.x, clientY: mousePos.current.y });
          setActive(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && active) {
        setActive(false);
      }
    };

    const handleScroll = () => {
      if (active) setScroll({ x: window.scrollX, y: window.scrollY });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [active, isDesktop, magnifierEnabled]);

  const LENS_SIZE = 220;
  const SCALE = 1.45;
  const pageX = magnifierPos.clientX + scroll.x;
  const pageY = magnifierPos.clientY + scroll.y;

  if (!isDesktop) return null;

  return (
    <>
      {/* ─── Magnifier Mode (Hold 'R' / Toggle) ─── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-[99999] rounded-full overflow-hidden border-2 border-primary-custom/80 shadow-[0_0_40px_rgba(56,189,248,0.35)] bg-background-custom"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: magnifierPos.clientX - LENS_SIZE / 2,
              top: magnifierPos.clientY - LENS_SIZE / 2,
            }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                width: bodySize.width,
                height: bodySize.height,
                transformOrigin: '0 0',
                transform: `translate(${LENS_SIZE / 2 - pageX * SCALE}px, ${LENS_SIZE / 2 - pageY * SCALE}px) scale(${SCALE})`,
              }}
              dangerouslySetInnerHTML={{ __html: cloneHtml }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-overlay" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-custom shadow-[0_0_8px_var(--primary-custom)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Redesigned Single Fluid Cursor Ring (No Center Dot) ─── */}
      {!active && (
        <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden select-none" aria-hidden="true">
          {/* Outer Spring Ring (36px, Lerp follow, smooth expand on hover) */}
          <div
            ref={ringRef}
            className="fixed top-0 left-0 w-9 h-9 rounded-full border border-primary-custom/40 bg-primary-custom/[0.04] backdrop-blur-[0.5px] pointer-events-none will-change-transform transition-[border-color,background-color,box-shadow] duration-200"
            style={{
              transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
              opacity: 0,
            }}
          />
        </div>
      )}
    </>
  );
}
