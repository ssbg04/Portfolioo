import React, { useState, useEffect, useRef } from 'react';
import haptic from '../lib/haptics';
import ControlsDropdown from './ControlsDropdown';

const navItems = [
  { label: 'home',           href: '/' },
  { label: 'projects',       href: '/projects' },
  { label: 'about',          href: '/about' },
  { label: 'certifications', href: '/certifications' },
  { label: 'gallery',        href: '/gallery' },
  { label: 'contact',        href: '/contact' },
];

interface NavbarProps {
  fullName?: string;
  logoImage?: string;
  currentPath?: string;
}

export default function Navbar({ fullName = 'cris charles', currentPath }: NavbarProps) {
  const [activePath, setActivePath] = useState<string>(() => {
    if (currentPath) return currentPath;
    if (typeof window !== 'undefined') return window.location.pathname;
    return '/';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const drawerOpenRef = useRef(false);
  const justClosedDrawerRef = useRef(false);

  useEffect(() => {
    if (currentPath) {
      setActivePath(currentPath);
    } else if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, [currentPath]);

  useEffect(() => {
    const handleRoute = () => {
      if (typeof window !== 'undefined') setActivePath(window.location.pathname);
      setDrawerOpen(false);
      setIsNavHidden(false);
    };
    document.addEventListener('astro:page-load', handleRoute);
    document.addEventListener('astro:after-swap', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      document.removeEventListener('astro:page-load', handleRoute);
      document.removeEventListener('astro:after-swap', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          if (currentY <= 20) {
            setIsNavHidden(false);
            lastY = currentY;
            ticking = false;
            return;
          }

          if (drawerOpenRef.current || justClosedDrawerRef.current) {
            setIsNavHidden(false);
            lastY = currentY;
            ticking = false;
            return;
          }

          const diff = currentY - lastY;
          if (diff > 8 && currentY > 60) {
            setIsNavHidden(true);
          } else if (diff < -8) {
            setIsNavHidden(false);
          }

          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setDrawerOpen(false);
        setIsNavHidden(false);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
    if (drawerOpen) {
      justClosedDrawerRef.current = false;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      justClosedDrawerRef.current = true;
      const timer = setTimeout(() => {
        justClosedDrawerRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [drawerOpen]);

  const isActive = (href: string) => {
    const current = (activePath || '/').replace(/\/+$/, '') || '/';
    const target = (href || '').replace(/\/+$/, '') || '/';
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target + '/');
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════ */}
      {/* DESKTOP — bryl-minimal Fixed Left Sidebar (14rem)      */}
      {/* ══════════════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 z-40 w-[var(--sidebar-width)] h-full flex-col select-none overflow-hidden bg-background-custom border-r border-border-custom"
        aria-label="Sidebar navigation"
      >
        {/* ── Brand ── */}
        <div className="shrink-0 px-6 pt-7 pb-5 flex flex-col border-b border-border-custom">
          <a
            href="/"
            onClick={() => setActivePath('/')}
            className="flex flex-col group focus:outline-none focus-visible:underline"
          >
            <span className="font-mono text-sm font-medium tracking-tight text-foreground-custom lowercase truncate">
              {fullName.toLowerCase()}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom mt-1 truncate">
              systems &amp; apps
            </span>
          </a>
        </div>

        {/* ── Navigation Links (Arrow leading indicator) ── */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto px-4 py-6 flex flex-col gap-1.5"
          aria-label="Sidebar main links"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActivePath(item.href)}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-mono transition-colors ${
                  active
                    ? 'text-foreground-custom font-medium'
                    : 'text-muted-foreground-custom hover:text-foreground-custom'
                }`}
              >
                <span
                  className={`text-xs transition-opacity duration-150 ${
                    active ? 'opacity-100 text-foreground-custom' : 'opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0'
                  }`}
                  aria-hidden="true"
                >
                  →
                </span>
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* ── Bottom Controls & Resume ── */}
        <div className="shrink-0 px-5 py-5 flex flex-col gap-3 mt-auto border-t border-border-custom">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">Theme</span>
            <ControlsDropdown />
          </div>

          <a
            href="/CV-Cris-Charles-Garcia.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="bryl-btn-primary w-full justify-center text-center text-xs"
          >
            <span>resume / cv</span>
            <span className="text-[11px]" aria-hidden="true">↗</span>
          </a>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════ */}
      {/* MOBILE — bryl-minimal Sticky Top Header (< 1024px)     */}
      {/* ══════════════════════════════════════════════════════ */}
      <header
        className="lg:hidden fixed top-0 inset-x-0 z-50 bg-background-custom/90 backdrop-blur-md border-b border-border-custom transition-transform duration-200"
        style={{
          height: 'var(--nav-height)',
          transform: isNavHidden && !drawerOpen ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <div className="px-5 h-full flex items-center justify-between gap-3">
          <a
            href="/"
            onClick={() => { setActivePath('/'); setDrawerOpen(false); }}
            className="font-mono text-sm font-medium tracking-tight text-foreground-custom lowercase"
          >
            {fullName.toLowerCase()}
          </a>

          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-custom bg-background-custom text-[11px] font-mono uppercase tracking-wider text-foreground-custom active:opacity-70 cursor-pointer"
            onClick={() => { haptic.tap(); setDrawerOpen(prev => !prev); }}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            <span>{drawerOpen ? 'close' : 'menu'}</span>
            <span className="text-xs" aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════ */}
      {/* MOBILE — Fullscreen Minimal Drawer                     */}
      {/* ══════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col justify-between bg-background-custom/98 backdrop-blur-xl border-t border-border-custom select-none"
          style={{ top: 'var(--nav-height)', height: 'calc(100dvh - var(--nav-height))' }}
        >
          <nav
            className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-3"
            aria-label="Mobile navigation links"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => { setActivePath(item.href); setDrawerOpen(false); }}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 py-2.5 text-base font-mono transition-colors ${
                    active
                      ? 'text-foreground-custom font-medium'
                      : 'text-muted-foreground-custom hover:text-foreground-custom'
                  }`}
                >
                  <span className={`text-sm ${active ? 'opacity-100' : 'opacity-0'}`}>→</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="px-6 py-6 border-t border-border-custom flex flex-col gap-4 bg-background-custom">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">Preferences</span>
              <ControlsDropdown />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="/CV-Cris-Charles-Garcia.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bryl-btn-secondary justify-center text-center text-xs"
              >
                <span>resume</span>
                <span className="text-[10px]">↗</span>
              </a>
              <a
                href="/contact"
                onClick={() => { setActivePath('/contact'); setDrawerOpen(false); }}
                className="bryl-btn-primary justify-center text-center text-xs"
              >
                contact ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
