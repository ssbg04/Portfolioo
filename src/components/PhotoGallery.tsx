import React, { useState, useEffect } from 'react';
import type { GalleryItem } from '../lib/data';

interface PhotoGalleryProps {
  items: GalleryItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]))];

  // Filter items
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeModalItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModalItem]);

  return (
    <div className="w-full">
      {/* ─── Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border-custom">
        <div>
          <span className="section-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
            06 // Visual Log
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom tracking-tight mt-1">
            Photo Gallery
          </h2>
          <p className="text-xs text-muted-foreground-custom mt-1">
            Visual archive of projects, technical milestones, and university events.
          </p>
        </div>

        {/* Categories in top-right */}
        <div className="flex flex-wrap items-center gap-1.5 sm:self-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
              onClick={() => setActiveModalItem(item)}
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

      {/* ─── Fullscreen Modal Viewer ─── */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Top-Right Cross Button */}
          <button
            onClick={() => setActiveModalItem(null)}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Container */}
          <div
            className="relative max-w-4xl w-full flex flex-col items-center max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl flex items-center justify-center">
              <img
                src={activeModalItem.photo}
                alt={activeModalItem.title || 'Full Photo'}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>

            {/* Modal Caption Box */}
            {(activeModalItem.title || activeModalItem.description || activeModalItem.category) && (
              <div className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-center max-w-xl w-full">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {activeModalItem.category && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary-custom px-2 py-0.5 rounded-full bg-primary-custom/15 border border-primary-custom/30">
                      {activeModalItem.category}
                    </span>
                  )}
                  {activeModalItem.title && (
                    <h4 className="text-sm font-bold text-white font-heading">
                      {activeModalItem.title}
                    </h4>
                  )}
                </div>
                {activeModalItem.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                    {activeModalItem.description}
                  </p>
                )}
              </div>
            )}
          </div>
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
