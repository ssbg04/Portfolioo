import React, { useState, useEffect } from 'react';

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
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-5 sm:left-7 md:left-72 z-30 pointer-events-none">
      <button
        onClick={scrollToTop}
        className="pointer-events-auto p-2.5 rounded-full bg-card-custom/95 hover:bg-card-custom text-foreground-custom border border-border-custom shadow-md hover:border-primary-custom/40 active:scale-95 transition-all duration-150 cursor-pointer group"
        aria-label="Back to top"
      >
        <svg
          className="w-4 h-4 text-foreground-custom stroke-[2] group-hover:-translate-y-0.5 transition-transform duration-150"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
