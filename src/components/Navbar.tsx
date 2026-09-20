import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import haptic from '../lib/haptics';

const ControlsDropdown = lazy(() => import('./ControlsDropdown'));

const navItems = [
  { label: 'Home',           href: '/' },
  { label: 'Projects',       href: '/projects' },
  { label: 'About',          href: '/about' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Gallery',        href: '/gallery' },
  { label: 'Contact',        href: '/contact' },
];

interface NavbarProps {
  fullName?: string;
  logoImage?: string;
  currentPath?: string;
}

export default function Navbar({ fullName = 'Cris Charles', logoImage = '/logo.png', currentPath }: NavbarProps) {
  const [activePath, setActivePath] = useState<string>(() => {
    if (currentPath) return currentPath;
    if (typeof window !== 'undefined') return window.location.pathname;
    return '/';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

          // Always show at top of page or negative iOS bounce
          if (currentY <= 20) {
            setScrolled(false);
            setIsNavHidden(false);
            lastY = currentY;
            ticking = false;
            return;
          }

          setScrolled(currentY > 8);

          // If drawer is open, keep navbar visible and sync lastY
          if (drawerOpenRef.current) {
            setIsNavHidden(false);
            lastY = currentY;
            ticking = false;
            return;
          }

          // Prevent hiding if drawer was just closed
          if (justClosedDrawerRef.current) {
            lastY = currentY;
            ticking = false;
            return;
          }

          const diff = currentY - lastY;

          // Scrolling down: hide when moved down past header
          if (diff > 8 && currentY > 60) {
            setIsNavHidden(true);
          } else if (diff < -8) {
            // Scrolling up: reveal navbar
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
      if (window.innerWidth >= 768) {
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
      setIsNavHidden(false);
      document.body.style.overflow = 'hidden';
    } else if (!drawerOpen && drawerOpenRef.current) {
      // Drawer was just closed
      justClosedDrawerRef.current = true;
      setIsNavHidden(false);
      document.body.style.overflow = 'unset';
      
      const timer = setTimeout(() => {
        justClosedDrawerRef.current = false;
      }, 1000);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [drawerOpen]);

  const isActive = (href: string) => {
    const current = (activePath || '').replace(/\/+$/, '') || '/';
    const target = (href || '').replace(/\/+$/, '') || '/';
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target + '/');
  };


  return (
    <>
      {/* ══════════════════════════════════════════════════════ */}
      {/* DESKTOP — Neo-Brutalist Fixed Left Sidebar            */}
      {/* ══════════════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-[var(--sidebar-width)] h-full flex-col select-none overflow-hidden overscroll-contain"
        style={{
          background: 'var(--nav-bg)',
          borderRight: 'var(--neo-border)',
          boxShadow: '4px 0px 0px 0px var(--border-color)',
        }}
        aria-label="Desktop sidebar navigation"
      >
        {/* ── Brand ── */}
        <div className="shrink-0 px-5 pt-6 pb-4 flex flex-col border-b-2 border-border-custom">
          <a
            href="/"
            onClick={() => setActivePath('/')}
            className="flex flex-col group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
          >
            <span className="font-heading font-black text-base tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors truncate leading-tight">
              {fullName}
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary-custom mt-0.5 truncate">
              DEV_PORTFOLIO.2026
            </span>
          </a>
        </div>

        {/* ── Navigation Links ── */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-2"
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
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                  active
                    ? 'bg-[#facc15] text-black border-2 border-border-custom shadow-[3px_3px_0px_0px_var(--border-color)] -translate-x-[1px] -translate-y-[1px]'
                    : 'text-foreground-custom hover:bg-[#facc15]/25 border-2 border-transparent hover:border-border-custom hover:shadow-[2px_2px_0px_0px_var(--border-color)]'
                }`}
              >
                <span className="truncate uppercase tracking-wider font-heading">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* ── Bottom Controls & CTA ── */}
        <div
          className="shrink-0 px-4 py-4 flex flex-col gap-3 mt-auto border-t-2 border-border-custom"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground-custom">Preferences</span>
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ControlsDropdown />
            </Suspense>
          </div>

          <a
            href="/contact"
            onClick={() => setActivePath('/contact')}
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#facc15] text-black border-2 border-border-custom shadow-[3px_3px_0px_0px_var(--border-color)] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
          >
            Get in Touch
          </a>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════ */}
      {/* MOBILE — Neo-Brutalist Top Header                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-50 glass-nav touch-manipulation"
        style={{
          height: 'var(--nav-height)',
          transform: isNavHidden && !drawerOpen ? 'translateY(-100%)' : 'translateY(0)',
          borderBottom: 'var(--neo-border)',
          boxShadow: '0 3px 0px 0px var(--border-color)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          pointerEvents: 'auto',
        }}
      >
        <div className="px-4 h-full flex items-center justify-between gap-3">
          {/* Brand */}
          <a
            href="/"
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
          >
            <span className="font-heading font-black text-sm tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors">
              {fullName}
            </span>
          </a>

          {/* Neo-Brutalist Capsule Hamburger Toggle */}
          <button
            className="tap-target relative flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer shrink-0 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom select-none border-2 border-border-custom shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            style={{
              background: drawerOpen ? '#facc15' : 'var(--card-bg)',
              color: '#000000',
            }}
            onClick={() => { haptic.tap(); setDrawerOpen(prev => !prev); }}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span
              className="text-[11px] font-mono font-black tracking-wider uppercase"
              style={{ color: 'var(--fg-color)' }}
            >
              {drawerOpen ? 'Close' : 'Menu'}
            </span>
            <div className="w-4 h-3.5 relative flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 rounded-full transition-all duration-200 absolute bg-foreground-custom ${
                  drawerOpen
                    ? 'w-3.5 rotate-45'
                    : 'w-4 -translate-y-1'
                }`}
              />
              <span
                className={`block h-0.5 rounded-full transition-all duration-200 absolute bg-foreground-custom ${
                  drawerOpen
                    ? 'w-3.5 -rotate-45'
                    : 'w-2.5 translate-y-1 right-0'
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════ */}
      {/* MOBILE — Full-Screen Glassmorphism Drawer             */}
      {/* ══════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col justify-between overflow-hidden animate-drawer-slide select-none"
          style={{ top: 'var(--nav-height)', height: 'calc(100dvh - var(--nav-height))' }}
        >
          {/* Refined high-opacity frosted glass base */}
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--nav-drawer-bg)',
              borderTop: 'var(--neo-border)',
            }}
          />

          {/* ── Nav Links ── */}
          <nav
            className="relative flex-1 overflow-y-auto px-5 py-8 flex flex-col gap-2.5"
            aria-label="Mobile navigation links"
          >
            {navItems.map((item, i) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => { setActivePath(item.href); setDrawerOpen(false); }}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-black transition-all duration-150 uppercase tracking-wider ${
                    active
                      ? 'bg-[#facc15] text-black border-2 border-border-custom shadow-[3px_3px_0px_0px_var(--border-color)] -translate-x-[1px] -translate-y-[1px]'
                      : 'bg-white dark:bg-[#161826] text-foreground-custom border-2 border-border-custom shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="font-heading">{item.label}</span>
                  <span className="text-xs font-mono font-bold">→</span>
                </a>
              );
            })}
          </nav>

          {/* ── Bottom Footer ── */}
          <div
            className="relative px-5 py-5 flex flex-col gap-3.5 shrink-0 pb-safe border-t-2 border-border-custom bg-card-custom"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground-custom">Preferences</span>
              <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
                <ControlsDropdown />
              </Suspense>
            </div>

            <a
              href="/contact"
              onClick={() => { setActivePath('/contact'); setDrawerOpen(false); }}
              className="tap-target relative flex items-center justify-center w-full px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider bg-[#facc15] text-black border-2 border-border-custom shadow-[4px_4px_0px_0px_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </>
  );
}
