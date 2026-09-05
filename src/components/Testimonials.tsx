import React, { useState, useEffect, useRef } from 'react';
import type { Testimonial } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

          {/* Section Header */}
          <ScrollReveal variant="fade-up" className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
              <div>
                <span className="section-tag">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                  05 // Endorsements
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                  Client &amp; Peer Testimonials
                </h2>
              </div>
              <p className="text-sm text-muted-foreground-custom">
                Recommendations, supervisor reviews &amp; colleague feedback.
              </p>
            </div>
          </ScrollReveal>

          {/* Empty Note Card */}
          <ScrollReveal variant="fade-up" delay={100}>
            <div className="bento-card p-8 sm:p-12 text-center border border-border-custom max-w-xl mx-auto flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-custom/10 border border-primary-custom/20 text-primary-custom flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>

              <h3 className="text-lg font-bold font-heading text-foreground-custom mb-2">
                No Testimonials Yet
              </h3>
              <p className="text-sm text-muted-foreground-custom leading-relaxed mb-6">
                Client reviews, supervisor feedback, and project endorsements will be showcased here once published via Sanity Studio.
              </p>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-custom/10 hover:bg-primary-custom/20 border border-primary-custom/30 text-primary-custom text-xs font-mono font-medium transition-all"
              >
                Work with me &amp; share feedback →
              </a>
            </div>
          </ScrollReveal>

        </div>
      </section>
    );
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
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                05 // Endorsements
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Client &amp; Peer Testimonials
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground-custom hidden sm:block">
                {testimonials.length} verified recommendations
              </p>

              {/* Slider Controls (Shown only if more than 3) */}
              {isCarousel && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous testimonial"
                    className="w-9 h-9 rounded-xl border border-border-custom bg-card-custom/50 hover:bg-primary-custom/10 hover:border-primary-custom/40 text-foreground-custom flex items-center justify-center transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next testimonial"
                    className="w-9 h-9 rounded-xl border border-border-custom bg-card-custom/50 hover:bg-primary-custom/10 hover:border-primary-custom/40 text-foreground-custom flex items-center justify-center transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Static 3-Card Grid (When <= 3) ─── */}
        {!isCarousel ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((test, index) => (
              <ScrollReveal key={index} variant="fade-up" delay={index * 80}>
                <div className="bento-card p-6 sm:p-7 flex flex-col justify-between h-full group">
                  <div>
                    {/* Stars / Quote Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                      <div className="flex items-center gap-1 text-xs" aria-label={`${test.rating ?? 5} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, s) => {
                          const isFilled = s < (test.rating ?? 5);
                          return (
                            <svg
                              key={s}
                              className={`w-3.5 h-3.5 ${isFilled ? 'text-amber-500 fill-current' : 'text-foreground-custom/15 fill-current'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        })}
                      </div>

                      {test.relationship && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom px-2 py-0.5 rounded-full bg-foreground-custom/5 border border-border-custom">
                          {test.relationship}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-foreground-custom/90 leading-relaxed font-normal italic mb-6">
                      "{test.quote}"
                    </p>
                  </div>

                  {/* Profile Foot */}
                  <div className="pt-4 border-t border-border-custom flex items-center gap-3">
                    {test.avatar ? (
                      <img
                        src={test.avatar}
                        alt={test.name}
                        loading="lazy"
                        className="w-10 h-10 rounded-xl object-cover border border-border-custom"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary-custom/10 text-primary-custom border border-primary-custom/20 flex items-center justify-center font-bold text-xs">
                        {test.name ? test.name.charAt(0) : 'T'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground-custom truncate">
                        {test.name}
                      </h4>
                      <p className="text-[11px] font-mono text-muted-foreground-custom truncate">
                        {test.role} {test.company ? `• ${test.company}` : ''}
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
                    className="shrink-0 px-2.5 box-border"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <div className="bento-card p-6 sm:p-7 flex flex-col justify-between h-full group">
                      <div>
                        {/* Rating & Tag */}
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                          <div className="flex items-center gap-1 text-xs" aria-label={`${test.rating ?? 5} out of 5 stars`}>
                            {Array.from({ length: 5 }).map((_, s) => {
                              const isFilled = s < (test.rating ?? 5);
                              return (
                                <svg
                                  key={s}
                                  className={`w-3.5 h-3.5 ${isFilled ? 'text-amber-500 fill-current' : 'text-foreground-custom/15 fill-current'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              );
                            })}
                          </div>

                          {test.relationship && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom px-2 py-0.5 rounded-full bg-foreground-custom/5 border border-border-custom">
                              {test.relationship}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-foreground-custom/90 leading-relaxed font-normal italic mb-6">
                          "{test.quote}"
                        </p>
                      </div>

                      {/* Author Profile */}
                      <div className="pt-4 border-t border-border-custom flex items-center gap-3">
                        {test.avatar ? (
                          <img
                            src={test.avatar}
                            alt={test.name}
                            loading="lazy"
                            className="w-10 h-10 rounded-xl object-cover border border-border-custom"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary-custom/10 text-primary-custom border border-primary-custom/20 flex items-center justify-center font-bold text-xs">
                            {test.name ? test.name.charAt(0) : 'T'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-foreground-custom truncate">
                            {test.name}
                          </h4>
                          <p className="text-[11px] font-mono text-muted-foreground-custom truncate">
                            {test.role} {test.company ? `• ${test.company}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === dotIdx
                      ? 'w-6 bg-primary-custom'
                      : 'w-2 bg-border-custom hover:bg-muted-foreground-custom/50'
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
