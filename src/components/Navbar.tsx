import React, { useState, useEffect, Suspense, lazy } from 'react';
import haptic from '../lib/haptics';

const ControlsDropdown = lazy(() => import('./ControlsDropdown'));

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
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

  useEffect(() => {
    if (currentPath) {
      setActivePath(currentPath);
    } else if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, [currentPath]);

  // Sync route and close drawer on Astro page transitions & browser navigation
  useEffect(() => {
    const handleRoute = () => {
      if (typeof window !== 'undefined') {
        setActivePath(window.location.pathname);
      }
      setDrawerOpen(false);
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setDrawerOpen(false); };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  const isActive = (href: string) => {
    const current = (activePath || '').replace(/\/+$/, '') || '/';
    const target = (href || '').replace(/\/+$/, '') || '/';
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target + '/');
  };

  return (
    <>
      {/* ── Desktop / Landscape Fixed Left Sidebar (Permanent, no hamburger, no minimize/maximize) ── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-64 h-full flex-col border-r border-border-custom bg-background-custom/95 dark:bg-[#090a0f]/95 backdrop-blur-md select-none overflow-hidden overscroll-contain"
        aria-label="Desktop sidebar navigation"
      >
        {/* Top: Brand Header - Only name, no icon and no full-stack developer label */}
        <div className="shrink-0 px-5 pt-5 pb-3 flex flex-col gap-3">
          <a
            href="/"
            onClick={() => setActivePath('/')}
            className="flex items-center group focus:outline-none py-0.5"
          >
            <span className="font-heading font-bold text-base tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors truncate">
              {fullName}
            </span>
          </a>

          <div className="h-px w-full bg-border-custom/80" />
        </div>

        {/* Center: Vertical Navigation Links (Text-only, no icons, min-h-0 prevents flexbox twitch loop) */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto px-4 py-2 flex flex-col gap-1"
          aria-label="Sidebar main links"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActivePath(item.href)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 shrink-0 ${
                  active
                    ? 'text-foreground-custom font-semibold bg-foreground-custom/[0.04]'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      active
                        ? 'bg-primary-custom scale-100 shadow-[0_0_8px_var(--primary-color)]'
                        : 'bg-transparent scale-0'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </a>
            );
          })}
        </nav>

        {/* Bottom: Controls & Status */}
        <div className="shrink-0 px-5 py-4 border-t border-border-custom/80 flex flex-col gap-3 mt-auto bg-background-custom/40 dark:bg-[#090a0f]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground-custom">
              Preferences
            </span>
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ControlsDropdown />
            </Suspense>
          </div>

          <a
            href="/contact"
            onClick={() => setActivePath('/contact')}
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-98 transition-all shadow-sm"
          >
            <span>Get in Touch</span>
          </a>
        </div>
      </aside>

      {/* ── Mobile Sticky Top Header (Only on screens < md) ── */}
      <header
        className={`md:hidden fixed top-0 inset-x-0 z-50 glass-nav transition-all duration-300 touch-manipulation ${scrolled || drawerOpen ? 'shadow-md bg-background-custom/95 dark:bg-[#090a0f]/95 backdrop-blur-md' : ''}`}
        style={{ height: '60px', touchAction: 'manipulation' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-3">
          {/* Brand - Only Name, no icon */}
          <a href="/" className="flex items-center shrink-0 group focus:outline-none">
            <span className="font-heading font-bold text-base tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors">
              {fullName}
            </span>
          </a>

          {/* Right Controls: Mobile Hamburger (Settings moved inside menu) */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-foreground-custom/8 active:bg-foreground-custom/15 transition-colors focus:outline-none cursor-pointer border border-border-custom shrink-0"
            onClick={() => {
              haptic.tap();
              setDrawerOpen((prev) => !prev);
            }}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={drawerOpen}
          >
            <div className="w-4.5 h-3.5 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 w-4.5 rounded-full bg-foreground-custom transition-all duration-300 origin-center ${
                  drawerOpen ? 'rotate-45 translate-y-[6px]' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-4.5 rounded-full bg-foreground-custom transition-all duration-200 ${
                  drawerOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block h-0.5 w-4.5 rounded-full bg-foreground-custom transition-all duration-300 origin-center ${
                  drawerOpen ? '-rotate-45 -translate-y-[6px]' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* ── Mobile Navigation Full-Screen Overlay (From under top navbar to bottom) ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[60px] bottom-0 z-40 bg-background-custom dark:bg-[#090a0f] border-t border-border-custom flex flex-col justify-between overflow-hidden animate-modal-fade select-none"
          style={{ height: 'calc(100dvh - 60px)' }}
        >
          {/* Scrollable Navigation Links (Text-only, no icons, subtle active indicator dot) */}
          <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1.5" aria-label="Mobile navigation links">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActivePath(item.href);
                    setDrawerOpen(false);
                  }}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl text-base transition-all duration-200 ${
                    active
                      ? 'text-foreground-custom font-bold bg-foreground-custom/[0.04]'
                      : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        active
                          ? 'bg-primary-custom scale-100 shadow-[0_0_8px_var(--primary-color)]'
                          : 'bg-transparent scale-0'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </a>
              );
            })}
          </nav>

          {/* Bottom Drawer Footer: Settings inside menu + Contact CTA */}
          <div className="p-5 border-t border-border-custom bg-foreground-custom/[0.02] flex flex-col gap-3.5 shrink-0">
            {/* Preferences / Settings row */}
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-xs font-mono text-muted-foreground-custom">
                Preferences &amp; Settings
              </span>
              <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
                <ControlsDropdown />
              </Suspense>
            </div>

            {/* Mobile Contact Button (Clean text, no icon) */}
            <a
              href="/contact"
              onClick={() => {
                setActivePath('/contact');
                setDrawerOpen(false);
              }}
              className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-98 transition-all shadow-md"
            >
              <span>Get in Touch</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
