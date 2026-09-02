import React, { Suspense, lazy } from 'react';

const SpotifyWidget = lazy(() => import('./SpotifyWidget'));

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/ssbg04', icon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )},
  { label: 'Email', href: 'mailto:crischarlesgarcia345@gmail.com', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )},
];

export default function Footer({ fullName = 'Cris Charles Garcia' }: { fullName?: string }) {
  return (
    <footer className="relative z-10 border-t border-border-custom bg-muted-custom/20 pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-6">

        {/* Center: Spotify Widget Box */}
        <div className="w-full flex justify-center">
          <Suspense fallback={<div className="h-16 w-full max-w-sm rounded-2xl bg-foreground-custom/5 animate-pulse" />}>
            <SpotifyWidget />
          </Suspense>
        </div>

        {/* Bottom row: copyright & social links */}
        <div className="w-full pt-4 border-t border-border-custom/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground-custom text-center sm:text-left">
            &copy; {new Date().getFullYear()} {fullName}. Built with Astro &amp; React.
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={link.label}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground-custom hover:text-primary-custom hover:bg-primary-custom/8 transition-all"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
