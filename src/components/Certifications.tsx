import React, { useState, useEffect, useRef } from 'react';
import ScrollReveal from './ScrollReveal';
import { mockCertifications, isDocumentCertificate, type Certification } from '../lib/data';
import haptic from '../lib/haptics';

interface Props {
  certifications?: Certification[];
  extraCerts?: Certification[];
}

type FilterMode = 'all' | 'certificates' | 'badges';

export default function Certifications({ certifications, extraCerts = [] }: Props) {
  const baseCerts = (certifications && certifications.length > 0) ? certifications : mockCertifications;
  const allCerts = [...baseCerts, ...extraCerts];

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  // Separate into Document Certificates and Digital Skill Badges
  const documentCerts = allCerts.filter(isDocumentCertificate);
  const skillBadges = allCerts.filter((c) => !isDocumentCertificate(c));

  // Zoom & Drag Lightbox State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  // Keyboard navigation, viewport lock & body scroll freeze
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

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewportContent = viewportMeta?.getAttribute('content') || 'width=device-width, initial-scale=1.0';

    if (selectedCert || isZoomOpen) {
      document.body.style.overflow = 'hidden';
      if (isZoomOpen) {
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.touchAction = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
        document.body.style.touchAction = 'none';
        document.body.style.overscrollBehavior = 'none';
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      if (viewportMeta) {
        viewportMeta.setAttribute('content', originalViewportContent);
      }
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      if (viewportMeta) {
        viewportMeta.setAttribute('content', originalViewportContent);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCert, isZoomOpen]);

  // Suppress iOS Safari and mobile browser default viewport pinch-zoom
  useEffect(() => {
    if (!isZoomOpen) return;

    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventMultiTouch, { passive: false });
    document.addEventListener('touchmove', preventMultiTouch, { passive: false });
    window.addEventListener('touchstart', preventMultiTouch, { passive: false });
    window.addEventListener('touchmove', preventMultiTouch, { passive: false });
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    window.addEventListener('gesturestart', preventGesture, { passive: false });
    window.addEventListener('gesturechange', preventGesture, { passive: false });
    window.addEventListener('gestureend', preventGesture, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventMultiTouch);
      document.removeEventListener('touchmove', preventMultiTouch);
      window.removeEventListener('touchstart', preventMultiTouch);
      window.removeEventListener('touchmove', preventMultiTouch);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, [isZoomOpen]);

  // Mobile Touch Gestures: Pinch-to-zoom & 1-finger pan on the canvas
  useEffect(() => {
    if (!isZoomOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let initialDist = 0;
    let initialZoom = 1;
    let initialPan = { x: 0, y: 0 };
    let startMid = { x: 0, y: 0 };
    let isPinching = false;
    let isTouching = false;
    let lastTapTime = 0;

    const getDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        // Double tap detection for quick 1x / 2x zoom
        const now = Date.now();
        if (now - lastTapTime < 300) {
          haptic.tap();
          if (zoomRef.current > 1) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          } else {
            setZoom(2);
          }
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;

        isTouching = true;
        isPinching = false;
        startMid = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPan = { ...panRef.current };
        setIsDragging(true);
      } else if (e.touches.length >= 2) {
        isPinching = true;
        isTouching = false;
        initialDist = getDistance(e.touches[0], e.touches[1]);
        initialZoom = zoomRef.current;
        initialPan = { ...panRef.current };
        startMid = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isPinching && e.touches.length >= 2) {
        const currentDist = getDistance(e.touches[0], e.touches[1]);
        if (initialDist > 0) {
          const factor = currentDist / initialDist;
          const newZoom = Math.min(Math.max(initialZoom * factor, 0.75), 4);
          setZoom(Number(newZoom.toFixed(2)));
        }

        const currentMid = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        setPan({
          x: initialPan.x + (currentMid.x - startMid.x),
          y: initialPan.y + (currentMid.y - startMid.y),
        });
      } else if (isTouching && e.touches.length === 1) {
        const dx = e.touches[0].clientX - startMid.x;
        const dy = e.touches[0].clientY - startMid.y;
        setPan({
          x: initialPan.x + dx,
          y: initialPan.y + dy,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        isTouching = false;
        isPinching = false;
        setIsDragging(false);
      } else if (e.touches.length === 1) {
        isPinching = false;
        isTouching = true;
        startMid = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPan = { ...panRef.current };
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isZoomOpen]);

  // Desktop Mouse Drag handlers
  const isMouseDownRef = useRef(false);
  const mouseStartRef = useRef({ startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isMouseDownRef.current = true;
    setIsDragging(true);
    mouseStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const dx = e.clientX - mouseStartRef.current.startX;
      const dy = e.clientY - mouseStartRef.current.startY;
      setPan({
        x: mouseStartRef.current.initialPanX + dx,
        y: mouseStartRef.current.initialPanY + dy,
      });
    };

    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
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

  if (allCerts.length === 0) {
    return null;
  }

  const hasBothTypes = documentCerts.length > 0 && skillBadges.length > 0;

  return (
    <section id="certifications" className="pt-6 sm:pt-10 pb-16 sm:pb-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-8">
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
              Official certifications, diplomas, and digitally verified skill badges.
            </p>
          </div>
        </ScrollReveal>

        {/* ─── Category Filter Tabs (Shown when both document certificates and skill badges exist) ─── */}
        {hasBothTypes && (
          <ScrollReveal variant="fade-up" delay={50} className="mb-8">
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-foreground-custom/[0.03] border border-border-custom w-fit">
              <button
                onClick={() => {
                  haptic.tap();
                  setFilterMode('all');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                  filterMode === 'all'
                    ? 'bg-primary-custom text-white shadow-sm'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5'
                }`}
              >
                <span>All Credentials</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                  {allCerts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  haptic.tap();
                  setFilterMode('certificates');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                  filterMode === 'certificates'
                    ? 'bg-primary-custom text-white shadow-sm'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5'
                }`}
              >
                <span>Document Certificates</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterMode === 'certificates' ? 'bg-white/20 text-white' : 'bg-foreground-custom/10 text-muted-foreground-custom'}`}>
                  {documentCerts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  haptic.tap();
                  setFilterMode('badges');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                  filterMode === 'badges'
                    ? 'bg-primary-custom text-white shadow-sm'
                    : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5'
                }`}
              >
                <span>Digital Skill Badges</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterMode === 'badges' ? 'bg-white/20 text-white' : 'bg-foreground-custom/10 text-muted-foreground-custom'}`}>
                  {skillBadges.length}
                </span>
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* ─── SECTION 1: Formal Document Certificates & Diplomas ─── */}
        {(filterMode === 'all' || filterMode === 'certificates') && documentCerts.length > 0 && (
          <div className="mb-12">
            {filterMode === 'all' && hasBothTypes && (
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground-custom tracking-tight">
                  Official Certificates &amp; Diplomas
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                  {documentCerts.length} Document{documentCerts.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Document Certificates Grid (Wide 2-column layout showcasing large certificate documents) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentCerts.map((cert, idx) => (
                <ScrollReveal key={cert.id || idx} variant="fade-up" delay={idx * 60} className="h-full">
                  <div
                    onClick={() => {
                      haptic.openModal();
                      setSelectedCert(cert);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCert(cert); }}
                    aria-label={`View full certificate document for ${cert.title}`}
                    className="bento-card p-5 sm:p-6 flex flex-col justify-between h-full group cursor-pointer hover:border-amber-500/50 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <div>
                      {/* Top Bar: Code & Official Certificate Pill */}
                      <div className="w-full flex items-center justify-between pb-3 border-b border-border-custom text-xs mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground-custom font-medium">
                            #{cert.code}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Certificate Document</span>
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-foreground-custom">
                          {cert.issuer}
                        </span>
                      </div>

                      {/* Large Document Preview Viewport (Aspect-16/10) */}
                      <div className="w-full aspect-[16/10] my-2 rounded-2xl bg-foreground-custom/[0.02] border border-border-custom/70 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-amber-500/40 transition-all shadow-inner">
                        {cert.badgeImage ? (
                          <img
                            src={cert.badgeImage}
                            alt={cert.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain rounded-lg drop-shadow-md group-hover:scale-105 transition-transform duration-300"
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
                        <div className={`cert-fallback-icon w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 ${cert.badgeImage ? 'hidden' : ''}`}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                        </div>

                        {/* Interactive Zoom & Drag Callout overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-white text-xs font-medium rounded-2xl backdrop-blur-xs">
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                          </svg>
                          <span className="font-semibold">Click to Zoom &amp; Pan Document</span>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <h4 className="text-base sm:text-lg font-bold font-heading text-foreground-custom group-hover:text-amber-500 transition-colors leading-snug mt-3">
                        {cert.title}
                      </h4>
                      {cert.description && (
                        <p className="text-xs text-muted-foreground-custom line-clamp-2 mt-1.5 leading-relaxed">
                          {cert.description}
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Issue date and View action */}
                    <div className="pt-3.5 mt-3 border-t border-border-custom/60 w-full flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-muted-foreground-custom">
                        {cert.issueDate ? `Issued ${cert.issueDate}` : 'Verified Credential'}
                      </span>
                      <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                        <span>Inspect Document</span>
                        <span>↗</span>
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        {/* ─── SECTION 2: Verified Digital Skill Badges ─── */}
        {(filterMode === 'all' || filterMode === 'badges') && skillBadges.length > 0 && (
          <div>
            {filterMode === 'all' && hasBothTypes && (
              <div className="flex items-center gap-2.5 mb-5 pt-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground-custom tracking-tight">
                  Verified Digital Skill Badges
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  {skillBadges.length} Badge{skillBadges.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Skill Badges Grid (Compact, dense 3-4 column layout centered on authentic digital badge graphics) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {skillBadges.map((badge, idx) => (
                <ScrollReveal key={badge.id || idx} variant="fade-up" delay={idx * 40} className="h-full">
                  <div
                    onClick={() => {
                      haptic.openModal();
                      setSelectedCert(badge);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCert(badge); }}
                    aria-label={`View details for badge ${badge.title}`}
                    className="bento-card p-4 sm:p-5 flex flex-col justify-between items-center text-center h-full group cursor-pointer hover:border-emerald-500/50 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="w-full flex flex-col items-center">
                      {/* Top Bar: Code & Skill Badge Pill */}
                      <div className="w-full flex items-center justify-between pb-2.5 border-b border-border-custom text-xs mb-3">
                        <span className="text-[10px] font-mono text-muted-foreground-custom font-medium">
                          #{badge.code}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Digital Badge</span>
                        </span>
                      </div>

                      {/* Authentic Digital Badge Viewport (Centered icon with ambient glow) */}
                      <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                        {/* Ambient Backdrop Glow */}
                        <div className="absolute inset-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 blur-md transition-all" />

                        {badge.badgeImage ? (
                          <img
                            src={badge.badgeImage}
                            alt={badge.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="relative z-10 w-24 h-24 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const parent = (e.currentTarget as HTMLElement).parentElement;
                              if (parent) {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const fallback = parent.querySelector('.badge-fallback-icon');
                                if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                              }
                            }}
                          />
                        ) : null}
                        <div className={`badge-fallback-icon w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 ${badge.badgeImage ? 'hidden' : ''}`}>
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                          </svg>
                        </div>
                      </div>

                      {/* Badge Title */}
                      <h4 className="text-sm font-bold font-heading text-foreground-custom group-hover:text-emerald-500 transition-colors leading-snug line-clamp-2 mt-2 px-1">
                        {badge.title}
                      </h4>

                      <p className="text-[11px] font-mono text-muted-foreground-custom mt-1">
                        Issued by {badge.issuer}
                      </p>
                    </div>

                    {/* Direct 1-Click Verification Link Button */}
                    <div className="w-full pt-3 mt-3 border-t border-border-custom/60 flex items-center justify-center">
                      <a
                        href={badge.badgeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-foreground-custom/[0.04] hover:bg-emerald-500/10 text-foreground-custom hover:text-emerald-500 border border-border-custom text-[11px] font-mono font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Verify Credential</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Modal (Works for Both Documents & Badges) ─── */}
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

            {/* Clickable Large Viewport (Launches Zoom & Drag Modal) */}
            <div
              onClick={() => {
                if (selectedCert.badgeImage) {
                  haptic.tap();
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setIsZoomOpen(true);
                }
              }}
              className={`w-full ${isDocumentCertificate(selectedCert) ? 'max-h-[52vh]' : 'max-h-[44vh]'} flex items-center justify-center bg-foreground-custom/[0.02] dark:bg-black/40 rounded-2xl border border-border-custom/70 p-4 sm:p-6 overflow-hidden shadow-inner relative group/preview cursor-zoom-in`}
              title="Click to open zoom and drag lightbox"
            >
              {selectedCert.badgeImage ? (
                <img
                  src={selectedCert.badgeImage}
                  alt={selectedCert.title}
                  referrerPolicy="no-referrer"
                  className={`${isDocumentCertificate(selectedCert) ? 'max-h-[48vh] w-auto max-w-full' : 'max-h-[36vh] w-auto'} object-contain rounded-lg drop-shadow-md transition-transform duration-300 group-hover/preview:scale-[1.02]`}
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
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
                  isDocumentCertificate(selectedCert)
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDocumentCertificate(selectedCert) ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {isDocumentCertificate(selectedCert) ? 'OFFICIAL CERTIFICATE' : 'VERIFIED DIGITAL BADGE'}
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
          className="fixed inset-0 z-[60] bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden select-none animate-modal-fade touch-none overscroll-none"
          style={{ touchAction: 'none', overscrollBehavior: 'none' }}
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
            ref={canvasRef}
            className={`w-full flex-1 flex items-center justify-center relative overflow-hidden my-2 touch-none overscroll-none select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ touchAction: 'none' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
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
              className="max-w-[92vw] max-h-[72vh] object-contain drop-shadow-2xl pointer-events-none select-none rounded-lg touch-none"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.12s ease-out',
                touchAction: 'none',
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
              Pinch or double-tap to zoom • Drag to pan
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
