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
  const addressLine1 = 'Liliw, Laguna';
  const addressLine2 = 'Region IV-A CALABARZON, Philippines';
  const website = 'crischarles.com';

  const downloadVCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptic.tap();

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Garcia, Cris Charles V.',
      'N:Garcia;Cris Charles;V.;;',
      'TITLE:Computer Hardware Technician / Software Developer',
      'ORG:GTECH',
      `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
      `EMAIL;TYPE=INTERNET,WORK:${settings.email || 'crischarlesgarcia345@gmail.com'}`,
      'URL;TYPE=WORK:https://crischarles.com',
      'URL;TYPE=CARD:https://card.crischarles.com',
      `ADR;TYPE=WORK:;;156 Brgy. Kan. Bukal;Liliw;Laguna;4004;Philippines`,
      'NOTE:GTECH Computer Hardware & Software Solutions',
      'END:VCARD',
    ];

    const blob = new Blob([vCardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Cris-Charles-Garcia-GTECH.vcf';
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
      title: 'Garcia, Cris Charles V. — GTECH Business Card',
      text: 'Cris Charles V. Garcia | Computer Hardware Technician & Developer',
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
      {/* ─── 3D Perspective Business Card ─── */}
      <div
        className="w-full max-w-[480px] perspective-1200 cursor-pointer select-none group"
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Real Business Card for Cris Charles Garcia. Currently showing ${isFlipped ? 'back side (GTECH branding)' : 'front side (Contact information)'}. Tap or press Enter to flip.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        <div
          className="relative w-full aspect-[1.70/1] rounded-2xl transition-transform duration-700 ease-out preserve-3d shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ══════════════════════════════════════════════════
              CARD FRONT: Native Recreated Business Card
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-[#3b4252] bg-[#242933] text-white p-4 sm:p-5 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* ── Top Left: Name, Title & Teal Divider ── */}
            <div className="relative z-10 max-w-[62%]">
              <h2 className="text-base sm:text-lg font-bold font-heading tracking-tight leading-tight text-white drop-shadow-xs">
                Garcia, Cris Charles V.
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-300 font-sans mt-0.5 font-normal tracking-wide">
                {settings.title ? settings.title.split('|')[0].trim() : 'Computer Hardware Technician'}
              </p>
              {/* Teal Accent Bar */}
              <div className="w-10 sm:w-12 h-1 bg-teal-500 rounded-full mt-1.5 sm:mt-2 mb-2 sm:mb-2.5" />

              {/* ── Contact Details List with Teal Badges ── */}
              <div className="flex flex-col gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-sans">
                {/* Phone */}
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-gray-200 hover:text-teal-300 transition-colors group/item"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  </div>
                  <span className="font-medium tracking-tight truncate">{phone}</span>
                </a>

                {/* Web Domain */}
                <a
                  href="https://crischarles.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-gray-200 hover:text-teal-300 transition-colors group/item"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  </div>
                  <span className="font-medium tracking-tight truncate">{website}</span>
                </a>

                {/* Location / Address */}
                <a
                  href="https://maps.google.com/?q=Liliw,+Laguna,+Philippines"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-start gap-2 text-gray-200 hover:text-teal-300 transition-colors group/item leading-tight"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-[9px] sm:text-[10px] text-gray-300">
                    <span className="truncate">{addressLine1}</span>
                    <span className="truncate opacity-80">{addressLine2}</span>
                  </div>
                </a>
              </div>
            </div>

            {/* ── Right Side Artwork: Isometric Laptop Graphic ── */}
            <div className="absolute top-[8%] right-[8%] w-[48%] h-[75%] pointer-events-none opacity-85">
              <svg className="w-full h-full" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Isometric Laptop Screen */}
                <path d="M180 20L280 60V150L180 110Z" fill="#38bdf8" fillOpacity="0.4" stroke="#7dd3fc" strokeWidth="2" />
                <path d="M176 16L284 58V154L176 112Z" stroke="#475569" strokeWidth="4" />
                {/* Isometric Laptop Base / Keyboard Deck */}
                <path d="M180 110L280 150L140 210L40 170Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
                {/* Trackpad */}
                <path d="M110 180L140 193L130 198L100 185Z" fill="#94a3b8" />
                {/* Keyboard Grid */}
                <path d="M80 148L190 125L235 142L125 174Z" fill="#334155" />
                {/* Keyboard Lines */}
                <path d="M95 144L200 128M105 152L210 134M115 160L220 140" stroke="#64748b" strokeWidth="1.5" />
                <path d="M110 140L140 168M135 135L165 163M160 130L190 158M185 125L215 153" stroke="#64748b" strokeWidth="1" />
              </svg>
            </div>

            {/* ── Bottom Right Corner: Cutout Portrait Photo ── */}
            <div className="absolute -bottom-1 -right-1 w-24 sm:w-28 md:w-32 aspect-square pointer-events-none">
              <img
                src={resolvedAvatar}
                alt={settings.fullName}
                className="w-full h-full object-cover object-top rounded-tl-2xl rounded-br-2xl drop-shadow-md border-l border-t border-white/20"
                loading="eager"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              CARD BACK: Real Business Card (GTECH Branding)
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-[#3b4252] bg-[#1e232a] text-white p-4 sm:p-5 flex items-center justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Perspective Geometric Angle Panels */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top angled panel */}
              <div className="absolute top-0 inset-x-0 h-[24%] bg-[#181b21] [clip-path:polygon(0_0,100%_0,85%_100%,15%_100%)] border-b border-[#333b47]" />
              {/* Center angled desk plane */}
              <div className="absolute top-[24%] bottom-[24%] inset-x-0 bg-[#353d49] border-y border-[#444d5c]" />
              {/* Bottom angled panel */}
              <div className="absolute bottom-0 inset-x-0 h-[24%] bg-[#181b21] [clip-path:polygon(15%_0,85%_0,100%_100%,0_100%)] border-t border-[#333b47]" />
            </div>

            {/* Setup Illustration on Left */}
            <div className="relative z-10 w-[42%] h-[80%] flex items-center justify-center">
              <svg className="w-full h-full drop-shadow-md" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Desktop Monitor Screen */}
                <rect x="20" y="20" width="100" height="65" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="25" y="25" width="90" height="55" rx="2" fill="#1e293b" />
                {/* Globe Logo on Monitor */}
                <circle cx="70" cy="52" r="20" fill="#22c55e" fillOpacity="0.8" />
                <path d="M60 42H80M55 52H85M60 62H80" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="65" y="60" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif">G</text>
                {/* Monitor Stand */}
                <path d="M66 85H74V95H66Z" fill="#64748b" />
                <path d="M55 95H85V98H55Z" fill="#94a3b8" />
                {/* Keyboard */}
                <path d="M10 115L90 115L85 130L5 130Z" fill="#334155" stroke="#475569" strokeWidth="1" />
                <path d="M15 119H85M12 124H82" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
                {/* Laptop Open on Desk */}
                <path d="M95 65L145 78V125L95 112Z" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                <rect x="100" y="75" width="40" height="35" fill="#f8fafc" />
                <text x="112" y="100" fill="#1e293b" fontSize="18" fontWeight="bold" fontFamily="sans-serif">G</text>
                <path d="M95 112L145 125L130 145L80 132Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
              </svg>
            </div>

            {/* Right Side: Big Bold GTECH Branding */}
            <div className="relative z-10 w-[54%] flex flex-col items-center justify-center text-center pr-2">
              <h3 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-wider leading-none drop-shadow-md">
                GTECH
              </h3>
              <p className="text-xs sm:text-sm font-sans font-medium text-gray-300 mt-1.5 sm:mt-2 tracking-wide">
                gtech.com.ph
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Card Quick Actions (Under the card) ─── */}
      <div className="w-full max-w-[480px] flex items-center justify-between gap-2 mt-4 pt-1">
        <button
          type="button"
          onClick={toggleFlip}
          className="flex-1 bryl-btn-secondary justify-center text-center text-xs py-2 cursor-pointer shadow-xs active:scale-95"
        >
          <span>{isFlipped ? 'Show Front Side' : 'Flip to GTECH Brand'}</span>
          <span aria-hidden="true" className="text-xs">⟲</span>
        </button>

        <button
          type="button"
          onClick={downloadVCard}
          className="flex-1 bryl-btn-primary justify-center text-center text-xs py-2 cursor-pointer shadow-xs active:scale-95"
          title="Save contact (.vcf) directly to phone contacts"
        >
          <span>Save Contact</span>
          <span className="text-[11px]" aria-hidden="true">↓</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="bryl-btn-secondary px-3 py-2 text-xs cursor-pointer shadow-xs active:scale-95"
          title="Share digital business card link"
        >
          <span>{copied ? 'Copied' : 'Share'}</span>
          <span className="text-[11px]" aria-hidden="true">{copied ? '✓' : '↗'}</span>
        </button>
      </div>
    </div>
  );
}
