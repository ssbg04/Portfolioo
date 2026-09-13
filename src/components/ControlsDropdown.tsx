import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import haptic from '../lib/haptics';
import { useIsMobile } from '../lib/hooks';

type ThemeMode = 'system' | 'light' | 'dark';

export default function ControlsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [isLiteMode, setIsLiteMode] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    setIsTouchDevice(window.matchMedia('(hover: none) and (pointer: coarse)').matches);

    // Detect theme preferences: Dark default or manual stored
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'light') {
      setThemeMode('light');
      setResolvedTheme('light');
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fafafa');
    } else if (stored === 'system') {
      setThemeMode('system');
      const detectedTheme = systemDark ? 'dark' : 'light';
      setResolvedTheme(detectedTheme);
      if (detectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#090a0f');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fafafa');
      }
    } else {
      // Default: dark mode signature theme
      setThemeMode('dark');
      setResolvedTheme('dark');
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#090a0f');
    }

    const checkLite = () => {
      setIsLiteMode(localStorage.getItem('liteMode') === 'true');
    };
    checkLite();
    window.addEventListener('tier-change', checkLite);
    document.addEventListener('astro:after-swap', checkLite);
    document.addEventListener('astro:page-load', checkLite);

    const savedMag = localStorage.getItem('magnifierEnabled');
    setMagnifierEnabled(savedMag === 'true');

    const savedZoom = localStorage.getItem('pageZoom');
    if (savedZoom) {
      const zoomVal = parseInt(savedZoom, 10);
      if (!isNaN(zoomVal) && zoomVal >= 80 && zoomVal <= 130) {
        setZoom(zoomVal);
        document.documentElement.style.fontSize = `${(zoomVal / 100) * 15}px`;
      }
    }

    // System theme change listener
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentStored = localStorage.getItem('theme');
      if (!currentStored || currentStored === 'system') {
        const isDark = e.matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    if (darkQuery.addEventListener) {
      darkQuery.addEventListener('change', handleSystemThemeChange);
    }

    const handleCustomThemeChange = (e: CustomEvent<{ theme: 'light' | 'dark' }>) => {
      if (e.detail?.theme) {
        setResolvedTheme(e.detail.theme);
      }
    };
    window.addEventListener('theme-change', handleCustomThemeChange as EventListener);

    return () => {
      window.removeEventListener('tier-change', checkLite);
      document.removeEventListener('astro:after-swap', checkLite);
      document.removeEventListener('astro:page-load', checkLite);
      if (darkQuery.removeEventListener) {
        darkQuery.removeEventListener('change', handleSystemThemeChange);
      }
      window.removeEventListener('theme-change', handleCustomThemeChange as EventListener);
    };
  }, []);

  // Handle ESC key and backdrop scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        haptic.tap();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleTheme = (mode: ThemeMode) => {
    haptic.tap();
    setThemeMode(mode);

    let resolved: 'light' | 'dark' = 'dark';
    if (mode === 'system') {
      localStorage.setItem('theme', 'system');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = systemDark ? 'dark' : 'light';
    } else {
      localStorage.setItem('theme', mode);
      resolved = mode;
    }

    setResolvedTheme(resolved);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#090a0f');
    } else {
      document.documentElement.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#fafafa');
    }
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: resolved } }));
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
    window.location.reload();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          haptic.tap();
          setIsOpen(true);
        }}
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`group p-2 sm:px-3 sm:py-1.5 rounded-xl border border-border-custom bg-white/70 dark:bg-zinc-900/70 hover:bg-primary-custom/10 hover:border-primary-custom/40 transition-all flex items-center gap-1.5 text-xs font-semibold text-foreground-custom focus:outline-none focus:ring-2 focus:ring-primary-custom cursor-pointer shadow-xs ${
          isOpen ? 'ring-2 ring-primary-custom/50 border-primary-custom/60 bg-primary-custom/10' : ''
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center text-primary-custom shrink-0">
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <span className="hidden sm:inline text-[11px] font-mono font-medium text-foreground-custom">
          Settings
        </span>

        <svg
          className="w-3 h-3 text-muted-foreground-custom shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Accessibility Modal Dialog (Portaled to document.body) */}
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-modal-fade"
          onClick={() => {
            haptic.tap();
            setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-modal-title"
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 text-foreground-custom animate-modal-scale max-h-[88vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-custom/10 text-primary-custom flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 id="accessibility-modal-title" className="text-sm font-heading font-bold text-zinc-900 dark:text-white">
                    Settings
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Appearance, text zoom &amp; accessibility
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  haptic.tap();
                  setIsOpen(false);
                }}
                aria-label="Close settings modal"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Section 1: Appearance Mode (Auto / Light / Dark) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Appearance Mode
                </span>
                <span className="text-[11px] font-bold text-primary-custom capitalize flex items-center gap-1">
                  {themeMode === 'system' ? `Auto (${resolvedTheme})` : themeMode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                {/* Auto / System (Default) */}
                <button
                  type="button"
                  onClick={() => toggleTheme('system')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'system'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-2 ring-primary-custom border border-zinc-200 dark:border-zinc-700'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60'
                  }`}
                  title="Detect and match your device system theme"
                >
                  <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                  <span>Auto</span>
                </button>

                {/* Light */}
                <button
                  type="button"
                  onClick={() => toggleTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-white text-zinc-900 shadow-sm ring-2 ring-primary-custom border border-zinc-200'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
                  </svg>
                  <span>Light</span>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => toggleTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-zinc-800 text-white shadow-sm ring-2 ring-primary-custom border border-zinc-700'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />
                  </svg>
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Section 2: Magnifier Feature (Hold 'R' / Toggle) - Hidden on Mobile */}
            {!isMobile && !isTouchDevice && (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Magnifier Lens (Key 'R')
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      magnifierEnabled ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {magnifierEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Hold 'R' to Magnify
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Magnifies content directly under mouse pointer
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleMagnifier}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-custom ${
                        magnifierEnabled ? 'bg-primary-custom' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                      aria-label="Toggle magnifier"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          magnifierEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {magnifierEnabled && (
                    <button
                      type="button"
                      onClick={triggerInstantMagnify}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-primary-custom/10 text-primary-custom hover:bg-primary-custom/20 border border-primary-custom/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                      Toggle Magnifier Lens Mode
                    </button>
                  )}
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
              </>
            )}

            {/* Section 3: Page Text Zoom */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      zoom === level
                        ? 'bg-primary-custom text-white border-primary-custom font-bold shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {level === 100 ? '100% (Def)' : `${level}%`}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => changeZoom(zoom - 5)}
                  disabled={zoom <= 80}
                  className="flex-1 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-sm disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  aria-label="Decrease text zoom"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => changeZoom(100)}
                  className="px-3 py-1.5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 hover:text-primary-custom dark:hover:text-primary-custom cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => changeZoom(zoom + 5)}
                  disabled={zoom >= 130}
                  className="flex-1 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-sm disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  aria-label="Increase text zoom"
                >
                  +
                </button>
              </div>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Section 4: Fast / Lite Mode (Data Saver) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Lite Mode (Data Saver)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isLiteMode ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {isLiteMode ? 'Active' : 'Off'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Ultra-Fast Design
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                    Disables heavy background shapes &amp; blurs for lower bandwidth &amp; battery saving
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleLiteMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLiteMode ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
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
        </div>,
        document.body
      )}
    </>
  );
}

