import React, { useState, useEffect, useRef } from 'react';
import type { Testimonial } from '../lib/data';
import ScrollReveal from './ScrollReveal';
import SectionBackground from './SectionBackground';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const isCarousel = testimonials.length > 3;

  // Responsive items visible count
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  // Auto carousel rotation when more than 3 items
  useEffect(() => {
    if (!isCarousel || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [isCarousel, isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <div className="section-marker">
                <span className="section-marker-num">06 —</span>
                <h2 className="section-marker-title">testimonials</h2>
              </div>
              <p className="text-xs font-mono text-muted-foreground-custom mt-1">
                peer &amp; client endorsements // verified feedback
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Slider Controls (Shown only if more than 3) */}
              {isCarousel && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous testimonial"
                    className="w-8 h-8 rounded-md border border-border-custom bg-card-custom hover:border-foreground-custom text-muted-foreground-custom hover:text-foreground-custom flex items-center justify-center transition-all cursor-pointer font-mono text-xs"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next testimonial"
                    className="w-8 h-8 rounded-md border border-border-custom bg-card-custom hover:border-foreground-custom text-muted-foreground-custom hover:text-foreground-custom flex items-center justify-center transition-all cursor-pointer font-mono text-xs"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Static 3-Card Grid (When <= 3) ─── */}
        {!isCarousel ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((test, index) => (
              <ScrollReveal key={index} variant="fade-up" delay={index * 80}>
                <div className="bryl-card p-5 sm:p-6 flex flex-col justify-between h-full">
                  <div>
                    {/* Stars / Quote Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                      <div className="flex items-center gap-0.5 text-xs text-foreground-custom font-mono" aria-label={`${test.rating ?? 5} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, s) => {
                          const isFilled = s < (test.rating ?? 5);
                          return (
                            <span key={s} className={isFilled ? 'text-foreground-custom' : 'text-foreground-custom/20'}>
                              ★
                            </span>
                          );
                        })}
                      </div>

                      {test.relationship && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom border border-border-custom bg-muted-custom/30 px-2 py-0.5 rounded-md">
                          {test.relationship}
                        </span>
                      )}
                    </div>

                    <p className="font-serif text-sm text-foreground-custom leading-relaxed mb-6 italic">
                      "{test.quote}"
                    </p>
                  </div>

                  {/* Profile Foot */}
                  <div className="pt-3 border-t border-border-custom flex items-center gap-3">
                    {test.avatar ? (
                      <img
                        src={test.avatar}
                        alt={test.name}
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 rounded-xl object-cover border border-border-custom"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-card-custom text-foreground-custom border border-border-custom flex items-center justify-center font-mono font-bold text-xs">
                        {test.name ? test.name.charAt(0) : 'T'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-mono text-xs font-bold text-foreground-custom truncate lowercase">
                        {test.name}
                      </h4>
                      <p className="text-[10px] font-mono text-muted-foreground-custom truncate">
                        {test.role} {test.company ? `// ${test.company}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          /* ─── Auto-Carousel Slider (When > 3) ─── */
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
                }}
              >
                {testimonials.map((test, index) => (
                  <div
                    key={index}
                    className="shrink-0 px-2 box-border"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <div className="bryl-card p-5 sm:p-6 flex flex-col justify-between h-full">
                      <div>
                        {/* Rating & Tag */}
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                          <div className="flex items-center gap-0.5 text-xs text-foreground-custom font-mono" aria-label={`${test.rating ?? 5} out of 5 stars`}>
                            {Array.from({ length: 5 }).map((_, s) => {
                              const isFilled = s < (test.rating ?? 5);
                              return (
                                <span key={s} className={isFilled ? 'text-foreground-custom' : 'text-foreground-custom/20'}>
                                  ★
                                </span>
                              );
                            })}
                          </div>

                          {test.relationship && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom border border-border-custom bg-muted-custom/30 px-2 py-0.5 rounded-md">
                              {test.relationship}
                            </span>
                          )}
                        </div>

                        <p className="font-serif text-sm text-foreground-custom leading-relaxed mb-6 italic">
                          "{test.quote}"
                        </p>
                      </div>

                      {/* Author Profile */}
                      <div className="pt-3 border-t border-border-custom flex items-center gap-3">
                        {test.avatar ? (
                          <img
                            src={test.avatar}
                            alt={test.name}
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-9 rounded-xl object-cover border border-border-custom"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-card-custom text-foreground-custom border border-border-custom flex items-center justify-center font-mono font-bold text-xs">
                            {test.name ? test.name.charAt(0) : 'T'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-mono text-xs font-bold text-foreground-custom truncate lowercase">
                            {test.name}
                          </h4>
                          <p className="text-[10px] font-mono text-muted-foreground-custom truncate">
                            {test.role} {test.company ? `// ${test.company}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === dotIdx
                      ? 'w-6 bg-foreground-custom'
                      : 'w-1.5 bg-foreground-custom/20 hover:bg-foreground-custom/40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
