import React, { useState, useEffect, Suspense, lazy } from 'react';

const ControlsDropdown = lazy(() => import('./ControlsDropdown'));

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Links', href: '/links' },
  { label: 'Contact', href: '/contact' },
];

interface NavbarProps {
  fullName?: string;
  logoImage?: string;
}

export default function Navbar({ fullName = 'Cris Charles', logoImage = '/logo.png' }: NavbarProps) {
  const [activePath, setActivePath] = useState('/');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change / resize
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
    if (href === '/') return activePath === '/';
    return activePath === href || activePath.startsWith(href + '/');
  };

  return (
    <>
      {/* ── Universal Sticky Top Nav ── */}
      <header
        className={`nav-enter fixed top-0 inset-x-0 z-50 glass-nav transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
        style={{ height: '60px' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

          {/* Brand */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none">
            <img
              src={logoImage || '/logo.png'}
              alt={fullName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-border-custom group-hover:ring-primary-custom/50 transition-all"
            />
            <span className="font-heading font-bold text-sm tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors hidden sm:inline">
              {fullName}
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-lg transition-colors duration-200 ${
                    active
                      ? 'text-primary-custom'
                      : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5'
                  }`}
                >
                  {item.label}
                  {/* Animated underline indicator */}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full bg-primary-custom"
                      style={{ transition: 'width 0.2s ease' }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Controls: Display & Accessibility Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ControlsDropdown />
            </Suspense>

            {/* Hamburger / Toggle — mobile only */}
            <button
              className="md:hidden flex flex-col items-center justify-center gap-1.5 w-9 h-9 rounded-xl hover:bg-foreground-custom/8 active:bg-foreground-custom/15 transition-colors focus:outline-none cursor-pointer border border-border-custom"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={drawerOpen}
            >
              <span className={`block w-4.5 h-0.5 rounded-full bg-foreground-custom transition-all duration-300 ${drawerOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 rounded-full bg-foreground-custom transition-all duration-300 ${drawerOpen ? 'w-0 opacity-0' : 'w-4.5'}`} />
              <span className={`block w-4.5 h-0.5 rounded-full bg-foreground-custom transition-all duration-300 ${drawerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Backdrop ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer (Solid Opaque Theme with Close Button) ── */}
      <aside
        className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-white dark:bg-[#090a0f] text-foreground-custom border-l border-border-custom shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-border-custom bg-muted-custom/20">
          <div className="flex items-center gap-2">
            <img
              src={logoImage || '/logo.png'}
              alt={fullName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-heading font-bold text-xs text-foreground-custom">
              Navigation
            </span>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/10 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary-custom/10 text-primary-custom font-bold border border-primary-custom/20'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5'
                }`}
              >
                <span>{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />}
              </a>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="mt-auto p-4 border-t border-border-custom bg-muted-custom/10">
          <a
            href="/contact"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-95 transition-all shadow-sm"
          >
            Get in Touch
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </aside>
    </>
  );
}
