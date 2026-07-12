import React from 'react';
import type { Testimonial } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const isEmpty = !testimonials || testimonials.length === 0;

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-muted-custom/10">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Section Title */}
        <ScrollReveal variant="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-glow bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom to-primary-custom">
            Client Testimonials
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-custom to-secondary-custom mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground-custom max-w-lg mx-auto">
            {isEmpty 
              ? "No client testimonials available at the moment." 
              : "Kind words and feedback from past team members, managers, and partners."}
          </p>
        </ScrollReveal>

        {!isEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, index) => (
            <ScrollReveal
              key={index}
              variant="scale-up"
              delay={(index % 2) * 100}
            >
              <div
                className="glass-card p-8 rounded-[32px] border border-border/25 relative overflow-hidden flex flex-col justify-between h-full"
              >
                {/* Quote bubble icon decoration */}
                <div className="absolute top-6 right-8 text-primary-custom/10 pointer-events-none">
                  <svg className="w-20 h-20 fill-current" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm md:text-base italic text-muted-foreground-custom/95 leading-relaxed mb-8 relative z-10">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {test.avatar ? (
                    <img
                      src={test.avatar}
                      alt={test.name}
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary-custom/25 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-custom to-secondary-custom flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {test.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-foreground-custom font-heading">
                      {test.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-muted-foreground-custom">
                      {test.role} at <span className="text-primary-custom">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
