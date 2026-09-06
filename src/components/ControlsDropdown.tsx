import React, { useEffect, useState, useRef } from 'react';
import haptic from '../lib/haptics';
import { useIsMobile } from '../lib/hooks';

export default function ControlsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(100);
  const [isLiteMode, setIsLiteMode] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsTouchDevice(window.matchMedia('(hover: none) and (pointer: coarse)').matches);

    const isDark = document.documentElement.classList.contains('dark') || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');

    const checkLite = () => {
      setIsLiteMode(localStorage.getItem('liteMode') === 'true');
    };
    checkLite();
    window.addEventListener('tier-change', checkLite);

    const savedMag = localStorage.getItem('magnifierEnabled');
    if (savedMag !== null) {
      setMagnifierEnabled(savedMag === 'true');
    }

    const savedZoom = localStorage.getItem('pageZoom');
    if (savedZoom) {
      const zoomVal = parseInt(savedZoom, 10);
      if (!isNaN(zoomVal) && zoomVal >= 80 && zoomVal <= 130) {
        setZoom(zoomVal);
        document.documentElement.style.fontSize = `${(zoomVal / 100) * 15}px`;
      }
    }

    return () => {
      window.removeEventListener('tier-change', checkLite);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleTheme = (targetTheme: 'light' | 'dark') => {
    haptic.tap();
    setTheme(targetTheme);
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMagnifier = () => {
    haptic.tick();
    const nextVal = !magnifierEnabled;
    setMagnifierEnabled(nextVal);
    localStorage.setItem('magnifierEnabled', String(nextVal));
    window.dispatchEvent(new CustomEvent('magnifier-preference-changed', { detail: { enabled: nextVal } }));
  };

  const triggerInstantMagnify = () => {
    haptic.tap();
    window.dispatchEvent(new CustomEvent('toggle-magnifier-mode'));
  };

  const changeZoom = (newZoom: number) => {
    haptic.tick();
    const clamped = Math.max(80, Math.min(130, newZoom));
    setZoom(clamped);
    document.documentElement.style.fontSize = `${(clamped / 100) * 15}px`;
    localStorage.setItem('pageZoom', String(clamped));
  };

  const toggleLiteMode = () => {
    haptic.tap();
    const next = !isLiteMode;
    setIsLiteMode(next);
    localStorage.setItem('liteMode', String(next));
    const nextTier = next ? 'low' : ((navigator.hardwareConcurrency >= 8 && window.devicePixelRatio >= 2) ? 'high' : 'mid');
    document.documentElement.dataset.tier = nextTier;
    window.dispatchEvent(new CustomEvent('tier-change', { detail: { tier: nextTier } }));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => {
          haptic.tap();
          setIsOpen(!isOpen);
        }}
        aria-label="Display & accessibility controls"
        aria-expanded={isOpen}
        className={`p-2 sm:px-3 sm:py-1.5 rounded-xl glass-card flex items-center gap-1.5 text-xs font-semibold text-foreground-custom hover:bg-primary-custom/10 hover:border-primary-custom/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary-custom cursor-pointer ${
          isOpen ? 'ring-2 ring-primary-custom/50 border-primary-custom/60 bg-primary-custom/10' : ''
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center text-primary-custom">
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
            </svg>
          )}
        </div>

        <span className="hidden sm:inline text-[11px] font-mono font-medium text-foreground-custom">
          Theme &amp; Zoom
        </span>

        <svg
          className={`w-3 h-3 text-muted-foreground-custom transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-custom' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* High-Contrast Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-[#12121a] rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-zinc-700/80 z-50 flex flex-col gap-4 text-foreground-custom"
          style={{ animation: 'bentoReveal 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border-custom dark:border-zinc-800">
            <span className="text-xs font-heading font-bold text-foreground-custom">
              Display &amp; Accessibility
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-custom/15 text-primary-custom font-semibold">
              Preferences
            </span>
          </div>

          {/* Section 1: Appearance (High Contrast Toggles) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground-custom">
                Appearance Mode
              </span>
              <span className="text-[11px] font-bold text-primary-custom capitalize">
                {theme}
              </span>
            </div>

            {/* High Contrast Segmented Buttons */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted-custom/50 dark:bg-zinc-900/90 rounded-xl border border-border-custom dark:border-zinc-700">
              <button
                type="button"
                onClick={() => toggleTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-zinc-900 shadow-md ring-2 ring-primary-custom border border-zinc-200'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-zinc-800/60'
                }`}
              >
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
                </svg>
                Light
              </button>

              <button
                type="button"
                onClick={() => toggleTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white shadow-md ring-2 ring-primary-custom border border-zinc-600'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-zinc-800/60'
                }`}
              >
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />
                </svg>
                Dark
              </button>
            </div>
          </div>

          <div className="h-px bg-border-custom dark:bg-zinc-800" />

          {/* Section 2: Magnifier Feature (Hold 'R' / Toggle) - Hidden on Mobile */}
          {!isMobile && !isTouchDevice && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground-custom">
                    Magnifier Lens (Key 'R')
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    magnifierEnabled ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted-custom text-muted-foreground-custom'
                  }`}>
                    {magnifierEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 bg-muted-custom/30 dark:bg-zinc-900/60 rounded-xl border border-border-custom dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground-custom">
                      Hold 'R' to Magnify
                    </span>
                    <span className="text-[10px] text-muted-foreground-custom">
                      Magnifies content under cursor
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleMagnifier}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-custom ${
                      magnifierEnabled ? 'bg-primary-custom' : 'bg-zinc-400 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        magnifierEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {magnifierEnabled && (
                  <button
                    type="button"
                    onClick={triggerInstantMagnify}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-primary-custom/10 text-primary-custom hover:bg-primary-custom/20 border border-primary-custom/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                    Toggle Magnifier Lens Mode
                  </button>
                )}
              </div>

              <div className="h-px bg-border-custom dark:bg-zinc-800" />
            </>
          )}

          {/* Section 3: Page Text Zoom */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground-custom">
                Page Text Zoom
              </span>
              <span className="text-[11px] font-mono font-bold text-primary-custom">
                {zoom}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[85, 100, 115].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => changeZoom(level)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    zoom === level
                      ? 'bg-primary-custom text-white border-primary-custom font-bold shadow-xs'
                      : 'bg-muted-custom/40 dark:bg-zinc-900/60 text-muted-foreground-custom border-border-custom dark:border-zinc-800 hover:text-foreground-custom'
                  }`}
                >
                  {level === 100 ? '100% (Def)' : `${level}%`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => changeZoom(zoom - 5)}
                disabled={zoom <= 80}
                className="flex-1 py-1 rounded-lg bg-muted-custom/40 dark:bg-zinc-800 text-foreground-custom font-bold text-xs hover:bg-muted-custom dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => changeZoom(100)}
                className="px-2 py-1 text-[11px] font-mono text-muted-foreground-custom hover:text-primary-custom cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => changeZoom(zoom + 5)}
                disabled={zoom >= 130}
                className="flex-1 py-1 rounded-lg bg-muted-custom/40 dark:bg-zinc-800 text-foreground-custom font-bold text-xs hover:bg-muted-custom dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="h-px bg-border-custom dark:bg-zinc-800" />

          {/* Section 4: Fast / Lite Mode (Data Saver) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground-custom flex items-center gap-1.5">
                <span>⚡</span> Lite Mode (Data Saver)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLiteMode ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold' : 'bg-muted-custom/60 text-muted-foreground-custom'
              }`}>
                {isLiteMode ? 'Active' : 'Off'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 bg-muted-custom/30 dark:bg-zinc-900/60 rounded-xl border border-border-custom dark:border-zinc-800">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-semibold text-foreground-custom">
                  Ultra-Fast Design
                </span>
                <span className="text-[10px] text-muted-foreground-custom leading-tight mt-0.5">
                  Disables heavy shapes &amp; blurs for slow internet
                </span>
              </div>

              <button
                type="button"
                onClick={toggleLiteMode}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLiteMode ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-700'
                }`}
                aria-label="Toggle lite mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                    isLiteMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
