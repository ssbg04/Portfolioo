import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = lazy(() => import('./ThemeToggle'));
const SpotifyWidget = lazy(() => import('./SpotifyWidget'));

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '2' : '1.8'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '2' : '1.8'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    label: 'About',
    href: '/about',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '2' : '1.8'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    label: 'Links',
    href: '/links',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '2' : '1.8'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '2' : '1.8'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '2' : '1.8'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
];

export default function Navbar() {
  const [activePath, setActivePath] = useState('/');
  const [activeHash, setActiveHash] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, []);

  // IntersectionObserver to highlight current section if on the homepage
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.pathname !== '/') return;

    const sections = ['home', 'projects', 'skills', 'about', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHash(`#${entry.target.id}`);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isItemActive = (item: NavItem) => {
    if (item.href === '/') {
      return activePath === '/' && (!activeHash || activeHash === '#home');
    }
    if (item.href.startsWith('/#')) {
      return activePath === '/' && activeHash === item.href.replace('/', '');
    }
    return activePath === item.href || (item.href !== '/' && activePath.startsWith(item.href));
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. LANDSCAPE MODE: FLUENT UI TOP COMMAND BAR (Non-floating, Edge-to-Edge) */}
      {/* ========================================================================= */}
      <header className="hidden md:block fixed top-0 inset-x-0 z-50 fluent-acrylic transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Fluent Left Brand Signature */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom rounded-lg p-1"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden p-0.5 ring-1 ring-border/20 group-hover:ring-primary-custom/50 transition-all shadow-sm">
                <img
                  src="/logo.png"
                  alt="Cris Charles Logo"
                  draggable="false"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm tracking-tight text-foreground-custom group-hover:text-primary-custom transition-colors">
                  Cris Charles
                </span>
                <span className="text-[10px] uppercase font-medium tracking-widest text-muted-foreground-custom">
                  Full-Stack Dev
                </span>
              </div>
            </a>
          </div>

          {/* Fluent Center Command Bar Tabs */}
          <nav 
            className="flex items-center gap-1 bg-foreground-custom/[0.03] dark:bg-foreground-custom/[0.05] p-1 rounded-xl border border-border/10 shadow-inner"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navItems.map((item, index) => {
              const active = isItemActive(item);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? 'text-foreground-custom'
                      : 'text-muted-foreground-custom hover:text-foreground-custom'
                  }`}
                >
                  {/* Fluent Active Indicator Pill */}
                  {active && (
                    <motion.span
                      layoutId="fluentActiveTab"
                      className="absolute inset-0 bg-background-custom dark:bg-card-custom rounded-lg shadow-sm border border-border/20 z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Fluent Hover Indicator */}
                  {!active && hoveredIndex === index && (
                    <motion.span
                      layoutId="fluentHoverTab"
                      className="absolute inset-0 bg-foreground-custom/5 rounded-lg z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Fluent Right Controls & Widget */}
          <div className="flex items-center gap-3">
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <SpotifyWidget />
            </Suspense>

            <div className="h-5 w-px bg-border/20 mx-0.5" />

            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-foreground-custom/10 animate-pulse" />}>
              <ThemeToggle />
            </Suspense>

            <a
              href="/contact"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-custom text-white hover:bg-primary-custom/90 active:scale-95 transition-all shadow-sm shadow-primary-custom/20"
            >
              <span>Get in Touch</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PORTRAIT MODE: MATERIAL 3 TOP APP BAR (Non-floating, Edge-to-Edge)    */}
      {/* ========================================================================= */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 m3-surface h-14 px-4 flex items-center justify-between border-b border-border/10 transition-colors duration-300">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Cris Charles"
            className="w-7 h-7 rounded-full object-cover shadow-sm ring-1 ring-border/20"
          />
          <span className="font-heading font-bold text-base tracking-tight text-foreground-custom">
            Cris Charles
          </span>
        </a>

        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="w-7 h-7 rounded-full bg-foreground-custom/10 animate-pulse" />}>
            <SpotifyWidget />
          </Suspense>
          <Suspense fallback={<div className="w-7 h-7 rounded-full bg-foreground-custom/10 animate-pulse" />}>
            <ThemeToggle />
          </Suspense>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. PORTRAIT MODE: MATERIAL 3 FIXED BOTTOM NAVIGATION BAR (Edge-to-Edge)  */}
      {/* ========================================================================= */}
      <nav 
        className="md:hidden fixed bottom-0 inset-x-0 z-50 m3-surface h-[68px] px-2 flex items-center justify-around pb-safe transition-colors duration-300"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <a
              key={item.label}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 group focus:outline-none"
            >
              {/* M3 Active Pill Container */}
              <div
                className={`relative w-12 h-7 rounded-full flex items-center justify-center transition-all duration-250 ${
                  active
                    ? 'm3-pill-active font-semibold shadow-xs'
                    : 'text-muted-foreground-custom group-hover:text-foreground-custom group-hover:bg-foreground-custom/5'
                }`}
              >
                {item.icon(active)}
              </div>

              {/* M3 Label */}
              <span
                className={`text-[10px] tracking-tight transition-colors duration-200 ${
                  active
                    ? 'font-bold text-foreground-custom'
                    : 'font-medium text-muted-foreground-custom'
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
