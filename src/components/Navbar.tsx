import React, { useState, useEffect, Suspense, lazy } from 'react';
import haptic from '../lib/haptics';

const ControlsDropdown = lazy(() => import('./ControlsDropdown'));

const navItems = [
  { label: 'Home', href: '/', icon: 'fa-solid fa-house' },
  { label: 'Projects', href: '/projects', icon: 'fa-solid fa-diagram-project' },
  { label: 'About', href: '/about', icon: 'fa-solid fa-user' },
  { label: 'Certifications', href: '/certifications', icon: 'fa-solid fa-award' },
  { label: 'Gallery', href: '/gallery', icon: 'fa-solid fa-images' },
  { label: 'Links', href: '/links', icon: 'fa-solid fa-link' },
  { label: 'Contact', href: '/contact', icon: 'fa-solid fa-envelope' },
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
      {/* ── Desktop / Landscape Fixed Left Sidebar (Permanent, no hamburger, no minimize/maximize) ── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-64 h-screen flex-col justify-between border-r border-border-custom bg-background-custom/95 dark:bg-[#090a0f]/95 backdrop-blur-md p-5 select-none"
        aria-label="Desktop sidebar navigation"
      >
        {/* Top: Brand Header - Only name, no icon and no full-stack developer label */}
        <div className="flex flex-col gap-4">
          <a href="/" className="flex items-center group focus:outline-none py-1">
            <span className="font-heading font-bold text-base tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors truncate">
              {fullName}
            </span>
          </a>

          <div className="h-px w-full bg-border-custom/80" />
        </div>

        {/* Center: Vertical Navigation Links */}
        <nav className="flex flex-col gap-1 py-4 overflow-y-auto flex-1 my-2" aria-label="Sidebar main links">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-200 ${
                  active
                    ? 'text-foreground-custom font-bold'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 font-medium'
                }`}
              >
                <i className={`${item.icon} text-sm w-4 text-center shrink-0 transition-colors ${active ? 'text-primary-custom' : 'text-muted-foreground-custom/70'}`} />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-custom shrink-0" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom: Controls & Status */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border-custom/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground-custom">
              Preferences
            </span>
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ControlsDropdown />
            </Suspense>
          </div>

          <a
            href="/contact"
            className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-98 transition-all shadow-sm"
          >
            <span>Get in Touch</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </a>
        </div>
      </aside>

      {/* ── Mobile Sticky Top Header (Only on screens < md) ── */}
      <header
        className={`md:hidden nav-enter fixed top-0 inset-x-0 z-50 glass-nav transition-all duration-300 ${scrolled || drawerOpen ? 'shadow-md bg-background-custom/95 dark:bg-[#090a0f]/95 backdrop-blur-md' : ''}`}
        style={{ height: '60px' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-3">
          {/* Brand - Only Name, no icon */}
          <a href="/" className="flex items-center shrink-0 group focus:outline-none">
            <span className="font-heading font-bold text-base tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors">
              {fullName}
            </span>
          </a>

          {/* Right Controls: Display & Accessibility Dropdown + Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ControlsDropdown />
            </Suspense>

            {/* Hamburger Button with Smooth Animation to 'X' */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-foreground-custom/8 active:bg-foreground-custom/15 transition-colors focus:outline-none cursor-pointer border border-border-custom"
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
        </div>
      </header>

      {/* ── Mobile Navigation Dropdown (Directly on body below top navbar, top nav stays visible) ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 top-[60px] z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-modal-fade"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        >
          <div
            className="w-full bg-white dark:bg-[#090a0f] border-b border-border-custom shadow-2xl flex flex-col p-4 sm:p-5 max-h-[calc(100vh-60px)] overflow-y-auto animate-modal-scale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Links */}
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation links">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      active
                        ? 'text-foreground-custom font-bold'
                        : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`${item.icon} text-sm w-4 text-center transition-colors ${active ? 'text-primary-custom' : 'text-muted-foreground-custom/70'}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-custom shrink-0" />}
                  </a>
                );
              })}
            </nav>

            {/* Mobile Contact Button */}
            <div className="pt-4 mt-3 border-t border-border-custom">
              <a
                href="/contact"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-95 transition-all shadow-sm"
              >
                <span>Get in Touch</span>
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
