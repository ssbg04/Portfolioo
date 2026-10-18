import React from 'react';

interface TechIconProps {
  name: string;
  className?: string;
}

export default function TechIcon({ name, className = 'w-5 h-5' }: TechIconProps) {
  const n = name.toLowerCase().trim();

  // React / React Native
  if (n.includes('react')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  // Node.js
  if (n.includes('node')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l9 5.2v10.4L12 23l-9-5.4V7.2L12 2zm0 2.3L4.8 8.5v7l7.2 4.2 7.2-4.2v-7L12 4.3zM12 7a5 5 0 015 5c0 2.2-1.4 4-3.5 4.7l-.5-1.5c1.4-.5 2.2-1.7 2.2-3.2 0-1.8-1.4-3.2-3.2-3.2S8.8 10.2 8.8 12c0 1.5.8 2.7 2.2 3.2l-.5 1.5C8.4 16 7 14.2 7 12a5 5 0 015-5z" />
      </svg>
    );
  }

  // PHP
  if (n.includes('php')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3C5.9 3 1 7 1 12s4.9 9 11 9 11-4 11-9-4.9-9-11-9zm-6 12.5l.8-4.5h2.2c1.2 0 1.9.5 1.7 1.6-.2 1.3-1.2 2.9-2.6 2.9H6zm1.2-2.3h1c.6 0 1-.5 1.1-1.1.1-.4 0-.7-.5-.7h-.8l-.8 1.8zm5.8 2.3l.8-4.5h1.2l-.2 1.2h.1c.4-.8 1.1-1.3 1.9-1.3.9 0 1.3.5 1.1 1.5l-.6 3.1h-1.3l.5-2.8c.1-.5 0-.8-.5-.8-.5 0-1 .5-1.2 1.3l-.4 2.3H13zm5.5 0l.8-4.5h2.2c1.2 0 1.9.5 1.7 1.6-.2 1.3-1.2 2.9-2.6 2.9h-2.1zm1.2-2.3h1c.6 0 1-.5 1.1-1.1.1-.4 0-.7-.5-.7h-.8l-.8 1.8z" />
      </svg>
    );
  }

  // JavaScript / TypeScript
  if (n.includes('typescript') || n === 'ts') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 3h20v18H2V3zm11.5 8.5h-2v6h2v-6zm-.5-1.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm7 5.5c-.3-.2-.8-.4-1.4-.4-.7 0-1.1.3-1.1.7 0 .4.4.6 1.2.9 1.3.5 2 1.1 2 2.2 0 1.4-1.1 2.3-2.8 2.3-.9 0-1.7-.2-2.3-.6l.5-1.5c.5.3 1.1.5 1.8.5.8 0 1.2-.3 1.2-.7 0-.4-.4-.6-1.3-.9-1.2-.5-1.9-1.1-1.9-2.1 0-1.4 1.1-2.2 2.6-2.2.8 0 1.5.2 2 .5l-.5 1.6z" />
      </svg>
    );
  }

  if (n.includes('js') || n.includes('javascript')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 3h20v18H2V3zm10.5 12.8c0 1.2-.8 1.9-2.2 1.9-.8 0-1.5-.2-2-.6l.5-1.6c.4.3.9.5 1.5.5.6 0 .9-.3.9-.7v-4.5h1.3v4.5zm5.5-.3c-.3-.2-.8-.4-1.4-.4-.7 0-1.1.3-1.1.7 0 .4.4.6 1.2.9 1.3.5 2 1.1 2 2.2 0 1.4-1.1 2.3-2.8 2.3-.9 0-1.7-.2-2.3-.6l.5-1.5c.5.3 1.1.5 1.8.5.8 0 1.2-.3 1.2-.7 0-.4-.4-.6-1.3-.9-1.2-.5-1.9-1.1-1.9-2.1 0-1.4 1.1-2.2 2.6-2.2.8 0 1.5.2 2 .5l-.5 1.6z" />
      </svg>
    );
  }

  // HTML / HTML5
  if (n.includes('html')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3zm15.1 5.3H8.3l.3 3.3h9.2l-.7 7.5-4.8 1.4-4.8-1.4-.3-3.8h2.3l.1 1.8 2.7.7 2.7-.7.3-3H6l-.7-7.5h13.1l-.3 1.7z" />
      </svg>
    );
  }

  // CSS / CSS3
  if (n.includes('css')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3zm14.8 6.5h-9l.2 2.2h8.6l-.7 7.5-4.9 1.4-4.9-1.4-.3-3.8h2.3l.1 1.8 2.8.7 2.8-.7.3-3.2H8.3l-.7-6.8h10.4l-.2 2.2z" />
      </svg>
    );
  }

  // Tailwind CSS
  if (n.includes('tailwind')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6c-2.4 0-4 1.2-4.8 3.6 1-1.2 2.2-1.6 3.6-1.2.8.2 1.4.8 2 1.5C13.8 11 15 12.2 17.5 12.2c2.4 0 4-1.2 4.8-3.6-1 1.2-2.2 1.6-3.6 1.2-.8-.2-1.4-.8-2-1.5C15.7 7.2 14.5 6 12 6zM6.5 12c-2.4 0-4 1.2-4.8 3.6 1-1.2 2.2-1.6 3.6-1.2.8.2 1.4.8 2 1.5 1 1.1 2.2 2.3 4.7 2.3 2.4 0 4-1.2 4.8-3.6-1 1.2-2.2 1.6-3.6 1.2-.8-.2-1.4-.8-2-1.5-1-1.1-2.2-2.3-4.7-2.3z" />
      </svg>
    );
  }

  // Python
  if (n.includes('python')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.9 2c-3.1 0-5.2.3-5.2 2.3v2h5.3v.7H4.3c-2 0-3.3 1.3-3.3 3.3 0 2.2 1.4 3.3 3.3 3.3h1.3v-1.7c0-1.8 1.5-3.3 3.3-3.3h5.3c1.5 0 2.7-1.2 2.7-2.7V4.3C16.9 2.3 15 2 11.9 2zm-1.7 1.7a.8.8 0 110 1.6.8.8 0 010-1.6zM12.1 22c3.1 0 5.2-.3 5.2-2.3v-2H12v-.7h7.7c2 0 3.3-1.3 3.3-3.3 0-2.2-1.4-3.3-3.3-3.3h-1.3v1.7c0 1.8-1.5 3.3-3.3 3.3H9.8c-1.5 0-2.7 1.2-2.7 2.7v1.7c0 2 1.9 2.3 5 2.3zm1.7-1.7a.8.8 0 110-1.6.8.8 0 010 1.6z" />
      </svg>
    );
  }

  // Flutter / Mobile
  if (n.includes('flutter') || n.includes('mobile')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 2L4 11.5l2.9 2.9L19.3 2H13.5zm0 9.7L8.7 16.5l4.8 4.8h5.8l-7.7-7.7 2.9-2.9 2.9 2.9L19.3 11.7h-5.8z" />
      </svg>
    );
  }

  // Database / MySQL / Postgres / Mongo / SQLite
  if (n.includes('database') || n.includes('sql') || n.includes('mysql') || n.includes('postgres') || n.includes('sqlite') || n.includes('mongo')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }

  // Git / GitHub
  if (n.includes('git') || n.includes('github')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }

  // Docker
  if (n.includes('docker')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 8h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm9 7c-.1-.7-.6-1.3-1.2-1.6l-.7-.4-.3.7c-.2.5-.2 1.1 0 1.6.4.1.8.2 1.2.3.4.1.8-.1 1-.6zm2.7.5c-.3-.2-.7-.4-1.1-.4-.2.4-.5.8-.9 1.1 1.2.3 2 .3 2-.7zm-1.7 2.2c-.3-.2-.7-.3-1.1-.3-.6.6-1.4.9-2.2.9H2.8c-.5 0-.9-.4-.9-.9 0-.4.3-.8.7-.9.5-.1 1.1-.2 1.6-.2 1.1 0 2.2.3 3.2.8.6-.5 1.4-.8 2.2-.8h4.5c.3 0 .6.1.9.2.4-.3.9-.5 1.4-.5 1.3 0 2.5.6 3.2 1.7.3 0 .6.1.9.2.6-.5 1.4-.8 2.2-.8.5 0 1 .1 1.5.3-.2-.5-.5-1-.9-1.3z" />
      </svg>
    );
  }

  // Security / Cyber / Shield
  if (n.includes('secur') || n.includes('cyber') || n.includes('shield')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  // Linux
  if (n.includes('linux')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a4 4 0 00-4 4v3a4 4 0 00.3 1.5C7.2 11.2 6 13 6 15c0 1.5.8 2.8 2 3.5V20a2 2 0 002 2h4a2 2 0 002-2v-1.5c1.2-.7 2-2 2-3.5 0-2-1.2-3.8-2.3-4.5.2-.5.3-1 .3-1.5V6a4 4 0 00-4-4zm-1.5 5a.8.8 0 110 1.5.8.8 0 010-1.5zm3 0a.8.8 0 110 1.5.8.8 0 010-1.5z" />
      </svg>
    );
  }

  // Java
  if (n.includes('java')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.8 17.5s-1.4.2-.6.8c1 .7 2.7.7 4.3.4 1.4-.2 3.5-.8 3.5-.8s.6.5-.4.7c-2.3.5-5.3.6-7.3-.2-.7-.3-.2-.8.5-.9zm.4-2.1s-1.8.3-.9 1c1.2.9 3.2.7 5.2.4 1.7-.2 3.9-.9 3.9-.9s.4.5-.4.7c-2.6.7-6.2.7-8.5-.3-.9-.4-.3-.8.7-.9zm3.5-5.2c.7.8.6 1.5-.2 2.3-1.2 1.2-1.8 1.8-3.4 2.8-.7.4-1.5.8-2 .9 0 0 1.1-.6 1.8-1 1.5-.9 2.4-1.6 3.1-2.6.6-.9.4-1.7-.3-2.4-.7-.7-.8-1.5-.1-2.4.1-.1.2.2.1.4-.3.7-.1 1.3 1 2zm6.2 9.5c.2.2-.2.4-.4.5-1.5.6-3.7.8-6.1.8-2.8 0-5.4-.5-6.8-1.4-.4-.3.1-.6.5-.5 2 .4 4.5.6 6.7.5 2.1 0 4.5-.3 6.1-.9z" />
      </svg>
    );
  }

  // Vue
  if (n.includes('vue')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 3h3.5L12 14.5 18.5 3H22L12 21 2 3zm4.5 0h3L12 7.5 14.5 3h3L12 12 6.5 3z" />
      </svg>
    );
  }

  // AWS / Cloud / Google Cloud / Render / Vercel / Netlify
  if (n.includes('cloud') || n.includes('aws') || n.includes('render') || n.includes('vercel') || n.includes('netlify')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    );
  }

  // Terminal / CLI / Bash
  if (n.includes('terminal') || n.includes('bash') || n.includes('cli')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    );
  }

  // AI / ML / Bot / Robot
  if (n.includes('ai') || n.includes('ml') || n.includes('bot')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8.01" y2="16" />
        <line x1="16" y1="16" x2="16.01" y2="16" />
      </svg>
    );
  }

  // Default: Code / Bracket Icon
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
