import React, { useState } from 'react';
import type { Project } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface ProjectsProps {
  initialProjects: Project[];
}

export default function Projects({ initialProjects }: ProjectsProps) {
  const [filter, setFilter] = useState<string>('All');
  const allTechs = ['All', ...new Set(initialProjects.flatMap((p) => p.technologies))];

  const filteredProjects = filter === 'All'
    ? initialProjects
    : initialProjects.filter((p) => p.technologies.includes(filter));

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                01 // Projects
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Featured Work
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Engineering solutions, record systems, and interactive applications.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5">
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  filter === tech
                    ? 'bg-primary-custom text-white font-medium shadow-xs'
                    : 'text-muted-foreground-custom hover:text-foreground-custom border border-border-custom hover:border-primary-custom/30'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Projects Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {filteredProjects.map((project, idx) => {
            const isFeatured = idx === 0 && filter === 'All';

            return (
              <div
                key={project.slug}
                className={`${isFeatured ? 'lg:col-span-12' : 'lg:col-span-6'}`}
              >
                <ScrollReveal variant="fade-up" delay={idx * 60}>
                  <article
                    className={`bento-card p-6 sm:p-8 flex flex-col justify-between h-full group ${
                      isFeatured ? 'lg:grid lg:grid-cols-12 lg:gap-8' : ''
                    }`}
                  >
                    {/* Featured Image Column */}
                    {isFeatured && (
                      <div className="lg:col-span-7 flex flex-col justify-between mb-6 lg:mb-0">
                        {project.coverImage ? (
                          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border-custom">
                            <img
                              src={project.coverImage}
                              alt={project.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {project.status || 'LIVE PRODUCTION'}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Content Body */}
                    <div className={`flex flex-col justify-between ${isFeatured ? 'lg:col-span-5' : ''}`}>
                      <div>
                        {/* Standard card image preview */}
                        {!isFeatured && project.coverImage && (
                          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border-custom mb-4">
                            <img
                              src={project.coverImage}
                              alt={project.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                            {project.status && (
                              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                {project.status}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Meta header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono text-muted-foreground-custom">
                            0{idx + 1}
                          </span>
                          <span className="text-[11px] font-mono text-primary-custom">
                            {project.publishedAt || '2026'}
                          </span>
                        </div>

                        {/* Title */}
                        <a href={`/projects/${project.slug}`} className="group/title block">
                          <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground-custom group-hover/title:text-primary-custom transition-colors tracking-tight leading-snug">
                            {project.title}
                          </h3>
                        </a>

                        {/* Summary */}
                        <p className="text-sm text-muted-foreground-custom leading-relaxed mt-2.5 mb-5 font-normal">
                          {project.summary || project.description}
                        </p>
                      </div>

                      <div>
                        {/* Tech Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-3 pt-3 border-t border-border-custom">
                          {project.repositoryUrl && (
                            <a
                              href={project.repositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-foreground-custom hover:text-primary-custom transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              Repository
                            </a>
                          )}

                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-primary-custom hover:underline ml-auto"
                            >
                              Open Demo ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
