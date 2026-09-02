import React, { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { mockCertifications, type Certification } from '../lib/data';

interface Props {
  certifications?: Certification[];
  extraCerts?: Certification[];
}

export default function Certifications({ certifications, extraCerts = [] }: Props) {
  const baseCerts = (certifications && certifications.length > 0) ? certifications : mockCertifications;
  const allCerts = [...baseCerts, ...extraCerts];
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCert(null);
    };
    if (selectedCert) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCert]);

  return (
    <section id="certifications" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                02 // Certifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Verified Credentials
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Digitally verified credentials issued through Cisco and industry partners.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {allCerts.map((cert, idx) => (
            <ScrollReveal key={cert.id} variant="fade-up" delay={idx * 50}>
              <div
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCert(cert); }}
                className="bento-card p-5 flex flex-col justify-between h-full group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
                aria-label={`View details for ${cert.title}`}
              >
                <div>
                  {/* Top Bar: Code & Issuer */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-muted-foreground-custom">
                      #{cert.code}
                    </span>
                    <span className="text-[10px] font-mono text-primary-custom font-medium">
                      {cert.issuer}
                    </span>
                  </div>

                  {/* Badge Preview */}
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={cert.badgeImage}
                      alt={cert.title}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors leading-snug">
                    {cert.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground-custom leading-relaxed mt-2 line-clamp-3 font-normal">
                    {cert.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 mt-4 border-t border-border-custom flex items-center justify-between">
                  <span className="text-[11px] font-mono text-primary-custom">
                    Details
                  </span>
                  <span className="text-xs text-primary-custom group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ── Credential Detail Modal ── */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg bento-card p-6 sm:p-7 bg-card-custom dark:bg-[#0f111a] border border-border-custom rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 w-7 h-7 rounded-full bg-foreground-custom/5 hover:bg-foreground-custom/10 text-foreground-custom flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="flex flex-col gap-4 pt-1">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  <img
                    src={selectedCert.badgeImage}
                    alt={selectedCert.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      CREDLY VERIFIED
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-foreground-custom leading-tight">
                    {selectedCert.title}
                  </h3>
                  <p className="text-xs text-muted-foreground-custom mt-0.5">
                    Issued by {selectedCert.issuer}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-foreground-custom/85">
                {selectedCert.description}
              </p>

              {selectedCert.skills && (
                <div>
                  <p className="text-[11px] font-mono text-muted-foreground-custom uppercase tracking-wider mb-2">
                    Validated Competencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCert.skills.map((s) => (
                      <span key={s} className="tech-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border-custom flex gap-3">
                <a
                  href={selectedCert.badgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-4 rounded-xl bg-primary-custom text-white font-medium text-xs text-center hover:bg-primary-custom/90 transition-all flex items-center justify-center gap-1"
                >
                  Verify on Credly ↗
                </a>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="py-2 px-4 rounded-xl border border-border-custom text-xs text-muted-foreground-custom hover:text-foreground-custom transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
