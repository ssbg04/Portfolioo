import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { GalleryItem } from '../lib/data';
import haptic from '../lib/haptics';

interface PhotoGalleryProps {
  items: GalleryItem[];
}

export interface AlbumGroup {
  name: string;
  category?: string;
  items: GalleryItem[];
}

export function getAlbumName(title: string): string {
  if (!title) return 'Portfolio Showcase';
  return title
    .replace(/\s*\(\d+\)$/i, '')
    .replace(/\s*[-–—]\s*(part|vol|no|photo|slide)?\s*\d+$/i, '')
    .replace(/\s*#\d+$/i, '')
    .replace(/\s+\d+$/i, '')
    .trim();
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'albums' | 'all'>('albums');
  const [scopedAlbum, setScopedAlbum] = useState<AlbumGroup | null>(null);
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

  // Filter items by category
  const filteredItems = useMemo(() => {
    return selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Group filtered items into album decks
  const albumGroups = useMemo<AlbumGroup[]>(() => {
    const groups: { [key: string]: AlbumGroup } = {};
    filteredItems.forEach((item) => {
      const albumName = getAlbumName(item.title || 'Untitled');
      const key = `${item.category || 'General'}__${albumName}`;
      if (!groups[key]) {
        groups[key] = {
          name: albumName,
          category: item.category,
          items: [],
        };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups);
  }, [filteredItems]);

  // Items active inside the modal (either scoped to an opened album deck or all filtered items)
  const currentModalItems = scopedAlbum ? scopedAlbum.items : filteredItems;

  const activeItem = activeModalIndex !== null && activeModalIndex < currentModalItems.length
    ? currentModalItems[activeModalIndex]
    : null;

  // Next and Previous navigation
  const handleNext = () => {
    if (currentModalItems.length === 0 || activeModalIndex === null) return;
    haptic.tap();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % currentModalItems.length : 0));
  };

  const handlePrev = () => {
    if (currentModalItems.length === 0 || activeModalIndex === null) return;
    haptic.tap();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + currentModalItems.length) % currentModalItems.length : currentModalItems.length - 1));
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

  const closeModal = () => {
    haptic.tap();
    setActiveModalIndex(null);
    setScopedAlbum(null);
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
    if (!isDragging || zoomLevel <= 1) return;
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
        closeModal();
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
  }, [activeModalIndex, currentModalItems.length]);

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
      {/* ─── Header & Filter Bar ─── */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 pb-4 border-b border-border-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom tracking-tight">
              Photo Gallery
            </h1>
            <p className="text-xs font-mono text-muted-foreground-custom mt-1">
              Visual records, project milestones, and tech symposium archives
            </p>
          </div>

          {/* View Mode Toggle: Albums Deck vs All Photos */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-card-custom/80 border border-border-custom shadow-xs text-xs font-mono self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                setViewMode('albums');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'albums'
                  ? 'bg-primary-custom text-white font-medium shadow-xs'
                  : 'text-muted-foreground-custom hover:text-foreground-custom'
              }`}
              title="Group related series photos into album stacks"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6A2.25 2.25 0 008.25 10.5v6" />
              </svg>
              <span>Albums ({albumGroups.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                setViewMode('all');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-primary-custom text-white font-medium shadow-xs'
                  : 'text-muted-foreground-custom hover:text-foreground-custom'
              }`}
              title="View all photos individually"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span>All ({filteredItems.length})</span>
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                haptic.tick();
                setSelectedCategory(cat);
                setActiveModalIndex(null);
                setScopedAlbum(null);
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono tracking-wide transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-primary-custom text-white border-primary-custom font-medium shadow-xs'
                  : 'bg-card-custom/80 text-muted-foreground-custom border-border-custom hover:text-foreground-custom hover:border-border-custom/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content Grid: Albums Deck View or Flat Photos View ─── */}
      {viewMode === 'albums' ? (
        albumGroups.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground-custom text-sm font-mono border border-dashed border-border-custom rounded-xl bg-card-custom/50">
            No albums found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {albumGroups.map((album, idx) => {
              const coverItem = album.items[0];
              const isStack = album.items.length > 1;

              return (
                <div
                  key={album.name + idx}
                  onClick={() => {
                    haptic.openModal();
                    setScopedAlbum(album);
                    setActiveModalIndex(0);
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                    setModalViewMode('single');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setScopedAlbum(album);
                      setActiveModalIndex(0);
                    }
                  }}
                  className={`group relative rounded-xl cursor-pointer aspect-[4/3] transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom ${
                    isStack ? 'pr-2 pb-2' : ''
                  }`}
                  style={{
                    animation: 'galleryBottomEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                    animationDelay: `${idx * 50}ms`
                  }}
                >
                  {/* Physical Album Deck Underlay Shadows for Multi-Photo series */}
                  {isStack && (
                    <>
                      <div className="absolute inset-0 bg-card-custom/50 rounded-xl border border-border-custom translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-2.5 group-hover:translate-y-2.5 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-card-custom/30 rounded-xl border border-border-custom/60 translate-x-3 translate-y-3 -z-20 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                    </>
                  )}

                  {/* Front Photo Card Container */}
                  <div className="relative w-full h-full rounded-xl overflow-hidden border border-border-custom bg-card-custom shadow-xs hover:shadow-md hover:border-primary-custom/50 group-hover:-translate-y-0.5 active:scale-[0.99] transition-all">
                    <img
                      src={coverItem.photo}
                      alt={album.name}
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={idx < 3 ? 'high' : 'auto'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Stack Pill Badge on Top Right */}
                    {isStack && (
                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 font-medium shadow-md">
                          <svg className="w-3 h-3 text-primary-custom shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6A2.25 2.25 0 008.25 10.5v6" />
                          </svg>
                          <span>{album.items.length} PHOTOS</span>
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay with Album Metadata */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-start">
                        {album.category && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-custom/90 text-white border border-primary-custom/30 font-medium">
                            {album.category}
                          </span>
                        )}
                        <span className="p-1 rounded-md bg-white/20 backdrop-blur-xs text-white border border-white/20 ml-auto">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                          </svg>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-black font-heading text-white line-clamp-1 leading-snug">
                          {album.name}
                        </h3>
                        <p className="text-xs text-zinc-300 line-clamp-2 mt-1 font-normal leading-relaxed">
                          {coverItem.description || `Event album containing ${album.items.length} archived captures.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Flat Grid View: All individual photos */
        filteredItems.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground-custom text-sm font-mono border border-dashed border-border-custom rounded-xl bg-card-custom/50">
            No photos found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  haptic.openModal();
                  setScopedAlbum(null);
                  setActiveModalIndex(idx);
                  setZoomLevel(1);
                  setPanPosition({ x: 0, y: 0 });
                  setModalViewMode('single');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setScopedAlbum(null);
                    setActiveModalIndex(idx);
                  }
                }}
                className="group relative rounded-xl overflow-hidden cursor-pointer border border-border-custom bg-card-custom aspect-[4/3] shadow-xs hover:shadow-md hover:border-primary-custom/40 hover:-translate-y-0.5 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
                style={{
                  animation: 'galleryBottomEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                  animationDelay: `${idx * 40}ms`
                }}
              >
                <img
                  src={item.photo}
                  alt={item.title || 'Portfolio Gallery Photo'}
                  loading={idx < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={idx < 3 ? 'high' : 'auto'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-between items-start">
                    {item.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-custom/90 text-white border border-primary-custom/30 font-medium">
                        {item.category}
                      </span>
                    )}
                    <span className="p-1 rounded-md bg-white/20 backdrop-blur-xs text-white border border-white/20 ml-auto">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    </span>
                  </div>

                  <div>
                    {item.title && (
                      <h3 className="text-sm sm:text-base font-black font-heading text-white line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-xs text-zinc-300 line-clamp-2 mt-1 font-normal leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ─── Enhanced Fullscreen Lightbox Modal Viewer ─── */}
      {activeItem && activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-md select-none"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          {/* ── Top Bar Controls: Counter, Zoom Toolbar, Web Grid View Toggle, Close ── */}
          <div
            className="w-full max-w-5xl flex items-center justify-between gap-3 z-50 py-1 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Photo Counter + Album Title if scoped */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-foreground-custom px-2.5 py-1 rounded-md bg-card-custom/90 border border-border-custom shadow-xs">
                {activeModalIndex + 1} / {currentModalItems.length}
              </span>
              {scopedAlbum && scopedAlbum.items.length > 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary-custom/15 text-primary-custom border border-primary-custom/30 font-medium hidden sm:inline">
                  ALBUM // {scopedAlbum.name}
                </span>
              )}
            </div>

            {/* Center: Zoom In / Zoom Out Controls & Web Grid Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Toolbar */}
              <div className="flex items-center bg-card-custom/90 border border-border-custom rounded-lg p-0.5 shadow-xs">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  aria-label="Zoom out"
                  title="Zoom Out (-)"
                  className="p-1.5 rounded-md text-foreground-custom hover:bg-foreground-custom/5 disabled:opacity-30 transition-all cursor-pointer text-xs flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>

                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom (0)"
                  className="px-2 py-0.5 text-[11px] font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors cursor-pointer"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  aria-label="Zoom in"
                  title="Zoom In (+)"
                  className="p-1.5 rounded-md text-foreground-custom hover:bg-foreground-custom/5 disabled:opacity-30 transition-all cursor-pointer text-xs flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Web View Mode Toggle */}
              <button
                onClick={() => {
                  haptic.tap();
                  setModalViewMode((prev) => (prev === 'single' ? 'grid' : 'single'));
                  setZoomLevel(1);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border-custom shadow-xs transition-all cursor-pointer ${
                  modalViewMode === 'grid'
                    ? 'bg-primary-custom text-white border-primary-custom font-medium'
                    : 'bg-card-custom/90 text-muted-foreground-custom hover:text-foreground-custom hover:border-border-custom/80'
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
              onClick={closeModal}
              aria-label="Close modal"
              className="p-2 rounded-lg bg-card-custom/90 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 text-muted-foreground-custom transition-all cursor-pointer border border-border-custom shadow-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Modal Body ── */}
          {modalViewMode === 'grid' ? (
            /* ── FULL IN-MODAL IMAGE GRID (For web & responsive modal browsing) ── */
            <div
              className="w-full max-w-5xl flex-1 overflow-y-auto my-3 p-4 sm:p-6 rounded-xl bg-card-custom border border-border-custom shadow-2xl animate-modal-scale"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {currentModalItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      haptic.tap();
                      setActiveModalIndex(idx);
                      setModalViewMode('single');
                      setZoomLevel(1);
                      setPanPosition({ x: 0, y: 0 });
                    }}
                    className={`group relative rounded-lg overflow-hidden cursor-pointer border transition-all aspect-[4/3] bg-card-custom ${
                      idx === activeModalIndex
                        ? 'border-primary-custom ring-2 ring-primary-custom/40 scale-[1.02] shadow-md'
                        : 'border-border-custom shadow-xs hover:border-primary-custom/40'
                    }`}
                  >
                    <img
                      src={item.photo}
                      alt={item.title || 'Photo thumbnail'}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <p className="text-xs font-medium font-heading text-white truncate">{item.title}</p>
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
                className="absolute left-1 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-card-custom/90 hover:bg-card-custom text-foreground-custom border border-border-custom shadow-lg backdrop-blur-xs transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Next Button (Right) */}
              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-1 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-card-custom/90 hover:bg-card-custom text-foreground-custom border border-border-custom shadow-lg backdrop-blur-xs transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`relative rounded-xl overflow-hidden border border-border-custom bg-card-custom shadow-xl flex items-center justify-center max-h-[58vh] sm:max-h-[64vh] md:max-h-[66vh] max-w-full touch-none select-none p-2 sm:p-3 ${
                  zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                }`}
              >
                <img
                  src={activeItem.photo}
                  alt={activeItem.title || 'Full Photo'}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  style={{
                    transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomLevel})`,
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: 'center center'
                  }}
                  className="max-h-[56vh] sm:max-h-[62vh] md:max-h-[64vh] w-auto max-w-full object-contain rounded-lg pointer-events-none select-none border border-border-custom/50"
                />
              </div>

              {/* Modal Caption Box */}
              {(activeItem.title || activeItem.description || activeItem.category) && (
                <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-card-custom/90 border border-border-custom shadow-md text-center max-w-2xl w-full shrink-0">
                  <div className="flex items-center justify-center gap-2 mb-1.5 flex-wrap">
                    {activeItem.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider font-medium text-primary-custom px-2 py-0.5 rounded-md bg-primary-custom/10 border border-primary-custom/20">
                        {activeItem.category}
                      </span>
                    )}
                    {activeItem.title && (
                      <h4 className="text-sm sm:text-base font-semibold text-foreground-custom font-heading tracking-tight">
                        {activeItem.title}
                      </h4>
                    )}
                  </div>
                  {activeItem.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground-custom leading-relaxed font-normal max-h-28 sm:max-h-36 overflow-y-auto pr-1 select-text">
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
              className="hidden md:flex items-center justify-center gap-2 w-full max-w-4xl py-2 px-3 overflow-x-auto z-40 bg-card-custom/90 border border-border-custom rounded-xl shadow-md shrink-0 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {currentModalItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => {
                    haptic.tap();
                    setActiveModalIndex(idx);
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`relative w-14 h-10 lg:w-16 lg:h-11 rounded-md overflow-hidden shrink-0 border transition-all cursor-pointer ${
                    idx === activeModalIndex
                      ? 'border-primary-custom ring-2 ring-primary-custom/40 scale-105 opacity-100 shadow-sm'
                      : 'border-border-custom opacity-60 hover:opacity-100 shadow-xs hover:scale-105'
                  }`}
                  title={item.title || `Photo ${idx + 1}`}
                >
                  <img
                    src={item.photo}
                    alt={item.title || `Thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
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
