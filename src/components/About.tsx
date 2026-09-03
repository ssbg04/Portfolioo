import React from 'react';
import type { Education, Experience, SiteSettings } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface AboutProps {
  settings: SiteSettings;
  experience: Experience[];
  education?: Education[];
}

export default function About({ settings, experience, education = [] }: AboutProps) {
  const paragraphs = (settings.biography && settings.biography.length > 0)
    ? settings.biography
    : [
        "I am an IT student majoring in Software Development. I write code to solve real-world problems.",
        "My primary stack includes PHP, React, Node.js, and MySQL. I enjoy database design, front-end development, and bug fixing."
      ];

  const resumeUrl = settings.resumeFile && settings.resumeFile !== '#' ? settings.resumeFile : '/CV-Cris-Charles-Garcia.pdf';

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                04 // Profile
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                About &amp; Background
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Academic background, engineering roles, and technical journey.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Biography & Identity */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            <ScrollReveal variant="fade-up">
              <div className="bento-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  {settings.isAvailable !== false && (
                    <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {settings.availabilityStatus || 'Open to Engineering Roles'}
                    </div>
                  )}

                  <h3 className="text-xl font-bold font-heading text-foreground-custom mb-3 tracking-tight">
                    {settings.fullName}
                  </h3>

                  <div className="flex flex-col gap-3 text-sm text-foreground-custom/85 leading-relaxed font-normal">
                    {paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="mt-6 pt-4 border-t border-border-custom flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-muted-foreground-custom">Location</span>
                    <span className="font-medium text-foreground-custom">{settings.location}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-muted-foreground-custom">Contact</span>
                    <a href={`mailto:${settings.email}`} className="font-mono text-primary-custom hover:underline truncate max-w-[200px]">
                      {settings.email}
                    </a>
                  </div>

                  {/* Dual Action: View and Download Resume/CV */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-custom text-white text-xs font-medium hover:bg-primary-custom/90 transition-all cursor-pointer text-center"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      View CV
                    </a>

                    <a
                      href={resumeUrl}
                      download="CV-Cris-Charles-Garcia.pdf"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border-custom hover:border-primary-custom/40 text-foreground-custom text-xs font-medium hover:bg-primary-custom/5 transition-all cursor-pointer text-center"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Experience & Education */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            {/* Experience Section */}
            {experience && experience.length > 0 && (
              <ScrollReveal variant="fade-up" delay={80}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground-custom font-semibold">
                      Work &amp; Engineering Experience
                    </h4>
                    <span className="text-[10px] font-mono text-primary-custom">{experience.length} roles</span>
                  </div>

                  {experience.map((exp, idx) => (
                    <div key={idx} className="bento-card p-6 sm:p-7">
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 mb-3 border-b border-border-custom">
                        <div>
                          <h4 className="text-lg font-bold font-heading text-foreground-custom tracking-tight">
                            {exp.role}
                          </h4>
                          <p className="text-xs font-medium text-muted-foreground-custom mt-0.5">
                            {exp.company} {exp.employmentType ? `• ${exp.employmentType}` : ''} {exp.location ? `(${exp.location})` : ''}
                          </p>
                        </div>

                        <span className="text-xs font-mono text-muted-foreground-custom">
                          {exp.startDate} — {exp.endDate}
                        </span>
                      </div>

                      <ul className="flex flex-col gap-2 mb-4 text-sm text-foreground-custom/85 leading-relaxed list-disc list-inside">
                        {exp.description.map((bullet, bIdx) => (
                          <li key={bIdx} className="font-normal">{bullet}</li>
                        ))}
                      </ul>

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="pt-3 border-t border-border-custom flex flex-wrap gap-1.5">
                          {exp.technologies.map((t) => (
                            <span key={t} className="tech-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* Education Section */}
            {education && education.length > 0 && (
              <ScrollReveal variant="fade-up" delay={120}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1 mt-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground-custom font-semibold">
                      Education &amp; Academic Background
                    </h4>
                    <span className="text-[10px] font-mono text-primary-custom">{education.length} credentials</span>
                  </div>

                  {education.map((edu, idx) => (
                    <div key={idx} className="bento-card p-6 sm:p-7">
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 mb-3 border-b border-border-custom">
                        <div>
                          <h4 className="text-lg font-bold font-heading text-foreground-custom tracking-tight">
                            {edu.degree}
                          </h4>
                          <p className="text-xs font-medium text-primary-custom mt-0.5">
                            {edu.fieldOfStudy ? `${edu.fieldOfStudy} • ` : ''}{edu.institution}
                          </p>
                        </div>

                        <span className="text-xs font-mono text-muted-foreground-custom">
                          {edu.startDate} — {edu.endDate}
                        </span>
                      </div>

                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="flex flex-col gap-2 text-sm text-foreground-custom/85 leading-relaxed list-disc list-inside">
                          {edu.achievements.map((item, aIdx) => (
                            <li key={aIdx} className="font-normal">{item}</li>
                          ))}
                        </ul>
                      )}

                      {edu.location && (
                        <div className="pt-3 mt-3 border-t border-border-custom text-[11px] font-mono text-muted-foreground-custom flex items-center gap-1.5">
                          <span>📍 {edu.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
