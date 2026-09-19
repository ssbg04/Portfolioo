import React, { useState } from 'react';
import type { Project } from '../lib/data';
import ScrollReveal from './ScrollReveal';
import SectionBackground from './SectionBackground';

interface ProjectsProps {
  initialProjects: Project[];
  showArchiveLink?: boolean;
  limit?: number;
  sectionTag?: string;
}

export default function Projects({
  initialProjects,
  showArchiveLink = true,
  limit,
  sectionTag = 'Projects'
}: ProjectsProps) {
  const [filter, setFilter] = useState<string>('All');

  // Extract unique categories
  const categories = Array.from(
    new Set(initialProjects.map((p) => p.category).filter(Boolean) as string[])
  );
  const filterOptions = ['All', ...categories];

  const rawFilteredProjects = filter === 'All'
    ? initialProjects
    : initialProjects.filter((p) => p.category === filter || p.technologies.includes(filter));

  const filteredProjects = limit ? rawFilteredProjects.slice(0, limit) : rawFilteredProjects;

  const isAllView = filter === 'All';
  const flagshipProject = isAllView && filteredProjects.length > 0 ? filteredProjects[0] : null;
  const secondaryProjects = isAllView && filteredProjects.length > 0 ? filteredProjects.slice(1) : filteredProjects;

  return (
    <section id="projects" className={`${showArchiveLink ? 'py-16 sm:py-20' : 'pt-0 pb-12 sm:pb-16'} relative`}>
      <SectionBackground variant="projects" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className={showArchiveLink ? 'mb-10' : 'mb-6'}>
          {showArchiveLink && (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom tracking-tight">
                  Featured Work
                </h2>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className={`flex flex-wrap items-center gap-2 ${showArchiveLink ? 'mt-5' : ''}`}>
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-extrabold border-2 border-border-custom transition-all cursor-pointer ${
                  filter === opt
                    ? 'bg-[#facc15] text-black shadow-[3px_3px_0_0_var(--border-color)]'
                    : 'bg-card-custom text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#00f0ff] hover:text-black hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                }`}
              >
                {opt}
              </button>
            ))}

            {filter !== 'All' && !filterOptions.includes(filter) && (
              <button
                onClick={() => setFilter('All')}
                className="px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-extrabold bg-[#ff2a85] text-white border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)] flex items-center gap-1.5 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <span>Tag: {filter}</span>
                <span className="text-[10px]">✕</span>
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* FLAGSHIP HERO PROJECT                                          */}
        {/* ============================================================== */}
        {flagshipProject && (
          <ScrollReveal variant="fade-up" className="mb-8">
            <article className="bento-card p-6 sm:p-8 lg:p-10 border-2 sm:border-3 border-border-custom shadow-[6px_6px_0_0_var(--border-color)] group/hero">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Project Screenshot Viewport */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <a 
                    href={`/projects/${flagshipProject.slug}`}
                    className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border-2 sm:border-3 border-border-custom bg-muted-custom/20 shadow-[4px_4px_0_0_var(--border-color)] group/mockup block"
                    aria-label={`View ${flagshipProject.title}`}
                  >
                    {flagshipProject.status && (
                      <div className="absolute top-3.5 right-3.5 z-20 px-2.5 py-1 rounded-md bg-card-custom border-2 border-border-custom text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-[2px_2px_0_0_var(--border-color)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{flagshipProject.status}</span>
                      </div>
                    )}
                    {flagshipProject.coverImage ? (
                      <img
                        src={flagshipProject.coverImage}
                        alt={flagshipProject.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover/hero:scale-[1.02] transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-card-custom">
                        <span className="font-mono text-xs font-bold text-muted-foreground-custom">Preview Interface</span>
                      </div>
                    )}
                    {/* Hover overlay link hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 rounded-xl bg-[#facc15] text-black font-mono text-xs font-extrabold uppercase tracking-wider border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                        View Project
                      </span>
                    </div>
                  </a>

                  {/* Highlight Impact Pills (Below screenshot) */}
                  {flagshipProject.highlights && flagshipProject.highlights.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t-2 border-border-custom">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom font-bold mr-1">
                        Highlights:
                      </span>
                      {flagshipProject.highlights.map((h) => (
                        <span key={h} className="impact-pill">
                          <svg className="w-3 h-3 text-primary-custom flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Flagship Project Details & CTAs */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Eyebrow & Meta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#facc15] text-black border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)] text-[10px] font-mono font-extrabold uppercase tracking-wider">
                        {flagshipProject.category || 'Featured'}
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground-custom">
                        {flagshipProject.publishedAt || '2026'}
                      </span>
                    </div>

                    {/* Title */}
                    <a 
                      href={`/projects/${flagshipProject.slug}`} 
                      className="block group/title"
                    >
                      <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom group-hover/title:text-primary-custom transition-colors tracking-tight leading-snug">
                        {flagshipProject.title}
                      </h3>
                    </a>

                    {/* Summary */}
                    <p className="text-sm text-foreground-custom/85 leading-relaxed mt-3 mb-6 font-normal">
                      {flagshipProject.summary || flagshipProject.description}
                    </p>

                    {/* Technologies Tag Group */}
                    <div className="mb-6">
                      <span className="text-[11px] font-mono text-muted-foreground-custom block mb-2 font-bold uppercase tracking-wider">
                        Technologies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {flagshipProject.technologies.map((tech) => (
                          <button
                            key={tech}
                            onClick={() => setFilter(tech)}
                            className="tech-tag hover:border-primary-custom cursor-pointer"
                            title={`Filter by ${tech}`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Flagship Actions Footer with basic words */}
                  <div className="flex flex-wrap items-center gap-3 pt-5 border-t-2 border-border-custom">
                    <a
                      href={`/projects/${flagshipProject.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#facc15] text-black text-xs font-extrabold uppercase tracking-wider border-2 border-border-custom shadow-[3px_3px_0_0_var(--border-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                      View Project
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </a>

                    {flagshipProject.repositoryUrl && (
                      <a
                        href={flagshipProject.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-card-custom border-2 border-border-custom text-xs font-mono font-bold text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#00f0ff] hover:text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Code
                      </a>
                    )}

                    {flagshipProject.liveUrl && (
                      <a
                        href={flagshipProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-card-custom border-2 border-border-custom text-xs font-mono font-bold text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#22c55e] hover:text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ml-auto"
                      >
                        Demo ↗
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </article>
          </ScrollReveal>
        )}

        {/* ============================================================== */}
        {/* SECONDARY PROJECTS (Balanced 2-Column Bento Grid)              */}
        {/* ============================================================== */}
        {secondaryProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryProjects.map((project, idx) => {
              const itemNumber = isAllView ? idx + 2 : idx + 1;
              const formattedNumber = itemNumber < 10 ? `0${itemNumber}` : `${itemNumber}`;

              return (
                <ScrollReveal key={project.slug} variant="fade-up" delay={idx * 80}>
                  <article className="bento-card p-6 sm:p-7 flex flex-col justify-between h-full group">
                    <div>
                      {/* Project Screenshot Viewport for Secondary Cards */}
                      {project.coverImage ? (
                        <a 
                          href={`/projects/${project.slug}`}
                          className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border-2 border-border-custom bg-muted-custom/20 mb-5 group/submockup shadow-[3px_3px_0_0_var(--border-color)] block"
                          aria-label={`View ${project.title}`}
                        >
                          {project.status && (
                            <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-0.5 rounded-md bg-card-custom border-2 border-border-custom text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shadow-[1.5px_1.5px_0_0_var(--border-color)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{project.status}</span>
                            </div>
                          )}
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover/submockup:scale-[1.03] transition-transform duration-500 ease-out"
                          />
                          {/* Hover overlay hint */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/submockup:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                            <span className="px-3.5 py-1.5 rounded-lg bg-[#facc15] text-black font-mono text-xs font-extrabold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5">
                              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                              </svg>
                              View Project
                            </span>
                          </div>
                        </a>
                      ) : null}

                      {/* Header Meta */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-extrabold text-primary-custom">
                            #{formattedNumber}
                          </span>
                          {project.category && (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground-custom px-2 py-0.5 rounded-md bg-card-custom border border-border-custom shadow-[1px_1px_0_0_var(--border-color)]">
                              {project.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono font-bold text-muted-foreground-custom">
                          {project.publishedAt || '2026'}
                        </span>
                      </div>

                      {/* Title */}
                      <a 
                        href={`/projects/${project.slug}`}
                        className="block group/title"
                      >
                        <h3 className="text-xl font-bold font-heading text-foreground-custom group-hover/title:text-primary-custom transition-colors tracking-tight leading-snug mt-1">
                          {project.title}
                        </h3>
                      </a>

                      {/* Summary */}
                      <p className="text-sm text-foreground-custom/85 leading-relaxed mt-2.5 mb-4 font-normal">
                        {project.summary || project.description}
                      </p>

                      {/* Compact Impact Highlights if available */}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.highlights.slice(0, 2).map((h) => (
                            <span key={h} className="impact-pill text-[10px] py-0.5 px-2">
                              • {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Tech Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-5 pt-2">
                        {project.technologies.map((tech) => (
                          <button
                            key={tech}
                            onClick={() => setFilter(tech)}
                            className="tech-tag hover:border-primary-custom cursor-pointer"
                            title={`Filter by ${tech}`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>

                      {/* Action Links with basic words */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-border-custom">
                        <a
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#facc15] text-black text-xs font-extrabold uppercase tracking-wider border-2 border-border-custom shadow-[2px_2px_0_0_var(--border-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                        >
                          View Project
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </a>

                        <div className="flex items-center gap-2">
                          {project.repositoryUrl && (
                            <a
                              href={project.repositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-card-custom border-2 border-border-custom text-xs font-mono font-bold text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#00f0ff] hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                              title="View source code"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              Code
                            </a>
                          )}

                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-card-custom border-2 border-border-custom text-xs font-mono font-bold text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#22c55e] hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                            >
                              Demo ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Empty State when filter matches nothing */}
        {filteredProjects.length === 0 && (
          <div className="bento-card p-12 text-center my-8 border-2 border-border-custom shadow-[4px_4px_0_0_var(--border-color)]">
            <p className="text-muted-foreground-custom text-sm mb-4 font-mono font-semibold">
              No projects found matching the filter "{filter}".
            </p>
            <button
              onClick={() => setFilter('All')}
              className="px-5 py-2.5 rounded-xl bg-[#facc15] text-black text-xs font-extrabold uppercase tracking-wider border-2 border-border-custom shadow-[3px_3px_0_0_var(--border-color)] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Reset
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* ARCHIVE & REPOSITORY EXPLORATION CTA STRIP                     */}
        {/* ============================================================== */}
        {showArchiveLink && (
          <ScrollReveal variant="fade-up" className="mt-12">
            <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 border-2 sm:border-3 border-border-custom shadow-[6px_6px_0_0_var(--border-color)] bg-card-custom">
              <div className="text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-bold font-heading text-foreground-custom">
                  Looking for more prototypes and repositories?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground-custom mt-1">
                  Explore academic systems, utility scripts, and open-source contributions.
                </p>
              </div>
              <a
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#facc15] text-black border-2 border-border-custom shadow-[3px_3px_0_0_var(--border-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap"
              >
                All Projects
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}
