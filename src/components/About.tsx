import React from 'react';
import type { Experience, SiteSettings } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface AboutProps {
  settings: SiteSettings;
  experience: Experience[];
}

export default function About({ settings, experience }: AboutProps) {
  const paragraphs = (settings.biography && settings.biography.length > 0)
    ? settings.biography
    : [
        "I am an IT student majoring in Software Development. I write code to solve real-world problems.",
        "My primary stack includes PHP, React, Node.js, and MySQL. I enjoy database design, front-end development, and bug fixing."
      ];

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
                About &amp; Experience
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Academic background, engineering roles, and technical journey.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Biography */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            <ScrollReveal variant="fade-up">
              <div className="bento-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Open to Engineering Roles
                  </div>

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

                  <div className="pt-2">
                    <a
                      href={settings.resumeFile && settings.resumeFile !== '#' ? settings.resumeFile : '/Cris_Charles_Garcia_Resume.pdf'}
                      download="Cris_Charles_Garcia_Resume.pdf"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-custom text-white text-xs font-medium hover:bg-primary-custom/90 transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download Resume/CV
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Experience */}
          <div className="lg:col-span-7 flex flex-col gap-5 w-full">
            <ScrollReveal variant="fade-up" delay={80}>
              <div className="flex flex-col gap-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bento-card p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-2 pb-3 mb-3 border-b border-border-custom">
                      <div>
                        <h4 className="text-lg font-bold font-heading text-foreground-custom tracking-tight">
                          {exp.role}
                        </h4>
                        <p className="text-xs font-medium text-muted-foreground-custom mt-0.5">
                          {exp.company}
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
          </div>

        </div>
      </div>
    </section>
  );
}
