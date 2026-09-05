import React, { useState, useEffect } from 'react';
import type { Project } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface ProjectsProps {
  initialProjects: Project[];
  showArchiveLink?: boolean;
  limit?: number;
}

export default function Projects({ initialProjects, showArchiveLink = true, limit }: ProjectsProps) {
  const [filter, setFilter] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  // Synchronize active preview image and lock body scroll when modal opens
  useEffect(() => {
    if (selectedProject) {
      setActiveImage(selectedProject.coverImage || '');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Compile all images for the selected project (cover + gallery)
  const modalImages = selectedProject
    ? [selectedProject.coverImage, ...(selectedProject.gallery || [])].filter(Boolean) as string[]
    : [];

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-pulse" />
                01 // Projects
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Featured Work
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Production systems, institutional database platforms, and full-stack solutions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  filter === opt
                    ? 'bg-primary-custom text-white font-semibold shadow-sm'
                    : 'text-muted-foreground-custom hover:text-foreground-custom border border-border-custom hover:border-primary-custom/40 bg-card-custom'
                }`}
              >
                {opt}
              </button>
            ))}

            {filter !== 'All' && !filterOptions.includes(filter) && (
              <button
                onClick={() => setFilter('All')}
                className="px-3 py-1 rounded-full text-xs font-mono bg-primary-custom/10 text-primary-custom border border-primary-custom/30 flex items-center gap-1 cursor-pointer"
              >
                <span>Tag: {filter}</span>
                <span className="text-[10px]">✕</span>
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* FLAGSHIP HERO PROJECT (Option 1 - Full Width Showcase)        */}
        {/* ============================================================== */}
        {flagshipProject && (
          <ScrollReveal variant="fade-up" className="mb-8">
            <article 
              onClick={() => setSelectedProject(flagshipProject)}
              className="bento-card p-6 sm:p-8 lg:p-10 border border-border-custom hover:border-primary-custom/40 transition-all duration-300 cursor-pointer group/hero"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Interactive Browser Mockup Window */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div className="browser-frame shadow-xl group/mockup relative">
                    {/* Simulated Browser Chrome Top Header with Lock & .local/dashboard */}
                    <div className="browser-header">
                      {/* Traffic Lights */}
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 inline-block" />
                      </div>

                      {/* Mockup Address Bar */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-background-custom/80 border border-border-custom text-[11px] font-mono text-muted-foreground-custom truncate max-w-[220px] sm:max-w-[280px]">
                        <svg className="w-2.5 h-2.5 text-primary-custom flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{flagshipProject.slug}.local/dashboard</span>
                      </div>

                      {/* Status Indicator */}
                      <div className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="hidden sm:inline">{flagshipProject.status || 'LIVE PRODUCTION'}</span>
                        <span className="sm:hidden">LIVE</span>
                      </div>
                    </div>

                    {/* Screenshot Viewport with Hover Overlay */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted-custom/30">
                      {flagshipProject.coverImage ? (
                        <img
                          src={flagshipProject.coverImage}
                          alt={flagshipProject.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover/hero:scale-[1.02] transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary-custom/10 to-transparent">
                          <span className="font-mono text-xs text-muted-foreground-custom">Preview Interface</span>
                        </div>
                      )}
                      {/* Click to inspect overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-full bg-background-custom/90 text-foreground-custom font-mono text-xs font-semibold backdrop-blur-sm shadow-md flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-primary-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                          Click to View Details
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Highlight Impact Pills (Below screenshot) */}
                  {flagshipProject.highlights && flagshipProject.highlights.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border-custom/50">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom mr-1">
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
                      <span className="px-2.5 py-1 rounded-md bg-primary-custom/10 border border-primary-custom/20 text-[10px] font-mono font-semibold uppercase tracking-wider text-primary-custom">
                        {flagshipProject.category || 'Flagship Project'}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground-custom">
                        {flagshipProject.publishedAt || '2026'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom group-hover/hero:text-primary-custom transition-colors tracking-tight leading-snug">
                      {flagshipProject.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground-custom leading-relaxed mt-3 mb-6 font-normal">
                      {flagshipProject.summary || flagshipProject.description}
                    </p>

                    {/* Technologies Tag Group */}
                    <div className="mb-6">
                      <span className="text-[11px] font-mono text-muted-foreground-custom block mb-2 font-medium">
                        Technologies Deployed
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {flagshipProject.technologies.map((tech) => (
                          <button
                            key={tech}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilter(tech);
                            }}
                            className="tech-tag hover:border-primary-custom cursor-pointer"
                            title={`Filter by ${tech}`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Flagship Actions Footer */}
                  <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-border-custom">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(flagshipProject);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-custom text-white text-xs font-semibold hover:bg-primary-custom/90 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Inspect Overview
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>

                    {flagshipProject.repositoryUrl && (
                      <a
                        href={flagshipProject.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border-custom hover:border-primary-custom/40 text-xs font-mono font-medium text-foreground-custom hover:text-primary-custom transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Source
                      </a>
                    )}

                    {flagshipProject.liveUrl && (
                      <a
                        href={flagshipProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-mono font-medium text-primary-custom hover:underline ml-auto"
                      >
                        Live Demo ↗
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
                  <article 
                    onClick={() => setSelectedProject(project)}
                    className="bento-card p-6 sm:p-7 flex flex-col justify-between h-full group hover:border-primary-custom/40 transition-all duration-300 cursor-pointer"
                  >
                    <div>
                      {/* Browser Mockup Window for Secondary Cards with Lock & .local */}
                      {project.coverImage ? (
                        <div className="browser-frame mb-5 group/submockup">
                          <div className="browser-header py-1.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#ff5f56]/70 inline-block" />
                              <span className="w-2 h-2 rounded-full bg-[#ffbd2e]/70 inline-block" />
                              <span className="w-2 h-2 rounded-full bg-[#27c93f]/70 inline-block" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground-custom/80 ml-2 truncate max-w-[170px] sm:max-w-[210px]">
                              <svg className="w-2 h-2 text-primary-custom flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{project.slug}.local</span>
                            </div>
                            {project.status && (
                              <div className="ml-auto px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-mono text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                {project.status}
                              </div>
                            )}
                          </div>
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted-custom/20">
                            <img
                              src={project.coverImage}
                              alt={project.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover/submockup:scale-[1.03] transition-transform duration-500 ease-out"
                            />
                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                              <span className="px-3 py-1 rounded-full bg-background-custom/90 text-foreground-custom font-mono text-[11px] font-medium backdrop-blur-sm shadow-sm">
                                View Details ↗
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Header Meta */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold text-primary-custom">
                            {formattedNumber}
                          </span>
                          {project.category && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom px-2 py-0.5 rounded bg-muted-custom/40 border border-border-custom/50">
                              {project.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground-custom">
                          {project.publishedAt || '2026'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors tracking-tight leading-snug mt-1">
                        {project.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-sm text-muted-foreground-custom leading-relaxed mt-2.5 mb-4 font-normal">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilter(tech);
                            }}
                            className="tech-tag hover:border-primary-custom cursor-pointer"
                            title={`Filter by ${tech}`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-custom">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground-custom hover:text-primary-custom transition-colors cursor-pointer"
                        >
                          Quick View
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-3">
                          {project.repositoryUrl && (
                            <a
                              href={project.repositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors inline-flex items-center gap-1"
                              title="View source repository"
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
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-mono font-medium text-primary-custom hover:underline"
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
          <div className="bento-card p-12 text-center my-8">
            <p className="text-muted-foreground-custom text-sm mb-4">
              No projects found matching the filter "{filter}".
            </p>
            <button
              onClick={() => setFilter('All')}
              className="px-4 py-2 rounded-xl bg-primary-custom text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* ARCHIVE & REPOSITORY EXPLORATION CTA STRIP                     */}
        {/* ============================================================== */}
        {showArchiveLink && (
          <ScrollReveal variant="fade-up" className="mt-12">
            <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 border border-border-custom bg-gradient-to-r from-muted-custom/40 via-card-custom to-primary-custom/5">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background-custom border border-border-custom hover:border-primary-custom/40 text-foreground-custom text-xs font-semibold hover:text-primary-custom transition-all shadow-xs hover:shadow whitespace-nowrap"
              >
                Explore Full Directory
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </ScrollReveal>
        )}

      </div>

      {/* ============================================================== */}
      {/* SPLIT MODAL: Left Screenshot Overview | Right Project Details   */}
      {/* ============================================================== */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-md animate-modal-fade"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} Details`}
        >
          <div 
            className="relative w-full max-w-5xl max-h-[90vh] bg-background-custom border border-border-custom shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row animate-modal-scale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button (top right) */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-background-custom/90 border border-border-custom hover:border-primary-custom/40 text-foreground-custom flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* LEFT COLUMN: Screenshot Overview & Gallery */}
            <div className="w-full md:w-7/12 bg-muted-custom/25 border-b md:border-b-0 md:border-r border-border-custom p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
              <div>
                {/* Browser Frame Mockup with lock icon & .local */}
                <div className="browser-frame shadow-xl overflow-hidden mb-4">
                  <div className="browser-header">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 inline-block" />
                    </div>

                    {/* Address bar with lock */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-background-custom/80 border border-border-custom text-[11px] font-mono text-muted-foreground-custom truncate max-w-[200px] sm:max-w-[260px]">
                      <svg className="w-2.5 h-2.5 text-primary-custom flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{selectedProject.slug}.local/dashboard</span>
                    </div>

                    {/* Status Pill */}
                    {selectedProject.status && (
                      <div className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{selectedProject.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Main Large Image Viewport */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-6 text-center text-muted-foreground-custom font-mono text-xs">
                        No Screenshot Preview Available
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Thumbnails Carousel if multiple images exist */}
                {modalImages.length > 1 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom block mb-2">
                      Gallery Previews ({modalImages.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {modalImages.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(imgUrl)}
                          className={`relative w-16 h-11 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                            activeImage === imgUrl 
                              ? 'border-primary-custom scale-105 shadow-md' 
                              : 'border-border-custom opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom metadata tags */}
              <div className="mt-4 pt-3 border-t border-border-custom/50 flex items-center justify-between text-xs text-muted-foreground-custom">
                <span className="font-mono text-[11px]">Published: {selectedProject.publishedAt || '2026'}</span>
                <span className="font-mono text-[11px] text-primary-custom">{selectedProject.order ? `Order #${selectedProject.order}` : ''}</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Project Information Details */}
            <div className="w-full md:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
              <div>
                {/* Header Category & Published Year */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-primary-custom/10 border border-primary-custom/20 text-[10px] font-mono font-semibold uppercase tracking-wider text-primary-custom">
                    {selectedProject.category || 'Project Showcase'}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground-custom">
                    {selectedProject.publishedAt || '2026'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground-custom tracking-tight leading-snug">
                  {selectedProject.title}
                </h3>

                {/* Detailed Description */}
                <div className="text-sm text-muted-foreground-custom leading-relaxed mt-4 mb-6">
                  <p>{selectedProject.description || selectedProject.summary}</p>
                </div>

                {/* Key Highlights / Impact Metrics */}
                {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                  <div className="mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground-custom block mb-2 font-medium">
                      Key Architectural Highlights
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.highlights.map((h) => (
                        <span key={h} className="impact-pill text-[10px] py-1 px-2.5">
                          <svg className="w-3 h-3 text-primary-custom flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies Stack */}
                <div className="mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground-custom block mb-2 font-medium">
                    Technologies Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies.map((tech) => (
                      <span key={tech} className="tech-tag text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-5 border-t border-border-custom space-y-3">
                <div className="flex items-center gap-2.5">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-primary-custom text-white text-xs font-semibold hover:bg-primary-custom/90 transition-all text-center shadow-sm flex items-center justify-center gap-1.5"
                    >
                      Launch Demo
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                  {selectedProject.repositoryUrl && (
                    <a
                      href={selectedProject.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-xl border border-border-custom hover:border-primary-custom/40 text-xs font-mono font-medium text-foreground-custom hover:text-primary-custom transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Repository
                    </a>
                  )}
                </div>
                <a
                  href={`/projects/${selectedProject.slug}`}
                  className="block w-full py-2 text-center text-xs font-mono text-muted-foreground-custom hover:text-primary-custom transition-colors"
                >
                  Open Dedicated Showcase Page →
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

