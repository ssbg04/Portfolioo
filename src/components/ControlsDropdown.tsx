import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import haptic from '../lib/haptics';
import { useIsMobile } from '../lib/hooks';

type ThemeMode = 'system' | 'light' | 'dark';

export default function ControlsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    setIsTouchDevice(window.matchMedia('(hover: none) and (pointer: coarse)').matches);

    // Detect theme preferences: Light default or manual stored
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'dark') {
      setThemeMode('dark');
      setResolvedTheme('dark');
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d0e15');
    } else if (stored === 'system') {
      setThemeMode('system');
      const detectedTheme = systemDark ? 'dark' : 'light';
      setResolvedTheme(detectedTheme);
      if (detectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d0e15');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#faf6f0');
      }
    } else {
      // Default: light mode signature theme
      setThemeMode('light');
      setResolvedTheme('light');
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#faf6f0');
    }

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
        className={`group p-2 sm:px-3 sm:py-1.5 rounded-xl border-2 border-border-custom bg-card-custom hover:bg-[#facc15] hover:text-black transition-all flex items-center gap-1.5 text-xs font-bold text-foreground-custom focus:outline-none cursor-pointer shadow-[2px_2px_0_0_var(--border-color)] hover:shadow-[3px_3px_0_0_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
          isOpen ? 'bg-[#facc15] text-black shadow-none translate-x-[1px] translate-y-[1px]' : ''
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center text-foreground-custom shrink-0">
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <span className="hidden sm:inline text-[11px] font-mono font-bold">
          Settings
        </span>

        <svg
          className="w-3 h-3 shrink-0 stroke-[3]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Accessibility Modal Dialog (Portaled to document.body) */}
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 animate-modal-fade"
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
            className="relative w-full max-w-sm sm:max-w-md rounded-2xl bg-card-custom border-3 border-border-custom shadow-[8px_8px_0_0_var(--border-color)] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 text-foreground-custom animate-modal-scale max-h-[88vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-border-custom">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#facc15] text-black border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 id="accessibility-modal-title" className="text-sm font-heading font-black tracking-tight text-foreground-custom uppercase">
                    Settings
                  </h2>
                  <p className="text-[11px] text-muted-foreground-custom font-mono">
                    Appearance, text zoom &amp; preferences
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
                className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground-custom bg-card-custom border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-rose-500 hover:text-white transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Section 1: Appearance Mode (Auto / Light / Dark) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground-custom">
                  Appearance Mode
                </span>
                <span className="text-[11px] font-mono font-bold text-[#facc15] capitalize flex items-center gap-1">
                  {themeMode === 'system' ? `Auto (${resolvedTheme})` : themeMode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted-custom rounded-xl border-2 border-border-custom">
                {/* Auto / System (Default) */}
                <button
                  type="button"
                  onClick={() => toggleTheme('system')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                    themeMode === 'system'
                      ? 'bg-[#facc15] text-black border-2 border-black shadow-[2px_2px_0_0_#000] font-black'
                      : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-card-custom border-2 border-transparent font-bold'
                  }`}
                  title="Detect and match your device system theme"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                  <span>Auto</span>
                </button>

                {/* Light */}
                <button
                  type="button"
                  onClick={() => toggleTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-[#facc15] text-black border-2 border-black shadow-[2px_2px_0_0_#000] font-black'
                      : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-card-custom border-2 border-transparent font-bold'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
                  </svg>
                  <span>Light</span>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => toggleTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-[#facc15] text-black border-2 border-black shadow-[2px_2px_0_0_#000] font-black'
                      : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-card-custom border-2 border-transparent font-bold'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />
                  </svg>
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <div className="h-0.5 bg-border-custom" />

            {/* Section 2: Magnifier Feature (Hold 'R' / Toggle) - Hidden on Mobile */}
            {!isMobile && !isTouchDevice && (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground-custom">
                      Magnifier Lens (Key 'R')
                    </span>
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border-2 border-border-custom shadow-[1px_1px_0_0_var(--border-color)] ${
                      magnifierEnabled ? 'bg-emerald-400 text-black' : 'bg-muted-custom text-muted-foreground-custom'
                    }`}>
                      {magnifierEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3 bg-muted-custom/40 rounded-xl border-2 border-border-custom">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground-custom">
                        Hold 'R' to Magnify
                      </span>
                      <span className="text-[11px] text-muted-foreground-custom">
                        Magnifies content directly under mouse pointer
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleMagnifier}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-2 border-border-custom ${
                        magnifierEnabled ? 'bg-[#facc15]' : 'bg-zinc-700'
                      }`}
                      aria-label="Toggle magnifier"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black border border-white shadow-xs transition-transform ${
                          magnifierEnabled ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {magnifierEnabled && (
                    <button
                      type="button"
                      onClick={triggerInstantMagnify}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#facc15] text-black border-2 border-border-custom shadow-[3px_3px_0_0_var(--border-color)] hover:shadow-[4px_4px_0_0_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                      Toggle Magnifier Lens Mode
                    </button>
                  )}
                </div>

                <div className="h-0.5 bg-border-custom" />
              </>
            )}

            {/* Section 3: Page Text Zoom */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground-custom">
                  Page Text Zoom
                </span>
                <span className="text-[11px] font-mono font-black text-[#facc15]">
                  {zoom}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[85, 100, 115].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => changeZoom(level)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border-2 border-border-custom cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                      zoom === level
                        ? 'bg-[#facc15] text-black shadow-[3px_3px_0_0_var(--border-color)] font-black'
                        : 'bg-card-custom text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#facc15] hover:text-black'
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
                  className="flex-1 py-1.5 rounded-xl bg-card-custom hover:bg-[#facc15] hover:text-black text-foreground-custom font-black text-sm disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  aria-label="Decrease text zoom"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => changeZoom(100)}
                  className="px-3 py-1.5 text-xs font-mono font-bold text-muted-foreground-custom hover:text-[#facc15] cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => changeZoom(zoom + 5)}
                  disabled={zoom >= 130}
                  className="flex-1 py-1.5 rounded-xl bg-card-custom hover:bg-[#facc15] hover:text-black text-foreground-custom font-black text-sm disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  aria-label="Increase text zoom"
                >
                  +
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

