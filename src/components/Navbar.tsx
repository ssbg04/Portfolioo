import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Links', href: '/links' },
  { label: 'Chat', href: '/chat' },
  { label: 'Contact', href: '/contact' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight current section if on the homepage
  useEffect(() => {
    if (window.location.pathname !== '/') return;

    const sections = ['home', 'projects', 'skills', 'about', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
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

  return (
    <>
      {/* Navigation Container */}
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-350 ease-out flex justify-center ${
          isScrolled
            ? 'top-4 px-4'
            : 'top-0 px-0'
        }`}
      >
        <div
          className={`transition-all duration-350 ease-out flex items-center justify-between ${
            isScrolled
              ? 'w-full max-w-4xl glass-nav rounded-full px-6 py-2.5 border border-border-hover/10 shadow-lg'
              : 'w-full max-w-7xl px-8 py-6 bg-transparent border-b border-transparent'
          }`}
        >
          {/* Logo / Name */}
          <a
            href="/"
            className="flex items-center gap-2 group font-semibold text-lg tracking-tight text-foreground-custom"
          >
            <img
              src="/logo.png"
              alt="Cris Charles Logo"
              draggable="false"
              className="w-8 h-8 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="hidden sm:inline font-heading font-bold text-glow">Cris Charles</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav 
            className="hidden md:flex items-center gap-1.5"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navItems.map((item, index) => {
              const isActive = activeHash === item.href || (item.href === '/' && activeHash === '#home');
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative px-4.5 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground-custom hover:text-foreground-custom'
                  }`}
                >
                  {/* Sliding Active Pill */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-primary-custom rounded-full z-0 shadow-sm shadow-primary-custom/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Sliding Hover Pill */}
                  {!isActive && hoveredIndex === index && (
                    <motion.span
                      layoutId="hoverNavIndicator"
                      className="absolute inset-0 bg-primary-custom/10 rounded-full z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full glass-card hover:bg-primary-custom/10 text-foreground-custom transition-all"
              aria-label="Toggle Navigation Menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Glass Sheet) */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-background-custom/30 backdrop-blur-md transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-24 right-4 left-4 glass-card rounded-3xl p-6 border border-border-hover/10 shadow-2xl transition-transform duration-300 ease-out origin-top ${
            mobileMenuOpen ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3.5 rounded-2xl text-base font-semibold hover:bg-primary-custom/10 hover:text-primary-custom text-foreground-custom transition-colors duration-250 flex items-center justify-between"
              >
                {item.label}
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
