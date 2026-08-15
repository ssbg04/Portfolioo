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
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Section Title */}
        <ScrollReveal variant="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-glow bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom to-primary-custom">
            About & Experience
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-custom to-secondary-custom mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground-custom max-w-lg mx-auto font-medium">
            A background on my professional journey, education, and career milestones.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Biography Column */}
          <div className="lg:col-span-5 flex flex-col gap-8 items-center lg:items-start w-full">
            {/* Biography Card */}
            <ScrollReveal variant="fade-left" className="w-full">
              <div className="glass-card w-full p-7 rounded-[24px] border border-border-custom relative overflow-hidden">
                <h3 className="text-xl font-bold font-heading text-foreground-custom mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-custom" />
                  Biography
                </h3>
                
                <div className="flex flex-col gap-4 mb-8">
                  {paragraphs.map((paragraph, index) => (
                    <p 
                      key={index} 
                      className="text-sm md:text-base text-foreground-custom/90 leading-relaxed font-normal"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Quick Info Grid */}
                <div className="flex flex-col gap-3.5 border-t border-border-custom/50 pt-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-muted-foreground-custom">Location</span>
                    <span className="text-foreground-custom font-medium">{settings.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-muted-foreground-custom">Email</span>
                    <span className="text-primary-custom hover:underline font-medium">
                      <a href={`mailto:${settings.email}`}>{settings.email}</a>
                    </span>
                  </div>
                </div>

                {/* Resume Button */}
                <div className="mt-8">
                  {settings.resumeFile && settings.resumeFile !== '#' ? (
                    <a
                      href={settings.resumeFile}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-custom text-white font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform duration-250"
                      download
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download Resume
                    </a>
                  ) : (
                    <button
                      onClick={() => alert("Resume file is available upon request.")}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-custom text-white font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform duration-250 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download Resume
                    </button>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Work Experience Timeline */}
          <div className="lg:col-span-7 flex flex-col gap-8 w-full">
            <ScrollReveal variant="fade-right" className="w-full">
              <h3 className="text-xl font-bold font-heading text-foreground-custom mb-6 pl-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary-custom" />
                Work History
              </h3>
              
              <div className="relative border-l-2 border-border-custom ml-4 flex flex-col gap-8">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary-custom border-2 border-background-custom shadow-md group-hover:scale-125 transition-transform" />

                    {/* Company & Role */}
                    <div className="glass-card p-6 rounded-[20px] border border-border-custom">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-lg font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors">
                            {exp.role}
                          </h4>
                          <p className="text-sm font-semibold text-primary-custom">
                            {exp.company}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted-custom text-muted-foreground-custom border border-border-custom/50">
                          {exp.startDate} — {exp.endDate}
                        </span>
                      </div>

                      {/* Description points */}
                      <ul className="list-disc pl-4 flex flex-col gap-2 mb-4 text-sm text-foreground-custom/85 leading-relaxed">
                        {exp.description.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>

                      {/* Role Tech Tags */}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-custom/30">
                          {exp.technologies.map((t) => (
                            <span
                              key={t}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-custom/10 text-primary-custom border border-primary-custom/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
