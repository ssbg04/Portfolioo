import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpotlightLens() {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ clientX: -100, clientY: -100 });
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [cloneHtml, setCloneHtml] = useState('');
  const [bodySize, setBodySize] = useState({ width: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [magnifierEnabled, setMagnifierEnabled] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isLow = document.documentElement.dataset.tier === 'low';
      setIsDesktop(fine && !isLow);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const savedMag = localStorage.getItem('magnifierEnabled');
    if (savedMag !== null) {
      setMagnifierEnabled(savedMag === 'true');
    }

    const onMagPref = (e: any) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setMagnifierEnabled(e.detail.enabled);
        if (!e.detail.enabled) setActive(false);
      }
    };

    const onToggleMode = () => {
      setActive(prev => {
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
      window.removeEventListener('magnifier-preference-changed', onMagPref);
      window.removeEventListener('toggle-magnifier-mode', onToggleMode);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

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
          setActive(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && active) {
        setActive(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ clientX: e.clientX, clientY: e.clientY });

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, [role="button"], input, textarea, select, .bento-card, .cursor-pointer')
        );
        setIsHovered(isInteractive);
      }
    };

    const handleScroll = () => {
      if (active) setScroll({ x: window.scrollX, y: window.scrollY });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [active, isDesktop, magnifierEnabled]);

  const LENS_SIZE = 220;
  const SCALE = 1.45;
  const pageX = pos.clientX + scroll.x;
  const pageY = pos.clientY + scroll.y;

  if (!isDesktop) return null;

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-[99999] rounded-full overflow-hidden border-2 border-primary-custom/80 shadow-[0_0_40px_rgba(37,99,235,0.35)] bg-background-custom"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: pos.clientX - LENS_SIZE / 2,
              top: pos.clientY - LENS_SIZE / 2,
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-custom shadow-[0_0_8px_rgba(37,99,235,1)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {!active && (
        <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden" aria-hidden="true">
          <div
            className="fixed rounded-full border border-primary-custom/40 transition-all duration-150 ease-out will-change-transform"
            style={{
              width: isHovered ? '42px' : '24px',
              height: isHovered ? '42px' : '24px',
              left: pos.clientX,
              top: pos.clientY,
              transform: 'translate(-50%, -50%)',
              backgroundColor: isHovered ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              boxShadow: isHovered ? '0 0 14px rgba(37, 99, 235, 0.2)' : 'none',
            }}
          />
          <div
            className="fixed rounded-full bg-primary-custom transition-transform duration-75 ease-out will-change-transform"
            style={{
              width: '4px',
              height: '4px',
              left: pos.clientX,
              top: pos.clientY,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      )}
    </>
  );
}
