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
    <section id="certifications" className="pt-6 sm:pt-10 pb-16 sm:pb-20 relative">
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
                Verified Credentials &amp; Certifications
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Digitally verified credentials and certificates issued through Cisco, NC2, and industry programs.
            </p>
          </div>
        </ScrollReveal>

        {/* ─── Certificate & Badge Cards Grid ─── */}
        {/* Large picture/certificate preview, badge/cert code, issuing org, and title only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCerts.map((cert, idx) => (
            <ScrollReveal key={cert.id || idx} variant="fade-up" delay={idx * 50} className="h-full">
              <div
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCert(cert); }}
                aria-label={`View full certificate details for ${cert.title}`}
                className="bento-card p-5 sm:p-6 flex flex-col justify-between items-center text-center h-full group cursor-pointer hover:border-primary-custom/40 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-custom"
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

                  {/* Large Picture / Certificate Document Preview Container */}
                  <div className="w-full h-44 sm:h-48 my-3 rounded-2xl bg-foreground-custom/[0.02] border border-border-custom/60 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-primary-custom/30 transition-all">
                    <img
                      src={cert.badgeImage}
                      alt={cert.title}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain rounded-lg drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Subtle Preview Indicator overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-medium rounded-2xl backdrop-blur-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      <span>Preview</span>
                    </div>
                  </div>

                  {/* Title Only */}
                  <h3 className="text-sm sm:text-base font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors leading-snug line-clamp-2 px-1">
                    {cert.title}
                  </h3>
                </div>

                {/* Subtle Click Indicator Pill */}
                <div className="pt-3.5 mt-3 border-t border-border-custom/60 w-full flex items-center justify-center text-[10px] font-mono text-muted-foreground-custom group-hover:text-primary-custom transition-colors">
                  <span>Click to preview full certificate</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ─── Full Certificate & Badge Detail Modal (Large Preview) ─── */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl sm:max-w-3xl bento-card p-6 sm:p-8 bg-white dark:bg-[#0f111a] border border-border-custom rounded-3xl shadow-2xl flex flex-col gap-4 text-foreground-custom max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button in Top Right */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-foreground-custom/5 hover:bg-foreground-custom/15 text-foreground-custom flex items-center justify-center transition-colors cursor-pointer border border-border-custom z-10"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Large Certificate / Badge Viewport */}
            <div className="w-full max-h-[50vh] flex items-center justify-center bg-foreground-custom/[0.02] dark:bg-black/40 rounded-2xl border border-border-custom/70 p-3 sm:p-4 overflow-hidden shadow-inner">
              <img
                src={selectedCert.badgeImage}
                alt={selectedCert.title}
                className="max-h-[46vh] w-auto max-w-full object-contain rounded-lg drop-shadow-md"
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  VERIFIED CREDENTIAL
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
