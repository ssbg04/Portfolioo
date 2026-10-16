import React, { useEffect, useState, useRef } from 'react';

export default function SpotlightLens() {
  const [active, setActive] = useState(false);
  const [cloneHtml, setCloneHtml] = useState('');
  const [bodySize, setBodySize] = useState({ width: 0, height: 0 });
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [magnifierPos, setMagnifierPos] = useState({ clientX: -100, clientY: -100 });
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
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
    setMounted(true);
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

    const handlePointerMove = (e: PointerEvent) => {
      // If magnifier active, update its position
      if (active) {
        setMagnifierPos({ clientX: e.clientX, clientY: e.clientY });
      }
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
          setMagnifierPos({ clientX: e.clientX || 100, clientY: e.clientY || 100 });
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [active, isDesktop, magnifierEnabled]);

  const LENS_SIZE = 220;
  const SCALE = 1.45;
  const pageX = magnifierPos.clientX + scroll.x;
  const pageY = magnifierPos.clientY + scroll.y;

  if (!mounted || !isDesktop || !active) return null;

  return (
    <div
      className="pointer-events-none fixed z-[99999] rounded-full overflow-hidden border-2 border-primary-500/80 shadow-2xl ring-4 ring-primary-500/20 bg-background-custom"
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
      <div className="absolute inset-0 rounded-full border border-border-custom pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary-custom shadow-xs" />
    </div>
  );
}
