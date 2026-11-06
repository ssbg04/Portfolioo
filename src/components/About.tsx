import React from 'react';
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
  // On homepage (!isPage), show at most 2 sharp paragraphs to maintain tight vertical rhythm
  const rawParagraphs = (settings.biography && settings.biography.length > 0)
    ? settings.biography
    : [];
  const paragraphs = isPage ? rawParagraphs : rawParagraphs.slice(0, 2);

  const resumeUrl = settings.resumeFile && settings.resumeFile !== '#' ? settings.resumeFile : '/CV-Cris-Charles-Garcia.pdf';
  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;

  return (
    <section id="about" className="py-12 sm:py-16 border-b border-border-custom bryl-entrance stagger-4">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="pb-4 mb-6 sm:mb-8 border-b border-border-custom">
          <span className="section-marker mb-1 block">
            {sectionTag}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground-custom">
            Experience &amp; Background
          </h2>
        </div>

        {/* Narrative & Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">

          {/* Biography Block */}
          <div className="md:col-span-8">
            <div className="bryl-card p-5 sm:p-7 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    engineering biography
                  </span>
                  {settings.isAvailable !== false && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-custom flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground-custom animate-pulse opacity-80" />
                      available for hire
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3.5 text-[14px] sm:text-[15px] leading-relaxed text-foreground-custom/90">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-custom flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground-custom">
                <span className="truncate">{settings.title}</span>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-custom hover:underline inline-flex items-center gap-1"
                >
                  <span>curriculum vitae</span>
                  <span className="text-[10px]" aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Environment & Live Telemetry Card */}
          <div className="md:col-span-4">
            <div className="bryl-card p-5 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    environment
                  </span>
                  <span className="text-[10px] font-mono text-subtle-custom">
                    UTC+8
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
                    <span className="font-mono text-muted-foreground-custom">Location</span>
                    <span className="font-mono text-foreground-custom text-xs font-medium truncate max-w-[150px]">
                      {settings.location}
                    </span>
                  </div>

                  <LocalTimeWeather latitude={14.130792771445167} longitude={121.43629230199042} />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-custom">
                <span className="text-[10px] font-mono uppercase tracking-widest text-subtle-custom block mb-1">
                  direct inquiries:
                </span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-xs font-mono text-foreground-custom hover:underline truncate block"
                >
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Work Experience Timeline */}
          {!isCompact && hasExperience && (
            <div className="md:col-span-12">
              <div className="bryl-card p-5 sm:p-7">
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    professional experience
                  </span>
                  <span className="text-[10px] font-mono text-subtle-custom">
                    {experience.length} roles
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  {experience.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-5 border-t border-border-custom" : ""}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold text-foreground-custom">
                            {exp.role}
                          </h4>
                          <p className="text-xs font-mono text-muted-foreground-custom mt-0.5">
                            {exp.company} {exp.employmentType ? `· ${exp.employmentType}` : ''} {exp.location ? `· ${exp.location}` : ''}
                          </p>
                        </div>

                        <span className="text-[11px] font-mono text-subtle-custom shrink-0">
                          {exp.startDate} — {exp.endDate}
                        </span>
                      </div>

                      {/* On dedicated /about page, show full detailed bullets. On home, keep streamlined */}
                      {isPage && exp.description && exp.description.length > 0 && (
                        <ul className="flex flex-col gap-1.5 my-3 text-[13px] sm:text-[14px] leading-relaxed text-foreground-custom/85 list-disc list-inside">
                          {exp.description.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )}

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1.5">
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
              <div className="bryl-card p-5 sm:p-7">
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-border-custom">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                    education &amp; academic history
                  </span>
                  <span className="text-[10px] font-mono text-subtle-custom">
                    {education.length} credentials
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  {education.map((edu, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-5 border-t border-border-custom" : ""}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold text-foreground-custom">
                            {edu.degree}
                          </h4>
                          <p className="text-xs font-mono text-muted-foreground-custom mt-0.5">
                            {edu.fieldOfStudy ? `${edu.fieldOfStudy} · ` : ''}{edu.institution}
                          </p>
                        </div>

                        <span className="text-[11px] font-mono text-subtle-custom shrink-0">
                          {edu.startDate} — {edu.endDate}
                        </span>
                      </div>

                      {isPage && edu.achievements && edu.achievements.length > 0 && (
                        <ul className="flex flex-col gap-1.5 my-2.5 text-[13px] sm:text-[14px] leading-relaxed text-foreground-custom/85 list-disc list-inside">
                          {edu.achievements.map((item, aIdx) => (
                            <li key={aIdx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {!isPage && (
                  <div className="mt-5 pt-4 border-t border-border-custom">
                    <a
                      href="/about"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors bryl-link"
                    >
                      <span>View Complete Biography &amp; Coursework</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                )}
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
    </section>
  );
}
