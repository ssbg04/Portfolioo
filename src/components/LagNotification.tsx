import React, { useState, useEffect, useRef } from 'react';
import { haptic } from '../lib/haptics';

export default function LagNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [isEnabledSuccess, setIsEnabledSuccess] = useState(false);
  const consecutiveSlowFramesRef = useRef(0);
  const totalSlowFramesRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isMonitoringRef = useRef(true);

  useEffect(() => {
    // If Lite mode is already active, no need to monitor
    if (typeof document === 'undefined') return;
    if (document.documentElement.dataset.tier === 'low' || localStorage.getItem('liteMode') === 'true') {
      return;
    }

    // Check if user dismissed notification in this session
    if (sessionStorage.getItem('dismissedLagNotification') === 'true') {
      return;
    }

    let animationFrameId: number;
    let scrollTimeout: any = null;
    let isScrolling = false;

    const onScroll = () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        consecutiveSlowFramesRef.current = 0;
      }, 400);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const checkFrame = (time: number) => {
      if (!isMonitoringRef.current) return;

      if (lastTimeRef.current) {
        const delta = time - lastTimeRef.current;
        // Evaluate frame drops while actively scrolling
        // Normal 60fps frame is ~16.6ms. A delta > 55ms indicates severe stutter (< 18 FPS)
        if (isScrolling && delta > 55) {
          consecutiveSlowFramesRef.current += 1;
          totalSlowFramesRef.current += 1;

          // If we detect 3 severe frame drops while scrolling
          if (consecutiveSlowFramesRef.current >= 3 || totalSlowFramesRef.current >= 6) {
            isMonitoringRef.current = false;
            setShowNotification(true);
            return;
          }
        } else if (isScrolling && delta < 25) {
          // Healthy frame, decay consecutive counter
          if (consecutiveSlowFramesRef.current > 0) {
            consecutiveSlowFramesRef.current -= 0.5;
          }
        }
      }

      lastTimeRef.current = time;
      animationFrameId = requestAnimationFrame(checkFrame);
    };

    animationFrameId = requestAnimationFrame(checkFrame);

    const onTierChange = () => {
      if (document.documentElement.dataset.tier === 'low') {
        isMonitoringRef.current = false;
        setShowNotification(false);
      }
    };
    window.addEventListener('tier-change', onTierChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('tier-change', onTierChange);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  const handleEnableLiteMode = () => {
    haptic.tap();
    localStorage.setItem('liteMode', 'true');
    document.documentElement.dataset.tier = 'low';
    window.dispatchEvent(new CustomEvent('tier-change', { detail: { tier: 'low' } }));
    setIsEnabledSuccess(true);
    setTimeout(() => {
      setShowNotification(false);
      window.location.reload();
    }, 600);
  };

  const handleDismiss = () => {
    haptic.tap();
    sessionStorage.setItem('dismissedLagNotification', 'true');
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <div 
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm w-auto animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="alert"
      aria-live="polite"
    >
      <div className="glass-card p-4 rounded-2xl border border-amber-500/30 dark:border-amber-500/40 shadow-2xl backdrop-blur-xl bg-background-custom/90 dark:bg-zinc-950/90 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground-custom font-heading">
                {isEnabledSuccess ? 'Lite Mode Enabled' : 'Experiencing Stutter?'}
              </h4>
              <p className="text-[11px] text-muted-foreground-custom leading-tight mt-0.5">
                {isEnabledSuccess 
                  ? 'High-performance rendering is now active.'
                  : 'Turn on Lite Mode for faster scrolling and smoother performance.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss lag notification"
            className="text-muted-foreground-custom hover:text-foreground-custom p-1 rounded-lg hover:bg-foreground-custom/5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isEnabledSuccess && (
          <div className="flex items-center gap-2 pt-1 border-t border-border-custom/50">
            <button
              onClick={handleEnableLiteMode}
              className="flex-1 py-1.5 px-3 rounded-xl bg-primary-custom hover:bg-primary-custom/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Enable Lite Mode</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleDismiss}
              className="py-1.5 px-3 rounded-xl text-xs font-medium text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
