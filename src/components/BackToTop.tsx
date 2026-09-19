import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility(); // Initial check

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 left-5 sm:left-7 md:left-72 z-30 pointer-events-none">
          <motion.button
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="pointer-events-auto p-3 rounded-xl bg-[#facc15] text-black border-2 sm:border-3 border-border-custom shadow-[4px_4px_0_0_var(--border-color)] hover:shadow-[5px_5px_0_0_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer group"
              aria-label="Back to top"
            >
              <svg
                className="w-5 h-5 text-black stroke-[3] group-hover:-translate-y-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
