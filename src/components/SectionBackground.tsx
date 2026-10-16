import React from 'react';

export type SectionVariant =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'testimonials'
  | 'contact';

interface SectionBackgroundProps {
  variant: SectionVariant;
  className?: string;
}

/**
 * High-performance, zero-CPU background decorator.
 * Pure static CSS grid and registration coordinates without scroll physics or expensive blur filters.
 */
export default function SectionBackground({ variant, className = '' }: SectionBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. HERO: Minimal Technical Grid & Blueprint Crosshairs */}
      {variant === 'hero' && (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] opacity-[0.12] dark:opacity-[0.18] [background-size:28px_28px]" />
          <div className="absolute top-8 left-8 font-dot text-[11px] tracking-widest text-muted-foreground-custom/40 hidden sm:block">
            + [SEC_01 // ARCHITECTURE]
          </div>
          <div className="absolute top-8 right-8 font-dot text-[11px] tracking-widest text-muted-foreground-custom/40 hidden sm:block">
            [SYS // ONLINE] +
          </div>
        </div>
      )}

      {/* 2. ABOUT: Engineering Blueprint Grid & Spec Indicator */}
      {variant === 'about' && (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] opacity-[0.04] dark:opacity-[0.06] [background-size:48px_48px]" />
          <div className="absolute top-12 right-8 flex items-center gap-2 opacity-25 dark:opacity-35 hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
            <span className="font-dot text-[11px] uppercase tracking-widest text-muted-foreground-custom">
              SECTION // 02 • BIOGRAPHY &amp; CAPABILITIES
            </span>
          </div>
        </div>
      )}

      {/* 3. SKILLS: Silicon Architecture & System Pipeline Backdrop */}
      {variant === 'skills' && (
        <div className="relative w-full h-full">
          <div className="absolute top-8 left-8 opacity-20 dark:opacity-30 font-dot text-[11px] hidden sm:block">
            <div className="border border-border-custom px-3 py-1.5 rounded-md bg-card-custom/50 text-muted-foreground-custom shadow-xs">
              <code>STACK // HARDWARE • NETWORKING • SOFTWARE</code>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROJECTS: Precision Registration Crosshairs & Viewport Framing */}
      {variant === 'projects' && (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] opacity-[0.08] dark:opacity-[0.14] [background-size:32px_32px]" />
          <div className="absolute top-6 left-6 font-mono text-xs opacity-25 text-muted-foreground-custom">+</div>
          <div className="absolute top-6 right-6 font-mono text-xs opacity-25 text-muted-foreground-custom">+</div>
          <div className="absolute bottom-6 left-6 font-mono text-xs opacity-25 text-muted-foreground-custom">+</div>
          <div className="absolute bottom-6 right-6 font-mono text-xs opacity-25 text-muted-foreground-custom">+</div>
        </div>
      )}

      {/* 5. CERTIFICATIONS: Concentric Telemetry Reticle & Verification Ring */}
      {variant === 'certifications' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute opacity-15 dark:opacity-20 origin-center pointer-events-none">
            <div className="w-64 h-64 sm:w-80 sm:h-80 border border-dashed border-border-custom rounded-full flex items-center justify-center p-6">
              <div className="w-full h-full border border-border-custom rounded-full flex flex-col items-center justify-center text-center p-3">
                <span className="font-dot text-[10px] uppercase tracking-widest text-muted-foreground-custom">
                  CREDENTIAL VALIDATION
                </span>
                <span className="font-dot text-[9px] text-primary-custom my-1">
                  OFFICIAL INDUSTRY CERTIFICATIONS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TESTIMONIALS: Subtle Endorsement Geometry */}
      {variant === 'testimonials' && (
        <div className="relative w-full h-full">
          <div className="absolute bottom-6 left-0 right-0 h-px bg-border-custom/40" />
        </div>
      )}

      {/* 7. CONTACT: Communication Protocol Grid */}
      {variant === 'contact' && (
        <div className="relative w-full h-full">
          <div className="absolute top-12 left-10 opacity-20 dark:opacity-30 pointer-events-none hidden sm:block">
            <div className="px-3 py-1.5 border border-border-custom rounded-md bg-card-custom/50 text-foreground-custom font-dot text-[11px]">
              <span className="text-primary-custom font-medium">DISPATCH // DIRECT INQUIRIES</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
