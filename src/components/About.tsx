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
    : [];

  const resumeUrl = settings.resumeFile && settings.resumeFile !== '#' ? settings.resumeFile : '/CV-Cris-Charles-Garcia.pdf';
  const profileAvatar = settings.heroImage || settings.logoImage || '/logo.png';

  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;

  return (
    <section id="about" className="py-12 sm:py-16 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                04 // Profile &amp; Background
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                About &amp; Background
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Professional history, educational credentials, and developer profile.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid: Only Sanity Studio managed content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Bento Cell 1: Biography & Narrative (8 cols) */}
          <div className="lg:col-span-8">
            <ScrollReveal variant="fade-up" className="h-full">
              <div className="bento-card p-6 sm:p-8 flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-border-custom">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-custom" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-primary-custom font-semibold">
                        Biography
                      </span>
                    </div>
                    {settings.isAvailable !== false && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {settings.availabilityStatus || 'Open to Opportunities'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom tracking-tight mb-4">
                    {settings.fullName}
                  </h3>

                  {paragraphs.length > 0 && (
                    <div className="flex flex-col gap-3.5 text-sm sm:text-base text-foreground-custom/85 leading-relaxed font-normal">
                      {paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="mt-8 pt-4 border-t border-border-custom flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground-custom font-mono">
                    Role: <span className="text-foreground-custom font-medium">{settings.title}</span>
                  </span>
                  <span className="font-mono text-primary-custom font-medium">
                    {settings.location}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Bento Cell 2: Identity & Verified Documents Hub (4 cols) */}
          <div className="lg:col-span-4">
            <ScrollReveal variant="fade-up" delay={60} className="h-full">
              <div className="bento-card p-6 sm:p-7 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-4 pb-4 mb-4 border-b border-border-custom">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border-custom shadow-xs bg-muted-custom/20 shrink-0">
                      <img
                        src={profileAvatar}
                        alt={settings.fullName}
                        loading="lazy"
                        decoding="async"
                        width="56"
                        height="56"
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold font-heading text-foreground-custom truncate">
                        {settings.fullName}
                      </h4>
                      <p className="text-xs font-mono text-primary-custom mt-0.5 truncate">
                        {settings.title}
                      </p>
                    </div>
                  </div>

                  {/* Fact Matrix */}
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
                      <span className="font-mono text-muted-foreground-custom">Location</span>
                      <span className="font-medium text-foreground-custom">{settings.location}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
                      <span className="font-mono text-muted-foreground-custom">Contact</span>
                      <a 
                        href={`mailto:${settings.email}`} 
                        className="font-mono text-primary-custom hover:underline truncate max-w-[170px]"
                        title={settings.email}
                      >
                        {settings.email}
                      </a>
                    </div>

                    {settings.availabilityStatus && (
                      <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
                        <span className="font-mono text-muted-foreground-custom">Status</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[170px]">
                          {settings.availabilityStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CV Action Buttons */}
                <div className="mt-6 pt-4 border-t border-border-custom flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom">
                    Curriculum Vitae
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary-custom text-white text-xs font-medium hover:bg-primary-custom/90 transition-all cursor-pointer text-center shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      View CV ↗
                    </a>

                    <a
                      href={resumeUrl}
                      download="CV-Cris-Charles-Garcia.pdf"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border-custom hover:border-primary-custom/40 text-foreground-custom text-xs font-medium hover:bg-primary-custom/5 transition-all cursor-pointer text-center"
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

          {/* Bento Cell 3: Experience (dynamically spans depending on presence of Education) */}
          {hasExperience && (
            <div className={hasEducation ? "lg:col-span-6" : "lg:col-span-12"}>
              <ScrollReveal variant="fade-up" delay={100} className="h-full">
                <div className="bento-card p-6 sm:p-8 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-5 border-b border-border-custom">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-primary-custom/10 text-primary-custom">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v1.069m7.5 0c.976.076 1.944.17 2.899.282m-13.298 0a48.45 48.45 0 0 1 2.899-.282m0 0a48.27 48.27 0 0 1 7.5 0" />
                          </svg>
                        </span>
                        <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-foreground-custom">
                          Work Experience
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-primary-custom px-2 py-0.5 rounded-full bg-primary-custom/10 border border-primary-custom/20">
                        {experience.length} {experience.length === 1 ? 'Role' : 'Roles'}
                      </span>
                    </div>

                    {experience.map((exp, idx) => (
                      <div key={idx} className={idx > 0 ? "pt-5 mt-5 border-t border-border-custom" : ""}>
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h5 className="text-base font-bold font-heading text-foreground-custom tracking-tight">
                              {exp.role}
                            </h5>
                            <p className="text-xs font-medium text-primary-custom mt-0.5">
                              {exp.company} {exp.employmentType ? `• ${exp.employmentType}` : ''} {exp.location ? `(${exp.location})` : ''}
                            </p>
                          </div>

                          <span className="text-[11px] font-mono text-muted-foreground-custom px-2 py-0.5 rounded-md bg-foreground-custom/5 border border-border-custom">
                            {exp.startDate} — {exp.endDate}
                          </span>
                        </div>

                        {exp.description && exp.description.length > 0 && (
                          <ul className="flex flex-col gap-1.5 my-3 text-xs sm:text-sm text-foreground-custom/85 leading-relaxed list-disc list-inside">
                            {exp.description.map((bullet, bIdx) => (
                              <li key={bIdx} className="font-normal">{bullet}</li>
                            ))}
                          </ul>
                        )}

                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {exp.technologies.map((t) => (
                              <span key={t} className="tech-tag text-[10px]">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Bento Cell 4: Education (dynamically spans depending on presence of Experience) */}
          {hasEducation && (
            <div className={hasExperience ? "lg:col-span-6" : "lg:col-span-12"}>
              <ScrollReveal variant="fade-up" delay={140} className="h-full">
                <div className="bento-card p-6 sm:p-8 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-5 border-b border-border-custom">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-primary-custom/10 text-primary-custom">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                          </svg>
                        </span>
                        <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-foreground-custom">
                          Education &amp; Academics
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-primary-custom px-2 py-0.5 rounded-full bg-primary-custom/10 border border-primary-custom/20">
                        {education.length} {education.length === 1 ? 'Degree' : 'Degrees'}
                      </span>
                    </div>

                    {education.map((edu, idx) => (
                      <div key={idx} className={idx > 0 ? "pt-5 mt-5 border-t border-border-custom" : ""}>
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h5 className="text-base font-bold font-heading text-foreground-custom tracking-tight">
                              {edu.degree}
                            </h5>
                            <p className="text-xs font-medium text-primary-custom mt-0.5">
                              {edu.fieldOfStudy ? `${edu.fieldOfStudy} • ` : ''}{edu.institution}
                            </p>
                          </div>

                          <span className="text-[11px] font-mono text-muted-foreground-custom px-2 py-0.5 rounded-md bg-foreground-custom/5 border border-border-custom">
                            {edu.startDate} — {edu.endDate}
                          </span>
                        </div>

                        {edu.achievements && edu.achievements.length > 0 && (
                          <ul className="flex flex-col gap-1.5 my-3 text-xs sm:text-sm text-foreground-custom/85 leading-relaxed list-disc list-inside">
                            {edu.achievements.map((item, aIdx) => (
                              <li key={aIdx} className="font-normal">{item}</li>
                            ))}
                          </ul>
                        )}

                        {edu.location && (
                          <div className="pt-2 text-[11px] font-mono text-muted-foreground-custom flex items-center gap-1.5">
                            <span>📍 {edu.location}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
