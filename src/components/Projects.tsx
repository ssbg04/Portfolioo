import React, { useState } from 'react';
import type { Project } from '../lib/data';

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
  sectionTag = '02 — projects'
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

  return (
    <section id="projects" className={`${showArchiveLink ? 'py-12 sm:py-16' : 'pt-2 pb-12 sm:pb-16'} border-b border-border-custom bryl-entrance stagger-2`}>
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">

        {/* Section Header (bryl-minimal numbered convention) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 sm:mb-8 border-b border-border-custom">
          <div>
            <span className="section-marker mb-1 block">
              {sectionTag.toLowerCase()}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground-custom lowercase">
              featured work
            </h2>
          </div>

          {/* Filter Pills (Understated mono pills) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filterOptions.map((opt) => {
              const active = filter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    active
                      ? 'bg-foreground-custom text-background-custom font-semibold'
                      : 'border border-border-custom text-muted-foreground-custom hover:text-foreground-custom hover:border-border-strong bg-transparent'
                  }`}
                >
                  {opt.toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Cards (bryl-minimal: 16px radius, hairline border, soft shadow, image zoom 1.04) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredProjects.map((project, idx) => {
            const formattedIndex = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
            const isFeatured = idx === 0 && filter === 'All';

            return (
              <article
                key={project.slug}
                className={`bryl-card p-5 sm:p-6 flex flex-col justify-between group ${
                  isFeatured ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  {/* Screenshot Viewport with 1.04 zoom on hover */}
                  {project.coverImage && (
                    <a
                      href={`/projects/${project.slug}`}
                      className={`relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border-custom bg-elevated-custom mb-4 block ${
                        isFeatured ? 'md:aspect-[21/9]' : ''
                      }`}
                      aria-label={`View ${project.title}`}
                    >
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />

                      {/* Status / Category tag inside screenshot */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-background-custom/95 text-foreground-custom border border-border-custom backdrop-blur-sm">
                          {formattedIndex} / {project.category?.toLowerCase() || 'project'}
                        </span>
                      </div>
                    </a>
                  )}

                  {/* Metadata Eyebrow */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                      {project.category?.toLowerCase() || 'application'}
                    </span>
                    <span className="text-[10px] font-mono text-subtle-custom">
                      {project.publishedAt || '2026'}
                    </span>
                  </div>

                  {/* Title */}
                  <a href={`/projects/${project.slug}`} className="block group/title">
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground-custom group-hover/title:underline transition-all">
                      {project.title}
                    </h3>
                  </a>

                  {/* Summary */}
                  <p className="text-[14px] leading-relaxed text-foreground-custom/80 mt-2 mb-4 font-normal">
                    {project.summary || project.description}
                  </p>

                  {/* Technologies Pill Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-5">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span key={tech} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className="text-[9px] font-mono text-subtle-custom">
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border-custom mt-auto">
                  <a
                    href={`/projects/${project.slug}`}
                    className="text-xs font-mono text-foreground-custom hover:underline transition-all inline-flex items-center gap-1"
                  >
                    <span>case study</span>
                    <span aria-hidden="true">→</span>
                  </a>

                  <div className="flex items-center gap-3">
                    {project.repositoryUrl && (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors inline-flex items-center gap-1"
                      >
                        <span>source</span>
                        <span className="text-[10px]" aria-hidden="true">↗</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors inline-flex items-center gap-1"
                      >
                        <span>live</span>
                        <span className="text-[10px]" aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Projects link if on homepage */}
        {showArchiveLink && (
          <div className="mt-8 text-center sm:text-left pt-2">
            <a
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors bryl-link"
            >
              <span>view complete project archive</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
