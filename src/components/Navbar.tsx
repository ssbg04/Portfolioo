import React, { useState, useEffect, Suspense, lazy } from 'react';
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

          // If drawer is open, keep navbar visible
          if (drawerOpen) {
            setIsNavHidden(false);
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
  }, [drawerOpen]);

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
    document.body.style.overflow = drawerOpen ? 'hidden' : 'unset';
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
      {/* DESKTOP — Premium Glassmorphism Fixed Left Sidebar    */}
      {/* ══════════════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-[var(--sidebar-width)] h-full flex-col select-none overflow-hidden overscroll-contain"
        style={{
          background: 'var(--glass-bg)',
          borderRight: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          boxShadow: '4px 0 32px -4px rgba(0,0,0,0.18), inset -1px 0 0 0 rgba(255,255,255,0.06)',
        }}
        aria-label="Desktop sidebar navigation"
      >
        {/* Top accent gradient strip */}
        <div
          className="absolute top-0 inset-x-0 h-0.5 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)', opacity: 0.6 }}
        />

        {/* ── Brand ── */}
        <div className="shrink-0 px-5 pt-6 pb-4 flex flex-col gap-4">
          <a
            href="/"
            onClick={() => setActivePath('/')}
            className="flex flex-col group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom rounded-xl"
          >
            <span className="font-heading font-bold text-sm tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors truncate leading-tight">
              {fullName}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground-custom mt-0.5 truncate">
              Portfolio
            </span>
          </a>

          {/* Separator */}
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)' }}
          />
        </div>

        {/* ── Navigation Links ── */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto px-3 py-1 flex flex-col gap-0.5"
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
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 overflow-hidden"
                style={active ? {
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  background: 'rgba(59,130,246,0.10)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
                } : {
                  color: 'var(--muted-fg-color)',
                }}
              >
                {/* Active left bar */}
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-300"
                  style={{
                    width: '3px',
                    height: active ? '20px' : '0px',
                    background: 'var(--primary-color)',
                    boxShadow: active ? '0 0 8px var(--primary-glow)' : 'none',
                    opacity: active ? 1 : 0,
                  }}
                />

                <span className="truncate">{item.label}</span>

                {/* Hover fill */}
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: 'var(--muted-color)' }}
                />
              </a>
            );
          })}
        </nav>

        {/* ── Bottom Controls & CTA ── */}
        <div
          className="shrink-0 px-4 py-4 flex flex-col gap-3 mt-auto"
          style={{
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono text-muted-foreground-custom tracking-wide">Preferences</span>
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ControlsDropdown />
            </Suspense>
          </div>

          <a
            href="/contact"
            onClick={() => setActivePath('/contact')}
            className="relative flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-custom focus-visible:outline-none group"
            style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
              boxShadow: '0 4px 14px -2px var(--primary-glow)',
            }}
          >
            <span className="relative z-10">Get in Touch</span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            />
          </a>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════ */}
      {/* MOBILE — Glassmorphism Top Header                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-50 glass-nav touch-manipulation"
        style={{
          height: 'var(--nav-height)',
          transform: isNavHidden && !drawerOpen ? 'translateY(-100%)' : 'translateY(0)',
          boxShadow: scrolled || drawerOpen
            ? '0 4px 20px -4px rgba(0,0,0,0.18)'
            : '0 1px 0 0 var(--glass-border)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          willChange: 'transform',
          pointerEvents: isNavHidden && !drawerOpen ? 'none' : 'auto',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--primary-color) 50%, transparent 100%)', opacity: 0.5 }}
        />

        <div className="px-4 h-full flex items-center justify-between gap-3">
          {/* Brand */}
          <a
            href="/"
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom rounded-xl"
          >
            <span className="font-heading font-bold text-sm tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors">
              {fullName}
            </span>
          </a>

          {/* Hamburger */}
          <button
            className="tap-target relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom overflow-hidden"
            style={{
              background: drawerOpen ? 'rgba(59,130,246,0.12)' : 'var(--muted-color)',
              border: `1px solid ${drawerOpen ? 'rgba(59,130,246,0.3)' : 'var(--glass-border)'}`,
            }}
            onClick={() => { haptic.tap(); setDrawerOpen(prev => !prev); }}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
          >
            <div className="w-[18px] h-[14px] relative flex flex-col justify-between">
              <span className={`block h-0.5 rounded-full bg-foreground-custom transition-all duration-300 origin-center ${drawerOpen ? 'rotate-45 translate-y-[6px] w-[18px]' : 'w-[18px]'}`} />
              <span className={`block h-0.5 rounded-full bg-foreground-custom transition-all duration-200 ${drawerOpen ? 'opacity-0 scale-x-0 w-[18px]' : 'opacity-100 w-[13px]'}`} />
              <span className={`block h-0.5 rounded-full bg-foreground-custom transition-all duration-300 origin-center ${drawerOpen ? '-rotate-45 -translate-y-[6px] w-[18px]' : 'w-[18px]'}`} />
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
          {/* Frosted glass base */}
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            }}
          />

          {/* Ambient blue glow top-right */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Ambient glow bottom-left */}
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* ── Nav Links ── */}
          <nav
            className="relative flex-1 overflow-y-auto px-5 py-8 flex flex-col gap-1.5"
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
                  className="group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-all duration-200 overflow-hidden"
                  style={{
                    animationDelay: `${i * 30}ms`,
                    ...(active ? {
                      color: 'var(--primary-color)',
                      fontWeight: 700,
                      background: 'rgba(59,130,246,0.10)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 12px -4px rgba(59,130,246,0.2)',
                    } : {
                      color: 'var(--muted-fg-color)',
                    }),
                  }}
                >
                  {/* Left accent */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{
                      width: '3px',
                      height: active ? '24px' : '0px',
                      background: 'var(--primary-color)',
                      boxShadow: active ? '0 0 10px var(--primary-glow)' : 'none',
                      transition: 'height 0.25s ease, box-shadow 0.25s ease',
                    }}
                  />

                  <span className="font-heading">{item.label}</span>

                  {/* Hover ripple */}
                  <span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ background: 'var(--muted-color)' }}
                  />
                </a>
              );
            })}
          </nav>

          {/* ── Bottom Footer ── */}
          <div
            className="relative px-5 py-5 flex flex-col gap-3.5 shrink-0 pb-safe"
            style={{
              borderTop: '1px solid var(--glass-border)',
              background: 'rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-muted-foreground-custom">Preferences &amp; Settings</span>
              <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
                <ControlsDropdown />
              </Suspense>
            </div>

            <a
              href="/contact"
              onClick={() => { setActivePath('/contact'); setDrawerOpen(false); }}
              className="tap-target relative flex items-center justify-center w-full px-4 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider text-white overflow-hidden active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-primary-custom focus-visible:outline-none group"
              style={{
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                boxShadow: '0 6px 24px -4px var(--primary-glow)',
              }}
            >
              <span className="relative z-10">Get in Touch</span>
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
