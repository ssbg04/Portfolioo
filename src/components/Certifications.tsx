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
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCert]);

  const getVerifyButtonLabel = (cert: Certification) => {
    if (!cert.badgeUrl) return 'Verify Credential ↗';
    if (cert.badgeUrl.includes('credly.com')) return 'Verify on Credly ↗';
    if (cert.issuer) return `Verify on ${cert.issuer} ↗`;
    return 'Verify Credential ↗';
  };

  return (
    <section id="certifications" className="py-20 relative">
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
                Verified Credentials
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Digitally verified credentials issued through Cisco and industry partners.
            </p>
          </div>
        </ScrollReveal>

        {/* ─── Redesigned Certificate Cards Grid ─── */}
        {/* Large picture, badge/cert code, issuing org, and title only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allCerts.map((cert, idx) => (
            <ScrollReveal key={cert.id || idx} variant="fade-up" delay={idx * 40} className="h-full">
              <div
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCert(cert); }}
                aria-label={`View details for ${cert.title}`}
                className="bento-card p-6 flex flex-col justify-between items-center text-center h-full group cursor-pointer hover:border-primary-custom/40 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
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

                  {/* Large Picture / Badge */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 my-4 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={cert.badgeImage}
                      alt={cert.title}
                      loading="lazy"
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  </div>

                  {/* Title Only */}
                  <h3 className="text-sm sm:text-base font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors leading-snug line-clamp-2 px-1">
                    {cert.title}
                  </h3>
                </div>

                {/* Subtle Click Indicator Pill */}
                <div className="pt-4 mt-4 border-t border-border-custom/60 w-full flex items-center justify-center text-[10px] font-mono text-muted-foreground-custom group-hover:text-primary-custom transition-colors">
                  <span>Click to view credential info</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ─── Full Certificate Detail Modal ─── */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg bento-card p-6 sm:p-8 bg-white dark:bg-[#0f111a] border border-border-custom rounded-3xl shadow-2xl flex flex-col gap-5 text-foreground-custom max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button in Top Right */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-foreground-custom/5 hover:bg-foreground-custom/15 text-foreground-custom flex items-center justify-center transition-colors cursor-pointer border border-border-custom"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Modal Header: Badge + Title + Issuer + Code */}
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center p-2">
                <img
                  src={selectedCert.badgeImage}
                  alt={selectedCert.title}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  VERIFIED CREDENTIAL
                </span>
                <span className="text-[10px] font-mono text-muted-foreground-custom px-2 py-0.5 rounded-full bg-foreground-custom/5 border border-border-custom">
                  #{selectedCert.code}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground-custom leading-tight px-2">
                {selectedCert.title}
              </h3>

              <p className="text-xs font-mono text-primary-custom font-medium">
                Issued by {selectedCert.issuer}
                {selectedCert.issueDate ? ` • ${selectedCert.issueDate}` : ''}
              </p>
            </div>

            {/* Full Description */}
            {selectedCert.description && (
              <div className="p-3.5 rounded-2xl bg-foreground-custom/[0.03] border border-border-custom text-xs text-foreground-custom/90 leading-relaxed text-center sm:text-left">
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
                    <span key={s} className="tech-tag text-[10px]">
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
                onClick={() => setSelectedCert(null)}
                className="py-2.5 px-4 rounded-xl border border-border-custom text-xs font-semibold text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
