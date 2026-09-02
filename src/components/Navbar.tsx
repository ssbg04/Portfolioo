import React, { useState, useEffect, Suspense, lazy } from 'react';

const ControlsDropdown = lazy(() => import('./ControlsDropdown'));

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Links', href: '/links' },
  { label: 'Chat', href: '/chat' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
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
              src="/logo.png"
              alt="Cris Charles"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-border-custom group-hover:ring-primary-custom/50 transition-all"
            />
            <span className="font-heading font-bold text-sm tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors hidden sm:inline">
              Cris Charles
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

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex flex-col items-center justify-center gap-1.5 w-9 h-9 rounded-lg hover:bg-foreground-custom/8 transition-colors focus:outline-none"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
            >
              <span className={`block w-5 h-0.5 rounded-full bg-foreground-custom transition-all duration-300 ${drawerOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 rounded-full bg-foreground-custom transition-all duration-300 ${drawerOpen ? 'w-0 opacity-0' : 'w-5'}`} />
              <span className={`block w-5 h-0.5 rounded-full bg-foreground-custom transition-all duration-300 ${drawerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Backdrop ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-fg-color/20"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 glass-surface border-l border-border-custom flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile menu"
        style={{ paddingTop: '60px' }}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary-custom/10 text-primary-custom'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5'
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-custom shrink-0" />}
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-border-custom">
          <a
            href="/contact"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-95 transition-all"
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
