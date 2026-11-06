import React, { useState } from 'react';
import type { SiteSettings, SocialLink } from '../lib/data';
import haptic from '../lib/haptics';

interface VirtualBusinessCardProps {
  settings: SiteSettings;
  avatarSrc?: string;
  socialLinks?: SocialLink[];
}

export default function VirtualBusinessCard({ settings, avatarSrc }: VirtualBusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFlip = () => {
    haptic.tap();
    setIsFlipped((prev) => !prev);
  };

  const phone = '+63 991 497 0689';
  const cleanPhone = '+639914970689';
  const email = settings.email || 'crischarlesgarcia345@gmail.com';
  const website = 'crischarles.com';
  const location = 'Laguna, Philippines';
  const title = settings.title ? settings.title.split('|')[0].trim() : 'Software Developer';

  const downloadVCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptic.tap();

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Cris Charles Garcia',
      'N:Garcia;Cris Charles;;;',
      `TITLE:${title}`,
      'ORG:Cris Charles Garcia',
      `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
      `EMAIL;TYPE=INTERNET,WORK:${email}`,
      'URL;TYPE=WORK:https://crischarles.com',
      'URL;TYPE=CARD:https://card.crischarles.com',
      'ADR;TYPE=WORK:;;Liliw;Laguna;4004;Philippines',
      'NOTE:Full-Stack Software Developer & Systems Specialist',
      'END:VCARD',
    ];

    const blob = new Blob([vCardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Cris-Charles-Garcia.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptic.tap();
    const shareUrl = 'https://card.crischarles.com';
    const shareData = {
      title: `${settings.fullName} — Digital Business Card`,
      text: `${settings.fullName} | ${title}`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // fallback
    }
  };

  const resolvedAvatar = avatarSrc || settings.heroImage || '/assets/pp-day.webp';

  return (
    <div className="w-full flex flex-col items-center">
      {/* ─── 3D Perspective Physical Business Card ─── */}
      <div
        className="w-full max-w-[480px] perspective-1200 cursor-pointer select-none group"
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Business Card for Cris Charles Garcia. Showing ${isFlipped ? 'back face' : 'front face'}. Tap to flip.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        <div
          className="relative w-full aspect-[1.75/1] rounded-2xl transition-transform duration-750 ease-out preserve-3d shadow-xl hover:shadow-2xl"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ══════════════════════════════════════════════════
              CARD FRONT: Executive Matte Architectural Card
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-white/15 dark:border-white/10 bg-[#0e121a] text-zinc-100 p-5 sm:p-6 flex flex-col justify-between shadow-inner"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Ambient Background Grid / Subtle Shading */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#38bdf8_0.6px,transparent_0.6px)] [background-size:16px_16px]" />
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            {/* Top Bar: Monogram Badge & Micro Identifier */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-xs font-mono font-bold text-white shadow-xs">
                  CC
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Garcia // Studio
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-400">
                01 · PASS
              </span>
            </div>

            {/* Middle Section: Name, Role & Status Indicator */}
            <div className="relative z-10 my-auto">
              <h2 className="text-lg sm:text-2xl font-bold font-display tracking-tight text-white leading-tight">
                {settings.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs sm:text-sm font-mono text-zinc-300 tracking-tight">
                  {title}
                </p>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-0.5">
                Full-Stack Systems · Mobile · Cloud Architecture
              </p>
            </div>

            {/* Bottom Row: Direct Contact Endpoints & Mini Portrait Badge */}
            <div className="relative z-10 pt-2 border-t border-zinc-800/80 flex items-end justify-between gap-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 truncate"
                >
                  <span className="text-zinc-500">T:</span>
                  <span className="truncate">{phone}</span>
                </a>
                <a
                  href="https://crischarles.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 truncate"
                >
                  <span className="text-zinc-500">W:</span>
                  <span className="truncate">{website}</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 truncate"
                >
                  <span className="text-zinc-500">M:</span>
                  <span className="truncate">{email}</span>
                </a>
                <span className="text-zinc-400 flex items-center gap-1.5 truncate">
                  <span className="text-zinc-500">L:</span>
                  <span className="truncate">{location}</span>
                </span>
              </div>

              {/* Verified Avatar Seal */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-800 shrink-0 shadow-sm">
                <img
                  src={resolvedAvatar}
                  alt={settings.fullName}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              CARD BACK: Minimalist Architectural Reverse
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-white/15 dark:border-white/10 bg-[#090c12] text-zinc-100 p-5 sm:p-6 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Corner Crosshair Registration Marks */}
            <span className="absolute top-3 left-3 text-zinc-600 font-mono text-[9px] pointer-events-none">+</span>
            <span className="absolute top-3 right-3 text-zinc-600 font-mono text-[9px] pointer-events-none">+</span>
            <span className="absolute bottom-3 left-3 text-zinc-600 font-mono text-[9px] pointer-events-none">+</span>
            <span className="absolute bottom-3 right-3 text-zinc-600 font-mono text-[9px] pointer-events-none">+</span>

            {/* Subtle Line Accents */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent pointer-events-none" />

            {/* Top Micro Label */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>CRIS CHARLES GARCIA</span>
              <span>EST. 2024</span>
            </div>

            {/* Center Monogram Geometric Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-zinc-700 bg-zinc-900/80 flex items-center justify-center mb-2.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-widest text-white">
                  CCG
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono font-medium text-zinc-200 tracking-wider uppercase">
                Software & Systems
              </p>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5 tracking-tight">
                High-Performance Digital Products
              </p>
            </div>

            {/* Bottom Meta Bar */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
              <span>14.1378° N, 121.4338° E</span>
              <span className="text-zinc-400 hover:text-white transition-colors">{website}</span>
              <span className="text-zinc-400">TAP TO FLIP ⟲</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Responsive Quick Action Buttons (1 to 2 word labels) ─── */}
      <div className="w-full max-w-[480px] grid grid-cols-3 gap-2 sm:gap-2.5 mt-4">
        <button
          type="button"
          onClick={toggleFlip}
          className="bryl-btn-secondary w-full justify-center text-center text-xs py-2 px-2.5 cursor-pointer shadow-xs active:scale-95"
          title="Flip to back side"
        >
          <span>Flip</span>
          <span aria-hidden="true" className="text-xs">⟲</span>
        </button>

        <button
          type="button"
          onClick={downloadVCard}
          className="bryl-btn-primary w-full justify-center text-center text-xs py-2 px-2.5 cursor-pointer shadow-xs active:scale-95"
          title="Save contact (.vcf) file"
        >
          <span>Save vCard</span>
          <span aria-hidden="true" className="text-[11px]">↓</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="bryl-btn-secondary w-full justify-center text-center text-xs py-2 px-2.5 cursor-pointer shadow-xs active:scale-95"
          title="Share digital business card"
        >
          <span>{copied ? 'Copied' : 'Share'}</span>
          <span aria-hidden="true" className="text-[11px]">{copied ? '✓' : '↗'}</span>
        </button>
      </div>
    </div>
  );
}
