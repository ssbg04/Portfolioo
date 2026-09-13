import React, { useState, useEffect, useRef } from 'react';
import type { GalleryItem } from '../lib/data';
import haptic from '../lib/haptics';

interface PhotoGalleryProps {
  items: GalleryItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [modalViewMode, setModalViewMode] = useState<'single' | 'grid'>('single');
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]))];

  // Filter items
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const activeItem = activeModalIndex !== null && activeModalIndex < filteredItems.length
    ? filteredItems[activeModalIndex]
    : null;

  // Next and Previous navigation
  const handleNext = () => {
    if (filteredItems.length === 0 || activeModalIndex === null) return;
    haptic.tap();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
  };

  const handlePrev = () => {
    if (filteredItems.length === 0 || activeModalIndex === null) return;
    haptic.tap();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : filteredItems.length - 1));
  };

  // Zoom controls
  const handleZoomIn = () => {
    haptic.tick();
    setZoomLevel((prev) => Math.min(3, Math.round((prev + 0.5) * 10) / 10));
  };

  const handleZoomOut = () => {
    haptic.tick();
    setZoomLevel((prev) => {
      const nextZoom = Math.max(1, Math.round((prev - 0.5) * 10) / 10);
      if (nextZoom === 1) setPanPosition({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const handleResetZoom = () => {
    haptic.tick();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Pan / Drag handlers when zoomed in
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panPosition };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanPosition({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStartRef.current = { ...panPosition };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPanPosition({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const onTouchEnd = () => {
    setIsDragging(false);
  };

  // Keyboard navigation: Escape to close, Left/Right arrow keys for Next/Prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalIndex === null) return;
      if (e.key === 'Escape') {
        setActiveModalIndex(null);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, filteredItems.length]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeItem]);

  return (
    <div className="w-full">
      {/* ─── Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border-custom">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom tracking-tight">
            Photo Gallery
          </h2>
        </div>

        {/* Categories in top-right */}
        <div className="flex flex-wrap items-center gap-1.5 sm:self-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                haptic.tick();
                setSelectedCategory(cat);
                setActiveModalIndex(null);
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary-custom text-white shadow-xs'
                  : 'bg-foreground-custom/5 text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/10 border border-border-custom'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Responsive Photo Grid ─── */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground-custom text-sm">
          No photos found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                haptic.openModal();
                setActiveModalIndex(idx);
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
                setModalViewMode('single');
              }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-border-custom bg-muted-custom/20 aspect-[4/3] shadow-xs"
              style={{
                animation: 'galleryBottomEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                animationDelay: `${idx * 60}ms`
              }}
            >
              {/* Image */}
              <img
                src={item.photo}
                alt={item.title || 'Portfolio Gallery Photo'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Hover Overlay with Blur + Title + Description */}
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                <div className="flex justify-between items-start">
                  {item.category && (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                      {item.category}
                    </span>
                  )}
                  <span className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors ml-auto">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  </span>
                </div>

                <div>
                  {item.title && (
                    <h3 className="text-sm sm:text-base font-bold font-heading text-white line-clamp-1 leading-snug">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-xs text-zinc-200/90 line-clamp-2 mt-1 font-normal leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Enhanced Fullscreen Lightbox Modal Viewer ─── */}
      {activeItem && activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-black/92 backdrop-blur-lg select-none"
          onClick={() => {
            setActiveModalIndex(null);
            setZoomLevel(1);
            setPanPosition({ x: 0, y: 0 });
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* ── Top Bar Controls: Counter, Zoom Toolbar, Web Grid View Toggle, Close ── */}
          <div
            className="w-full max-w-5xl flex items-center justify-between gap-3 z-50 py-1 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Photo Counter (Category duplication removed from top bar) */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-white/90 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                {activeModalIndex + 1} / {filteredItems.length}
              </span>
            </div>

            {/* Center: Zoom In / Zoom Out Controls & Web Grid Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Toolbar */}
              <div className="flex items-center bg-white/10 border border-white/15 rounded-full p-0.5 backdrop-blur-md">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  aria-label="Zoom out"
                  title="Zoom Out (-)"
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer text-xs flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>

                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom (0)"
                  className="px-2 py-0.5 text-[11px] font-mono text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  aria-label="Zoom in"
                  title="Zoom In (+)"
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer text-xs flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Web View Mode Toggle: Single Image vs Full In-Modal Grid */}
              <button
                onClick={() => {
                  haptic.tap();
                  setModalViewMode((prev) => (prev === 'single' ? 'grid' : 'single'));
                  setZoomLevel(1);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  modalViewMode === 'grid'
                    ? 'bg-primary-custom text-white border-primary-custom shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/15'
                }`}
                title={modalViewMode === 'grid' ? 'Switch to Single Photo View' : 'Switch to Image Grid in Modal'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span>{modalViewMode === 'grid' ? 'Single View' : 'Grid View'}</span>
              </button>
            </div>

            {/* Right: Close Button */}
            <button
              onClick={() => {
                haptic.tap();
                setActiveModalIndex(null);
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              aria-label="Close modal"
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Modal Body ── */}
          {modalViewMode === 'grid' ? (
            /* ── FULL IN-MODAL IMAGE GRID (For web & responsive modal browsing) ── */
            <div
              className="w-full max-w-5xl flex-1 overflow-y-auto my-3 p-4 rounded-2xl bg-zinc-950/70 border border-white/15 animate-modal-scale"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      haptic.tap();
                      setActiveModalIndex(idx);
                      setModalViewMode('single');
                      setZoomLevel(1);
                      setPanPosition({ x: 0, y: 0 });
                    }}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border aspect-[4/3] transition-all ${
                      idx === activeModalIndex
                        ? 'border-primary-custom ring-2 ring-primary-custom/50 shadow-lg scale-[1.02]'
                        : 'border-white/15 hover:border-white/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.photo}
                      alt={item.title || 'Photo thumbnail'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── SINGLE IMAGE FOCUS VIEW with Next/Prev and Bottom Web Thumbnail Grid ── */
            <div
              className="relative w-full max-w-5xl flex-1 flex flex-col items-center justify-center my-auto min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button (Left) */}
              <button
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-1 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-primary-custom text-white border border-white/25 hover:border-primary-custom/80 shadow-2xl transition-all cursor-pointer active:scale-90 hover:scale-110"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Next Button (Right) */}
              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-1 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-primary-custom text-white border border-white/25 hover:border-primary-custom/80 shadow-2xl transition-all cursor-pointer active:scale-90 hover:scale-110"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {/* Main Image Container with Movable / Draggable Pan when Zoomed */}
              <div
                ref={modalContainerRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className={`relative rounded-2xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl flex items-center justify-center max-h-[58vh] sm:max-h-[64vh] md:max-h-[66vh] max-w-full touch-none select-none ${
                  zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                }`}
              >
                <img
                  src={activeItem.photo}
                  alt={activeItem.title || 'Full Photo'}
                  draggable={false}
                  style={{
                    transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomLevel})`,
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: 'center center'
                  }}
                  className="max-h-[58vh] sm:max-h-[64vh] md:max-h-[66vh] w-auto max-w-full object-contain rounded-2xl pointer-events-none select-none"
                />
              </div>

              {/* Modal Caption Box */}
              {(activeItem.title || activeItem.description || activeItem.category) && (
                <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-white/15 text-center max-w-2xl w-full shrink-0 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-1.5 flex-wrap">
                    {activeItem.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary-custom px-2.5 py-0.5 rounded-full bg-primary-custom/15 border border-primary-custom/30 font-medium">
                        {activeItem.category}
                      </span>
                    )}
                    {activeItem.title && (
                      <h4 className="text-sm sm:text-base font-bold text-white font-heading tracking-tight">
                        {activeItem.title}
                      </h4>
                    )}
                  </div>
                  {activeItem.description && (
                    <p className="text-xs sm:text-sm text-zinc-100/95 leading-relaxed font-normal max-h-28 sm:max-h-36 overflow-y-auto pr-1 select-text">
                      {activeItem.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Bottom Web Image Grid / Thumbnail Selector Bar (Web/Desktop modal view) ── */}
          {modalViewMode === 'single' && (
            <div
              className="hidden md:flex items-center justify-center gap-2.5 w-full max-w-4xl py-2 px-3 overflow-x-auto z-40 bg-zinc-950/70 border border-white/10 rounded-2xl backdrop-blur-md shrink-0 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => {
                    haptic.tap();
                    setActiveModalIndex(idx);
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`relative w-14 h-10 lg:w-16 lg:h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === activeModalIndex
                      ? 'border-primary-custom ring-2 ring-primary-custom/50 scale-105 opacity-100 shadow-md'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/60 hover:scale-102'
                  }`}
                  title={item.title || `Photo ${idx + 1}`}
                >
                  <img
                    src={item.photo}
                    alt={item.title || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Embedded style for bottom-up animation */}
      <style>{`
        @keyframes galleryBottomEnter {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
