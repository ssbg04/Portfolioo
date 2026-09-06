import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { SocialLink } from '../lib/data';
import haptic from '../lib/haptics';

const SpotifyWidget = lazy(() => import('./SpotifyWidget'));
const GithubContributions = lazy(() => import('./GithubContributions'));

const getFooterIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.09-1.03-1.87-1.09-2.93-3.16-2.61-5.25.38-2.52 2.5-4.46 5.04-4.46.73 0 1.43.16 2.07.46.06.03.11.05.16.08v4.18c-1.38-.24-2.81-.19-4.16.14-1.12.28-2.12 1.05-2.67 2.06-.55 1.01-.58 2.22-.09 3.25.48 1.01 1.41 1.72 2.49 2.03 1.1.32 2.27.32 3.37.01.69-.2 1.34-.55 1.87-.99.53-.44.97-.99 1.25-1.61.28-.62.43-1.28.46-1.95.06-2.69.02-5.38.02-8.07z"/>
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  if (p.includes('mail') || p.includes('email')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
};

interface FooterProps {
  fullName?: string;
  socialLinks?: SocialLink[];
}

export default function Footer({ fullName = 'Cris Charles Garcia', socialLinks = [] }: FooterProps) {
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSpotifyModalOpen(false);
    };
    if (isSpotifyModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotifyModalOpen]);

  const linksToRender = socialLinks.length > 0
    ? socialLinks.filter(l => l.showInFooter !== false)
    : [
        { platform: 'GitHub', url: 'https://github.com/ssbg04', icon: 'github', order: 1 },
        { platform: 'Email', url: 'mailto:crischarlesgarcia345@gmail.com', icon: 'mail', order: 2 }
      ];

  return (
    <footer className="relative z-10 border-t border-border-custom bg-muted-custom/20 pt-10 pb-16 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-6">

        {/* Center: GitHub Contributions Activity Graph */}
        <div className="w-full flex justify-center">
          <Suspense fallback={<div className="h-40 w-full max-w-4xl rounded-3xl bg-foreground-custom/5 animate-pulse" />}>
            <GithubContributions username="ssbg04" />
          </Suspense>
        </div>

        {/* Bottom row: copyright, Spotify popup button & social links */}
        <div className="w-full pt-4 border-t border-border-custom/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground-custom text-center sm:text-left">
            &copy; {new Date().getFullYear()} {fullName}. Built with Astro &amp; React.
          </p>

          <div className="flex items-center gap-2.5">
            {/* Spotify Modal Trigger Button */}
            <button
              onClick={() => {
                haptic.tap();
                setIsSpotifyModalOpen(true);
              }}
              aria-label="Open Spotify Now Playing Modal"
              title="Listening to Spotify"
              className="px-2.5 py-1.5 rounded-xl border border-border-custom hover:border-[#1DB954]/50 bg-foreground-custom/[0.03] hover:bg-[#1DB954]/10 text-foreground-custom flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
            >
              <div className="relative flex items-center justify-center text-[#1DB954]">
                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground-custom group-hover:text-foreground-custom hidden sm:inline">
                Spotify
              </span>
            </button>

            {/* Divider */}
            <div className="h-4 w-px bg-border-custom" />

            {/* Social Links */}
            {linksToRender.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={link.platform}
                title={link.platform}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground-custom hover:text-primary-custom hover:bg-primary-custom/8 transition-all"
              >
                {getFooterIcon(link.platform)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Spotify Now Playing Modal ─── */}
      {isSpotifyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-modal-fade"
          onClick={() => {
            haptic.tap();
            setIsSpotifyModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-background-custom border border-border-custom shadow-2xl p-4 flex flex-col gap-3 animate-modal-scale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1DB954] fill-current" viewBox="0 0 24 24">
                  <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
                </svg>
                <span className="text-xs font-bold font-heading text-foreground-custom">
                  Spotify Status
                </span>
              </div>

              <button
                onClick={() => {
                  haptic.tap();
                  setIsSpotifyModalOpen(false);
                }}
                aria-label="Close Spotify Modal"
                className="p-1 rounded-lg text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/10 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Spotify Widget */}
            <Suspense fallback={<div className="h-20 w-full rounded-2xl bg-foreground-custom/5 animate-pulse" />}>
              <SpotifyWidget />
            </Suspense>
          </div>
        </div>
      )}
    </footer>
  );
}
