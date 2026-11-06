import React, { useState } from 'react';
import type { SiteSettings, SocialLink, Skill } from '../lib/data';
import haptic from '../lib/haptics';

interface VirtualBusinessCardProps {
  settings: SiteSettings;
  socialLinks: SocialLink[];
  skills?: Skill[];
  qrCodeDataUrl: string;
}

export default function VirtualBusinessCard({
  settings,
  socialLinks = [],
  skills = [],
  qrCodeDataUrl,
}: VirtualBusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFlip = () => {
    haptic.tap();
    setIsFlipped((prev) => !prev);
  };

  // Generate and download a standard RFC 6350 vCard (.vcf)
  const downloadVCard = () => {
    haptic.tap();
    const nameParts = (settings.fullName || 'Cris Charles Garcia').split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const firstName = nameParts.slice(0, nameParts.length - 1).join(' ') || settings.fullName;

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${settings.fullName}`,
      `N:${lastName};${firstName};;;`,
      `TITLE:${settings.title || 'Software Developer'}`,
      `EMAIL;TYPE=INTERNET,WORK:${settings.email}`,
      'URL:https://crischarles.com',
      'URL;TYPE=CARD:https://card.crischarles.com',
      `ADR;TYPE=WORK:;;;${settings.location || 'Laguna'};;Philippines`,
      `NOTE:${settings.valueProposition || 'Software Developer specializing in web, mobile, and information systems.'}`,
      'END:VCARD',
    ];

    const blob = new Blob([vCardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(settings.fullName || 'Cris-Charles-Garcia').replace(/\s+/g, '-')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Native mobile share sheet or clipboard copy fallback
  const handleShare = async () => {
    haptic.tap();
    const shareUrl = 'https://card.crischarles.com';
    const shareData = {
      title: `${settings.fullName} — Digital Business Card`,
      text: `${settings.fullName} | ${settings.title}`,
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

  const topSkills = skills.slice(0, 6);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ─── 3D Perspective Card Wrapper ─── */}
      <div
        className="w-full max-w-[440px] perspective-1200 cursor-pointer select-none group"
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Virtual business card for ${settings.fullName}. Currently showing ${isFlipped ? 'back side' : 'front side'}. Tap or press Enter to flip.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        <div
          className="relative w-full aspect-[1.62/1] rounded-2xl transition-transform duration-700 ease-out preserve-3d"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ══════════════════════════════════════════════════
              CARD FRONT SIDE
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden border border-border-custom bg-card-custom shadow-xl hover:border-foreground-custom/40 transition-colors"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Background Halftone Watermark */}
            <div className="absolute -top-8 -right-8 w-36 h-36 halftone-bg opacity-35 pointer-events-none rounded-full mask-radial" />

            {/* Top Bar: Contactless Chip & Availability Pill */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Technical Contactless & Chip Icon */}
              <div className="flex items-center gap-2 text-foreground-custom/80">
                <div className="w-7 h-5 rounded-sm border border-border-strong bg-elevated-custom flex items-center justify-center p-0.5 shadow-2xs">
                  <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 border border-border-custom opacity-70">
                    <span className="border-r border-b border-border-custom" />
                    <span className="border-b border-border-custom" />
                    <span className="border-r border-border-custom" />
                    <span />
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M8.5 16.5a6 6 0 0 1 0-9M12 19a10 10 0 0 0 0-14M15.5 21.5a14 14 0 0 0 0-19" />
                </svg>
              </div>

              {/* Availability Status */}
              {settings.isAvailable !== false && (
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border border-border-custom bg-foreground-custom/[0.04] text-foreground-custom inline-flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground-custom animate-pulse opacity-85" />
                  <span>{settings.availabilityStatus || 'Available for Work'}</span>
                </span>
              )}
            </div>

            {/* Middle: Profile Identity */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 my-auto">
              {settings.heroImage && (
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-border-custom p-0.5 bg-card-custom shrink-0 shadow-sm">
                  <img
                    src={settings.heroImage}
                    alt={settings.fullName}
                    className="w-full h-full object-cover rounded-[10px]"
                    loading="eager"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground-custom tracking-tight leading-tight truncate">
                  {settings.fullName}
                </h2>
                <p className="text-[11px] sm:text-xs font-mono text-muted-foreground-custom mt-0.5 truncate">
                  {settings.title ? settings.title.split('|')[0].trim() : 'Software Developer'}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-subtle-custom mt-1">
                  {settings.location || 'Laguna, Philippines · UTC+8'}
                </p>
              </div>
            </div>

            {/* Bottom Bar: Direct Email & Tap to Flip Prompt */}
            <div className="relative z-10 pt-2.5 border-t border-border-custom flex items-center justify-between text-[10px] font-mono text-muted-foreground-custom">
              <span className="truncate max-w-[200px]">{settings.email}</span>
              <span className="inline-flex items-center gap-1 text-foreground-custom font-medium group-hover:underline shrink-0">
                <span>Tap to flip</span>
                <span aria-hidden="true">⟲</span>
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              CARD BACK SIDE (180deg)
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden border border-border-custom bg-card-custom shadow-xl hover:border-foreground-custom/40 transition-colors"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Bar: Card Identity & QR scan note */}
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground-custom" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-custom font-semibold">
                  Direct Connect // QR
                </span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground-custom">
                Scan with camera
              </span>
            </div>

            {/* Middle: High-Res QR Code + Verified Stack */}
            <div className="flex items-center gap-4 sm:gap-5 my-auto">
              {/* Offline-Generated QR Code */}
              <div className="p-1 rounded-xl bg-white border border-border-custom shrink-0 shadow-xs">
                <img
                  src={qrCodeDataUrl}
                  alt="Scan to open digital business card"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain rounded-lg"
                  loading="eager"
                />
              </div>

              {/* Verified Stack / Core Skills */}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-subtle-custom block mb-1.5">
                  Core Expertise:
                </span>
                <div className="flex flex-wrap gap-1">
                  {topSkills.length > 0 ? (
                    topSkills.map((s) => (
                      <span key={s.name} className="tech-tag text-[9px] py-0.5 px-1.5">
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="tech-tag text-[9px] py-0.5 px-1.5">Flutter</span>
                      <span className="tech-tag text-[9px] py-0.5 px-1.5">React</span>
                      <span className="tech-tag text-[9px] py-0.5 px-1.5">TypeScript</span>
                      <span className="tech-tag text-[9px] py-0.5 px-1.5">Node.js</span>
                      <span className="tech-tag text-[9px] py-0.5 px-1.5">SQLite</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Subdomain URL & Flip Back Hint */}
            <div className="pt-2.5 border-t border-border-custom flex items-center justify-between text-[10px] font-mono text-muted-foreground-custom">
              <span className="text-foreground-custom font-semibold">card.crischarles.com</span>
              <span className="inline-flex items-center gap-1 text-foreground-custom font-medium group-hover:underline shrink-0">
                <span>Flip back</span>
                <span aria-hidden="true">⟲</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Flipping Prompt Button ─── */}
      <div className="mt-3 flex items-center justify-center">
        <button
          type="button"
          onClick={toggleFlip}
          className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-full border border-border-custom hover:border-border-strong bg-card-custom shadow-2xs"
        >
          <span>{isFlipped ? 'Show Front Side' : 'Flip to View QR Code'}</span>
          <span aria-hidden="true" className="text-sm">⟲</span>
        </button>
      </div>

      {/* ─── Primary Quick Actions Bar (vCard, Share, Portfolio) ─── */}
      <div className="w-full max-w-[440px] grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
        <button
          type="button"
          onClick={downloadVCard}
          className="bryl-btn-primary justify-center text-center text-xs py-2.5 cursor-pointer shadow-xs col-span-1"
          title="Save contact (.vcf) directly to phone contacts"
        >
          <span>Save Contact</span>
          <span className="text-[11px]" aria-hidden="true">↓</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="bryl-btn-secondary justify-center text-center text-xs py-2.5 cursor-pointer shadow-xs col-span-1"
          title="Share digital business card"
        >
          <span>{copied ? 'Link Copied!' : 'Share Card'}</span>
          <span className="text-[11px]" aria-hidden="true">{copied ? '✓' : '↗'}</span>
        </button>

        <a
          href="https://crischarles.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bryl-btn-secondary justify-center text-center text-xs py-2.5 cursor-pointer shadow-xs col-span-2 sm:col-span-1"
        >
          <span>Portfolio</span>
          <span className="text-[11px]" aria-hidden="true">↗</span>
        </a>
      </div>

      {/* ─── Directory of Official Verified Channels ─── */}
      <div className="w-full max-w-[440px] mt-8">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-custom">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
            Official Channels
          </span>
          <span className="text-[10px] font-mono text-subtle-custom">
            {socialLinks.length} verified
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="bryl-card p-3 sm:p-3.5 flex items-center justify-between group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-foreground-custom/40 group-hover:bg-foreground-custom transition-colors shrink-0" />
                <span className="text-xs font-mono font-semibold text-foreground-custom group-hover:underline truncate">
                  {link.platform}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground-custom group-hover:text-foreground-custom group-hover:translate-x-0.5 transition-all shrink-0">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
