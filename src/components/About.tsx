import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Education, Experience, SiteSettings } from '../lib/data';
import GithubContributions from './GithubContributions';
import LocalTimeWeather from './LocalTimeWeather';

interface AboutProps {
  settings: SiteSettings;
  experience: Experience[];
  education?: Education[];
  sectionTag?: string;
  githubUsername?: string;
  isPage?: boolean;
  isCompact?: boolean;
}

export default function About({
  settings,
  experience,
  education = [],
  sectionTag = '04 — background',
  githubUsername = 'ssbg04',
  isPage = false,
  isCompact = false
}: AboutProps) {
  const paragraphs = (settings.biography && settings.biography.length > 0)
    ? settings.biography
    : [];

  const resumeUrl = settings.resumeFile && settings.resumeFile !== '#' ? settings.resumeFile : '/CV-Cris-Charles-Garcia.pdf';
  const profileAvatar = settings.heroImage || settings.logoImage || '/logo.png';

  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;

  // CV Preview Modal & Download States
  const [mounted, setMounted] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewOpen]);

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isDownloading) return;
    setIsDownloading(true);

    const filename = 'CV-Cris-Charles-Garcia.pdf';
    try {
      let targetUrl = resumeUrl;
      if (targetUrl.includes('cdn.sanity.io')) {
        const sep = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${sep}dl=${encodeURIComponent(filename)}`;
      }

      const response = await fetch(targetUrl, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      let fallbackUrl = resumeUrl;
      if (fallbackUrl.includes('cdn.sanity.io')) {
        const sep = fallbackUrl.includes('?') ? '&' : '?';
        fallbackUrl = `${fallbackUrl}${sep}dl=${encodeURIComponent(filename)}`;
      }
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section id="about" className="py-12 sm:py-16 border-b border-border-custom bryl-entrance stagger-4">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="pb-4 mb-6 sm:mb-8 border-b border-border-custom">
          <span className="section-marker mb-1 block">
            {sectionTag.toLowerCase()}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground-custom lowercase">
            experience &amp; background
          </h2>
        </div>

        {/* Narrative & Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">

          {/* Biography Block */}
          <div className="md:col-span-8">
            <div className="bryl-card p-6 sm:p-7 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    engineering biography
                  </span>
                  {settings.isAvailable !== false && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-custom">
                      ● active
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3.5 text-[14px] sm:text-[15px] leading-relaxed text-foreground-custom/90">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-custom flex items-center justify-between text-xs font-mono text-muted-foreground-custom">
                <span>{settings.title}</span>
                <span>{settings.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Info & Document Card */}
          <div className="md:col-span-4">
            <div className="bryl-card p-5 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border-custom">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-border-custom bg-elevated-custom shrink-0">
                    <img
                      src={profileAvatar}
                      alt={settings.fullName}
                      loading="lazy"
                      width="48"
                      height="48"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground-custom truncate">
                      {settings.fullName.toLowerCase()}
                    </h3>
                    <p className="text-[11px] font-mono text-muted-foreground-custom truncate">
                      laguna, ph
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-border-custom">
                    <span className="text-muted-foreground-custom uppercase tracking-wider text-[10px]">Location</span>
                    <span className="text-foreground-custom truncate max-w-[140px]">{settings.location}</span>
                  </div>

                  <LocalTimeWeather latitude={14.130792771445167} longitude={121.43629230199042} />

                  <div className="flex justify-between items-center py-1 border-b border-border-custom">
                    <span className="text-muted-foreground-custom uppercase tracking-wider text-[10px]">Email</span>
                    <a href={`mailto:${settings.email}`} className="text-foreground-custom hover:underline truncate max-w-[140px]">
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* CV Action */}
              <div className="mt-6 pt-4 border-t border-border-custom flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                  curriculum vitae
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="bryl-btn-secondary justify-center text-xs text-center cursor-pointer"
                  >
                    view ↗
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bryl-btn-primary justify-center text-xs text-center cursor-pointer disabled:opacity-60"
                  >
                    {isDownloading ? 'saving...' : 'download ↗'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience Timeline */}
          {!isCompact && hasExperience && (
            <div className="md:col-span-12 mt-2">
              <div className="bryl-card p-6 sm:p-7">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    professional experience
                  </span>
                  <span className="text-[10px] font-mono text-subtle-custom">
                    {experience.length} roles
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-6 border-t border-border-custom" : ""}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-foreground-custom">
                            {exp.role}
                          </h4>
                          <p className="text-xs font-mono text-muted-foreground-custom mt-0.5">
                            {exp.company} {exp.employmentType ? `· ${exp.employmentType}` : ''} {exp.location ? `· ${exp.location}` : ''}
                          </p>
                        </div>

                        <span className="text-[11px] font-mono text-subtle-custom">
                          {exp.startDate} — {exp.endDate}
                        </span>
                      </div>

                      {exp.description && exp.description.length > 0 && (
                        <ul className="flex flex-col gap-1.5 my-3 text-[14px] leading-relaxed text-foreground-custom/85 list-disc list-inside">
                          {exp.description.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )}

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {exp.technologies.map((t) => (
                            <span key={t} className="tech-tag text-[9px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education Block */}
          {!isCompact && hasEducation && (
            <div className="md:col-span-12">
              <div className="bryl-card p-6 sm:p-7">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    education &amp; academic history
                  </span>
                  <span className="text-[10px] font-mono text-subtle-custom">
                    {education.length} credentials
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {education.map((edu, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-6 border-t border-border-custom" : ""}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-foreground-custom">
                            {edu.degree}
                          </h4>
                          <p className="text-xs font-mono text-muted-foreground-custom mt-0.5">
                            {edu.fieldOfStudy ? `${edu.fieldOfStudy} · ` : ''}{edu.institution}
                          </p>
                        </div>

                        <span className="text-[11px] font-mono text-subtle-custom">
                          {edu.startDate} — {edu.endDate}
                        </span>
                      </div>

                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="flex flex-col gap-1.5 my-3 text-[14px] leading-relaxed text-foreground-custom/85 list-disc list-inside">
                          {edu.achievements.map((item, aIdx) => (
                            <li key={aIdx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GitHub Contributions Graph */}
          {githubUsername && (
            <div className="md:col-span-12">
              <GithubContributions username={githubUsername} />
            </div>
          )}

        </div>
      </div>

      {/* CV Preview Modal (bryl-minimal spec: 16px radius, hairline border, escape closes) */}
      {mounted && isPreviewOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="CV Preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-background-custom border border-border-custom rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground-custom">
                curriculum vitae preview
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom px-2 py-1"
              >
                close [esc]
              </button>
            </div>

            <div className="flex-1 w-full min-h-[60vh] rounded-xl overflow-hidden border border-border-custom bg-elevated-custom">
              <iframe
                src={`${resumeUrl}#toolbar=0`}
                title="Curriculum Vitae Preview"
                className="w-full h-full min-h-[60vh] border-0"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
