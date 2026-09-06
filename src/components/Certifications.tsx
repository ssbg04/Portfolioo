import React, { useState, useEffect, useRef } from 'react';
import ScrollReveal from './ScrollReveal';
import { mockCertifications, type Certification } from '../lib/data';
import haptic from '../lib/haptics';

interface Props {
  certifications?: Certification[];
  extraCerts?: Certification[];
}

export default function Certifications({ certifications, extraCerts = [] }: Props) {
  const baseCerts = (certifications && certifications.length > 0) ? certifications : mockCertifications;
  const allCerts = [...baseCerts, ...extraCerts];
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  // Zoom & Drag Lightbox State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
        } else if (selectedCert) {
          setSelectedCert(null);
        }
      }
      if (isZoomOpen) {
        if (e.key === '+' || e.key === '=') {
          setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 4));
        } else if (e.key === '-' || e.key === '_') {
          setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.75));
        } else if (e.key === '0') {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
      }
    };

    if (selectedCert || isZoomOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCert, isZoomOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setPan({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.75), 4);
      return Number(next.toFixed(2));
    });
  };

  const getVerifyButtonLabel = (cert: Certification) => {
    if (!cert.badgeUrl) return 'Verify Credential ↗';
    if (cert.badgeUrl.includes('credly.com')) return 'Verify on Credly ↗';
    if (cert.issuer) return `Verify on ${cert.issuer} ↗`;
    return 'Verify Credential ↗';
  };

  return (
    <section id="certifications" className="pt-6 sm:pt-10 pb-16 sm:pb-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                03 // Certifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Verified Credentials &amp; Certifications
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Digitally verified credentials and certificates issued through Cisco, NC2, and industry programs.
            </p>
          </div>
        </ScrollReveal>

        {/* ─── Certificate & Badge Cards Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCerts.map((cert, idx) => (
            <ScrollReveal key={cert.id || idx} variant="fade-up" delay={idx * 50} className="h-full">
              <div
                onClick={() => {
                  haptic.openModal();
                  setSelectedCert(cert);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCert(cert); }}
                aria-label={`View full certificate details for ${cert.title}`}
                className="bento-card p-5 sm:p-6 flex flex-col justify-between items-center text-center h-full group cursor-pointer hover:border-primary-custom/40 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
              >
                <div className="w-full flex flex-col items-center">
                  {/* Top Bar: Badge/Cert Code & Issuing Org */}
                  <div className="w-full flex items-center justify-between pb-3 border-b border-border-custom text-xs">
                    <span className="text-[10px] font-mono text-muted-foreground-custom font-medium">
                      #{cert.code}
                    </span>
                    <span className="text-[10px] font-mono text-primary-custom font-semibold">
                      {cert.issuer}
                    </span>
                  </div>

                  {/* Large Picture / Certificate Document Preview Container */}
                  <div className="w-full h-44 sm:h-48 my-3 rounded-2xl bg-foreground-custom/[0.02] border border-border-custom/60 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-primary-custom/30 transition-all">
                    {cert.badgeImage ? (
                      <img
                        src={cert.badgeImage}
                        alt={cert.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain rounded-lg drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const parent = (e.currentTarget as HTMLElement).parentElement;
                          if (parent) {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = parent.querySelector('.cert-fallback-icon');
                            if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    <div className={`cert-fallback-icon w-16 h-16 rounded-2xl bg-primary-custom/10 flex items-center justify-center text-primary-custom ${cert.badgeImage ? 'hidden' : ''}`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                    </div>

                    {/* Subtle Preview Indicator overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-medium rounded-2xl backdrop-blur-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      <span>Preview</span>
                    </div>
                  </div>

                  {/* Title Only */}
                  <h3 className="text-sm sm:text-base font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors leading-snug line-clamp-2 px-1">
                    {cert.title}
                  </h3>
                </div>

                {/* Subtle Click Indicator Pill */}
                <div className="pt-3.5 mt-3 border-t border-border-custom/60 w-full flex items-center justify-center text-[10px] font-mono text-muted-foreground-custom group-hover:text-primary-custom transition-colors">
                  <span>Click to preview full certificate</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ─── Full Certificate & Badge Detail Modal (Large Preview) ─── */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-modal-fade"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl sm:max-w-3xl bento-card p-6 sm:p-8 bg-white dark:bg-[#0f111a] border border-border-custom rounded-3xl shadow-2xl flex flex-col gap-4 text-foreground-custom max-h-[90vh] overflow-y-auto animate-modal-scale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button in Top Right */}
            <button
              onClick={() => {
                haptic.tap();
                setSelectedCert(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-foreground-custom/5 hover:bg-foreground-custom/15 text-foreground-custom flex items-center justify-center transition-colors cursor-pointer border border-border-custom z-10"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Clickable Large Certificate / Badge Viewport (Launches Zoom & Drag Modal) */}
            <div
              onClick={() => {
                if (selectedCert.badgeImage) {
                  haptic.tap();
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setIsZoomOpen(true);
                }
              }}
              className="w-full max-h-[50vh] flex items-center justify-center bg-foreground-custom/[0.02] dark:bg-black/40 rounded-2xl border border-border-custom/70 p-3 sm:p-4 overflow-hidden shadow-inner relative group/preview cursor-zoom-in"
              title="Click to open zoom and drag lightbox"
            >
              {selectedCert.badgeImage ? (
                <img
                  src={selectedCert.badgeImage}
                  alt={selectedCert.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[46vh] w-auto max-w-full object-contain rounded-lg drop-shadow-md transition-transform duration-300 group-hover/preview:scale-[1.02]"
                />
              ) : null}

              {/* Zoom & Drag Callout Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white text-xs font-mono font-medium backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg opacity-85 group-hover/preview:opacity-100 transition-all">
                <svg className="w-3.5 h-3.5 text-primary-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                </svg>
                <span>Click to Zoom &amp; Drag</span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  VERIFIED CREDENTIAL
                </span>
                <span className="text-[10px] font-mono text-muted-foreground-custom px-2.5 py-0.5 rounded-full bg-foreground-custom/5 border border-border-custom">
                  Code: #{selectedCert.code}
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-bold font-heading text-foreground-custom leading-tight">
                {selectedCert.title}
              </h3>

              <p className="text-xs font-mono text-primary-custom font-medium">
                Issued by {selectedCert.issuer}
                {selectedCert.issueDate ? ` • ${selectedCert.issueDate}` : ''}
              </p>
            </div>

            {/* Full Description */}
            {selectedCert.description && (
              <div className="p-4 rounded-2xl bg-foreground-custom/[0.03] border border-border-custom text-xs sm:text-sm text-foreground-custom/90 leading-relaxed">
                {selectedCert.description}
              </div>
            )}

            {/* Validated Skills / Competencies */}
            {selectedCert.skills && selectedCert.skills.length > 0 && (
              <div>
                <p className="text-[11px] font-mono text-muted-foreground-custom uppercase tracking-wider mb-2 font-semibold">
                  Validated Competencies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCert.skills.map((s) => (
                    <span key={s} className="tech-tag text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-border-custom flex items-center gap-3">
              {selectedCert.badgeUrl && (
                <a
                  href={selectedCert.badgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary-custom text-white font-semibold text-xs text-center hover:bg-primary-custom/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {getVerifyButtonLabel(selectedCert)}
                </a>
              )}
              <button
                onClick={() => {
                  haptic.tap();
                  setSelectedCert(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-border-custom text-xs font-semibold text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Fullscreen Zoom & Drag Lightbox Modal ─── */}
      {isZoomOpen && selectedCert?.badgeImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none animate-modal-fade"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Bar: Certificate Title, Issuer & Close Button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {selectedCert.issuer} • #{selectedCert.code}
              </span>
              <h4 className="text-sm sm:text-base font-bold truncate text-zinc-100 mt-0.5">
                {selectedCert.title}
              </h4>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline text-[11px] font-mono text-zinc-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px] border border-white/15">ESC</kbd> to exit
              </span>
              <button
                onClick={() => {
                  haptic.tap();
                  setIsZoomOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                aria-label="Close zoom viewer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Interactive Zoom & Drag Canvas Viewport */}
          <div
            className="w-full flex-1 flex items-center justify-center relative overflow-hidden my-2 cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => {
              haptic.tap();
              if (zoom > 1) {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              } else {
                setZoom(2);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedCert.badgeImage}
              alt={selectedCert.title}
              referrerPolicy="no-referrer"
              draggable={false}
              className="max-w-[90vw] max-h-[75vh] object-contain drop-shadow-2xl pointer-events-none rounded-lg"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.12s ease-out',
              }}
            />
          </div>

          {/* Floating Bottom Control Bar */}
          <div
            className="shrink-0 z-10 flex flex-col items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-white/15 backdrop-blur-xl shadow-2xl text-white">
              {/* Zoom Out Button */}
              <button
                onClick={() => {
                  haptic.tap();
                  setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.75));
                }}
                disabled={zoom <= 0.75}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                aria-label="Zoom out"
                title="Zoom Out (-)"
              >
                −
              </button>

              {/* Zoom Level Indicator */}
              <span className="text-xs font-mono font-semibold min-w-[3.5rem] text-center text-zinc-200">
                {Math.round(zoom * 100)}%
              </span>

              {/* Zoom In Button */}
              <button
                onClick={() => {
                  haptic.tap();
                  setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 4));
                }}
                disabled={zoom >= 4}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                aria-label="Zoom in"
                title="Zoom In (+)"
              >
                +
              </button>

              {/* Separator */}
              <div className="w-px h-4 bg-white/20 mx-1" />

              {/* Reset Viewport Button */}
              <button
                onClick={() => {
                  haptic.tap();
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 text-zinc-300 hover:text-white"
                title="Reset zoom & position (0)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[10px] font-mono text-zinc-400 text-center">
              Drag to pan • Mouse wheel or double click to zoom
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
