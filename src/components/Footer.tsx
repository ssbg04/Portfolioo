import React, { Suspense, lazy, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { SocialLink } from '../lib/data';
import haptic from '../lib/haptics';

const SpotifyWidget = lazy(() => import('./SpotifyWidget'));

interface FooterProps {
  fullName?: string;
  socialLinks?: SocialLink[];
}

export default function Footer({ fullName = 'cris charles garcia', socialLinks = [] }: FooterProps) {
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSpotifyModalOpen(false);
    };
    if (isSpotifyModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotifyModalOpen]);

  const linksToRender = (socialLinks.length > 0
    ? socialLinks.filter(l => l.showInFooter !== false)
    : [
        { platform: 'GitHub', url: 'https://github.com/ssbg04', icon: 'github', order: 1 },
        { platform: 'Email', url: 'mailto:crischarlesgarcia345@gmail.com', icon: 'mail', order: 2 }
      ]
  ).filter(l => !['facebook', 'tiktok'].includes(l.platform.toLowerCase()));

  return (
    <footer className="relative z-10 py-10 border-t border-border-custom bg-background-custom">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6 flex flex-col gap-6">

        {/* Top Row: Brand & Status Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-sm font-medium text-foreground-custom lowercase">
              {fullName.toLowerCase()}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom mt-0.5">
              software developer · technical portfolio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Spotify Audio Indicator */}
            <button
              type="button"
              onClick={() => { haptic.tap(); setIsSpotifyModalOpen(true); }}
              aria-label="Spotify status"
              className="px-2.5 py-1 rounded-md border border-border-custom text-[11px] font-mono text-muted-foreground-custom hover:text-foreground-custom hover:border-border-strong transition-colors inline-flex items-center gap-2 cursor-pointer bg-elevated-custom"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-foreground-custom animate-pulse" />
              <span>spotify now playing</span>
              <span className="text-[10px]">↗</span>
            </button>
          </div>
        </div>

        {/* Middle Row: Navigation Links with bryl underline offset */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 border-y border-border-custom text-xs font-mono text-muted-foreground-custom">
          <a href="/" className="hover:text-foreground-custom transition-colors">home</a>
          <span className="text-border-strong">/</span>
          <a href="/projects" className="hover:text-foreground-custom transition-colors">projects</a>
          <span className="text-border-strong">/</span>
          <a href="/about" className="hover:text-foreground-custom transition-colors">about</a>
          <span className="text-border-strong">/</span>
          <a href="/certifications" className="hover:text-foreground-custom transition-colors">certifications</a>
          <span className="text-border-strong">/</span>
          <a href="/gallery" className="hover:text-foreground-custom transition-colors">gallery</a>
          <span className="text-border-strong">/</span>
          <a href="/contact" className="hover:text-foreground-custom transition-colors">contact</a>
          <span className="text-border-strong">/</span>
          <a href="https://links.crischarles.com" className="hover:text-foreground-custom transition-colors">links ↗</a>
        </div>

        {/* Bottom Row: Copyright & Colophon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-subtle-custom">
          <p>
            &copy; {new Date().getFullYear()} {fullName.toLowerCase()} · no rights reserved
          </p>
          <div className="flex items-center gap-4">
            {linksToRender.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="hover:text-foreground-custom transition-colors"
              >
                {link.platform.toLowerCase()} ↗
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Spotify Modal */}
      {mounted && isSpotifyModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSpotifyModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4 bg-background-custom border border-border-custom shadow-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-custom">
              <span className="text-xs font-mono uppercase tracking-widest text-foreground-custom">
                spotify status
              </span>
              <button
                type="button"
                onClick={() => setIsSpotifyModalOpen(false)}
                className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom px-1.5 py-0.5"
              >
                close [esc]
              </button>
            </div>

            <Suspense fallback={<div className="h-20 w-full animate-pulse bg-elevated-custom rounded-lg" />}>
              <SpotifyWidget isOpen={isSpotifyModalOpen} />
            </Suspense>
          </div>
        </div>,
        document.body
      )}
    </footer>
  );
}
