import React, { useState } from 'react';
import type { SiteSettings, SocialLink } from '../lib/data';
import haptic from '../lib/haptics';

interface VirtualBusinessCardProps {
  settings: SiteSettings;
  socialLinks?: SocialLink[];
}

export default function VirtualBusinessCard({ settings }: VirtualBusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFlip = () => {
    haptic.tap();
    setIsFlipped((prev) => !prev);
  };

  const phone = '+63 939 2975 684';
  const cleanPhone = '+639392975684';
  const address = '156 Brgy. Kan. Bukal, Liliw, Laguna, Philippines';
  const website = 'crischarles.com';

  // Generate and download standard RFC 6350 vCard (.vcf)
  const downloadVCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptic.tap();

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Cris Charles V. Garcia',
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
      title: 'Cris Charles V. Garcia — GTECH Business Card',
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* ─── 3D Perspective Business Card ─── */}
      <div
        className="w-full max-w-[500px] perspective-1200 cursor-pointer select-none group"
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Business Card for Cris Charles Garcia. Currently showing ${isFlipped ? 'back side (GTECH)' : 'front side (Contact details)'}. Tap or press Enter to flip.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        <div
          className="relative w-full aspect-[1.70/1] rounded-2xl transition-transform duration-700 ease-out preserve-3d shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ══════════════════════════════════════════════════
              CARD FRONT: Real Business Card
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-border-custom bg-[#23272f]"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Front Card Artwork */}
            <img
              src="/images/card-front.jpg"
              alt="Cris Charles V. Garcia — Computer Hardware Technician"
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />

            {/* Clickable interactive hotspots overlay for immediate actions */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Phone Tap Target */}
              <a
                href={`tel:${cleanPhone}`}
                onClick={(e) => e.stopPropagation()}
                title="Call phone number"
                className="pointer-events-auto absolute left-[5%] top-[42%] w-[50%] h-[16%] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={`Call ${phone}`}
              />

              {/* Website Tap Target */}
              <a
                href="https://crischarles.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open portfolio"
                className="pointer-events-auto absolute left-[5%] top-[58%] w-[50%] h-[16%] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={`Visit website ${website}`}
              />

              {/* Location Tap Target */}
              <a
                href="https://maps.google.com/?q=Liliw,+Laguna,+Philippines"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open location in Google Maps"
                className="pointer-events-auto absolute left-[5%] top-[74%] w-[50%] h-[20%] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={`Location: ${address}`}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              CARD BACK: Real Business Card (GTECH Branding)
             ══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-border-custom bg-[#1a1f26]"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Back Card Artwork */}
            <img
              src="/images/card-back.png"
              alt="GTECH — gtech.com.ph"
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />

            {/* Website Overlay Link */}
            <a
              href="https://crischarles.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Visit website"
              className="absolute right-[12%] bottom-[32%] w-[35%] h-[16%] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Visit GTECH Website"
            />
          </div>
        </div>
      </div>

      {/* ─── Flip Prompt / Hint ─── */}
      <div className="mt-4 flex items-center justify-center">
        <button
          type="button"
          onClick={toggleFlip}
          className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-all inline-flex items-center gap-1.5 cursor-pointer py-1.5 px-3.5 rounded-full border border-border-custom hover:border-border-strong bg-card-custom shadow-xs active:scale-95"
        >
          <span>{isFlipped ? 'Show Contact Details' : 'Flip to GTECH Brand'}</span>
          <span aria-hidden="true" className="text-sm">⟲</span>
        </button>
      </div>

      {/* ─── Primary Direct Actions (Save Contact, Call, Portfolio) ─── */}
      <div className="w-full max-w-[500px] grid grid-cols-3 gap-2.5 mt-5">
        <button
          type="button"
          onClick={downloadVCard}
          className="bryl-btn-primary justify-center text-center text-xs py-2.5 cursor-pointer shadow-xs"
          title="Save contact (.vcf) directly to phone contacts"
        >
          <span>Save Contact</span>
          <span className="text-[11px]" aria-hidden="true">↓</span>
        </button>

        <a
          href={`tel:${cleanPhone}`}
          className="bryl-btn-secondary justify-center text-center text-xs py-2.5 cursor-pointer shadow-xs"
          title="Call phone number"
        >
          <span>Call Now</span>
          <span className="text-[11px]" aria-hidden="true">✆</span>
        </a>

        <button
          type="button"
          onClick={handleShare}
          className="bryl-btn-secondary justify-center text-center text-xs py-2.5 cursor-pointer shadow-xs"
          title="Share digital business card"
        >
          <span>{copied ? 'Copied!' : 'Share'}</span>
          <span className="text-[11px]" aria-hidden="true">{copied ? '✓' : '↗'}</span>
        </button>
      </div>

      {/* ─── Direct Portfolio Link ─── */}
      <div className="mt-4 text-center">
        <a
          href="https://crischarles.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom hover:underline transition-colors inline-flex items-center gap-1"
        >
          <span>View Flagship Portfolio</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}
