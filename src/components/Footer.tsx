import React, { Suspense, lazy, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { SocialLink } from '../lib/data';
import haptic from '../lib/haptics';

const SpotifyWidget = lazy(() => import('./SpotifyWidget'));

const getFooterIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.09-1.03-1.87-1.09-2.93-3.16-2.61-5.25.38-2.52 2.5-4.46 5.04-4.46.73 0 1.43.16 2.07.46.06.03.11.05.16.08v4.18c-1.38-.24-2.81-.19-4.16.14-1.12.28-2.12 1.05-2.67 2.06-.55 1.01-.58 2.22-.09 3.25.48 1.01 1.41 1.72 2.49 2.03 1.1.32 2.27.32 3.37.01.69-.2 1.34-.55 1.87-.99.53-.44.97-.99 1.25-1.61.28-.62.43-1.28.46-1.95.06-2.69.02-5.38.02-8.07z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
};

interface FooterProps {
  fullName?: string;
  socialLinks?: SocialLink[];
}

export default function Footer({ fullName = 'Cris Charles Garcia', socialLinks = [] }: FooterProps) {
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

  const linksToRender = socialLinks.length > 0
    ? socialLinks.filter(l => l.showInFooter !== false)
    : [
        { platform: 'GitHub', url: 'https://github.com/ssbg04', icon: 'github', order: 1 },
        { platform: 'Email', url: 'mailto:crischarlesgarcia345@gmail.com', icon: 'mail', order: 2 }
      ];

  return (
    <footer
      className="relative z-10 pb-safe"
      style={{
        background: 'var(--glass-bg)',
        borderTop: '1px solid var(--glass-border)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, var(--primary-color) 50%, transparent 100%)', opacity: 0.35 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">

          {/* Left: Copyright + Built with */}
          <div className="flex flex-col items-center sm:items-start gap-1 order-3 sm:order-1 shrink-0">
            <p className="text-xs text-muted-foreground-custom font-mono">
              &copy; {new Date().getFullYear()} <span className="text-foreground-custom font-semibold">{fullName}</span>
            </p>
            <p className="text-[10px] text-muted-foreground-custom/70 font-mono flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              Built with Astro &amp; React
            </p>
          </div>

          {/* Center: Spotify glass pill */}
          <div className="order-1 sm:order-2 shrink-0">
            <button
              onClick={() => { haptic.tap(); setIsSpotifyModalOpen(true); }}
              aria-label="Open Spotify Now Playing"
              title="Now playing on Spotify"
              className="group relative flex items-center gap-2.5 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 active:scale-[0.97] overflow-hidden"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 2px 12px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,185,84,0.5)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px -4px rgba(29,185,84,0.25), inset 0 1px 0 rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glass-border)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)';
              }}
            >
              {/* Subtle green ambient glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full"
                style={{ background: 'radial-gradient(circle at center, rgba(29,185,84,0.08), transparent 70%)' }}
              />

              {/* Spotify logo + pulse */}
              <div className="relative shrink-0">
                <svg className="w-4 h-4 fill-current text-[#1DB954] group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                  <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
              </div>

              {/* Sound wave bars */}
              <div className="flex items-end gap-0.5 h-3.5 shrink-0">
                {[1, 0.5, 0.8, 0.3, 0.9].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full bg-[#1DB954] opacity-70"
                    style={{
                      height: `${h * 14}px`,
                      animation: `soundBar${i} 0.8s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>

              <span className="text-xs font-mono text-muted-foreground-custom group-hover:text-foreground-custom transition-colors relative">
                Spotify
              </span>
            </button>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center gap-2 order-2 sm:order-3 shrink-0">
            {linksToRender.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={link.platform}
                title={link.platform}
                className="tap-target group w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 relative overflow-hidden"
                style={{
                  border: '1px solid var(--glass-border)',
                  background: 'var(--muted-color)',
                  color: 'var(--muted-fg-color)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'rgba(59,130,246,0.10)';
                  el.style.borderColor = 'rgba(59,130,246,0.30)';
                  el.style.color = 'var(--primary-color)';
                  el.style.boxShadow = '0 4px 14px -4px var(--primary-glow)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'var(--muted-color)';
                  el.style.borderColor = 'var(--glass-border)';
                  el.style.color = 'var(--muted-fg-color)';
                  el.style.boxShadow = 'none';
                }}
              >
                {getFooterIcon(link.platform)}
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Sound bar keyframes */}
      <style>{`
        @keyframes soundBar0 { from { height: 4px } to { height: 14px } }
        @keyframes soundBar1 { from { height: 8px } to { height: 6px } }
        @keyframes soundBar2 { from { height: 6px } to { height: 12px } }
        @keyframes soundBar3 { from { height: 10px } to { height: 4px } }
        @keyframes soundBar4 { from { height: 4px } to { height: 14px } }
      `}</style>

      {/* ─── Spotify Modal — rendered via portal to escape footer stacking context ─── */}
      {mounted && isSpotifyModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-modal-fade"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => { haptic.tap(); setIsSpotifyModalOpen(false); }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-5 flex flex-col gap-4 animate-modal-scale"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              boxShadow: '0 24px 80px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal top accent */}
            <div
              className="absolute top-0 inset-x-8 h-px rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(29,185,84,0.5), transparent)' }}
            />

            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.25)' }}
                >
                  <svg className="w-4 h-4 text-[#1DB954] fill-current" viewBox="0 0 24 24">
                    <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
                  </svg>
                </div>
                <span className="text-sm font-bold font-heading text-foreground-custom">Spotify Status</span>
              </div>

              <button
                onClick={() => { haptic.tap(); setIsSpotifyModalOpen(false); }}
                aria-label="Close Spotify Modal"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground-custom hover:text-foreground-custom transition-colors cursor-pointer"
                style={{ background: 'var(--muted-color)', border: '1px solid var(--glass-border)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Spotify Widget */}
            <Suspense fallback={<div className="h-24 w-full rounded-2xl animate-pulse" style={{ background: 'var(--muted-color)' }} />}>
              <SpotifyWidget isOpen={isSpotifyModalOpen} />
            </Suspense>
          </div>
        </div>,
        document.body
      )}
    </footer>
  );
}
