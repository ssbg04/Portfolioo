import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpotlightLens() {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ clientX: 0, clientY: 0 });
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [cloneHtml, setCloneHtml] = useState('');
  const [bodySize, setBodySize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'r' && !active) {
        const contentDiv = document.getElementById('magnify-content');
        if (contentDiv) {
          setCloneHtml(contentDiv.innerHTML);
          // Get the full scrollable dimensions of the page so the clone doesn't collapse
          setBodySize({
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
          });
          setScroll({ x: window.scrollX, y: window.scrollY });
          setActive(true);
          document.body.style.cursor = 'none';
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setActive(false);
        document.body.style.cursor = 'auto';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ clientX: e.clientX, clientY: e.clientY });
    };

    const handleScroll = () => {
      if (active) {
        setScroll({ x: window.scrollX, y: window.scrollY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.body.style.cursor = 'auto';
    };
  }, [active]);

  const LENS_SIZE = 250;
  const SCALE = 1.5;

  // Calculate actual document coordinates on the fly
  const pageX = pos.clientX + scroll.x;
  const pageY = pos.clientY + scroll.y;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed z-[9999] rounded-full overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(var(--primary-custom),0.4)] bg-background-custom"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: pos.clientX - LENS_SIZE / 2,
            top: pos.clientY - LENS_SIZE / 2,
          }}
        >
          {/* The Cloned Magnified Content */}
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

          {/* Glass Glare & Crosshair overlay */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(255,255,255,0.1)] bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-custom/80 shadow-[0_0_10px_rgba(var(--primary-custom),1)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
