import React, { useState } from 'react';
import type { Project } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface ProjectsProps {
  initialProjects: Project[];
}

export default function Projects({ initialProjects }: ProjectsProps) {
  const [filter, setFilter] = useState<string>('All');

  // Extract all unique technologies
  const allTechs = ['All', ...new Set(initialProjects.flatMap((p) => p.technologies))];

  const filteredProjects = filter === 'All'
    ? initialProjects
    : initialProjects.filter((p) => p.technologies.includes(filter));

  return (
    <section id="projects" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Section Title */}
        <ScrollReveal variant="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-glow bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom to-primary-custom">
            Featured Projects
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-custom to-secondary-custom mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground-custom max-w-lg mx-auto">
            A curated selection of recent engineering works, ranging from interactive web apps to semantic AI integrations.
          </p>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal variant="fade-up" delay={150} className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {allTechs.map((tech) => (
            <button
              key={tech}
              onClick={() => setFilter(tech)}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                filter === tech
                  ? 'bg-primary-custom text-primary-foreground shadow-md'
                  : 'glass-card text-muted-foreground-custom hover:text-foreground-custom border-border/25 hover:bg-muted-custom/30'
              }`}
            >
              {tech}
            </button>
          ))}
        </ScrollReveal>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <ScrollReveal
              key={project.slug}
              variant="scale-up"
              delay={(idx % 3) * 100}
            >
              <article
                className="glass-card flex flex-col justify-between h-full p-5 rounded-[24px] group border-border/25 relative overflow-hidden"
              >
              {/* Optional dynamic accent gradient on top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-custom/40 to-secondary-custom/40" />

              <div>
                {/* Project Cover Image */}
                {project.coverImage && (
                  <a href={`/projects/${project.slug}`} className="block aspect-[16/10] w-full overflow-hidden rounded-[18px] mb-5 relative bg-muted-custom/20">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                )}

                <div className="flex items-center justify-between mb-3.5">
                  <a href={`/projects/${project.slug}`} className="hover:underline decoration-primary-custom/40">
                    <h3 className="text-xl font-bold font-heading text-foreground-custom group-hover:text-primary-custom transition-colors">
                      {project.title}
                    </h3>
                  </a>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-custom bg-primary-custom/10 px-2.5 py-1 rounded-full">
                    {project.publishedAt.split('-')[0]}
                  </span>
                </div>

                <p className="text-muted-foreground-custom/80 text-sm leading-relaxed mb-6">
                  {project.summary}
                </p>
              </div>

              <div>
                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted-custom/40 text-muted-foreground-custom/90 border border-border/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Project Links */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/10">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground-custom hover:text-primary-custom transition-colors"
                      aria-label={`${project.title} GitHub repository`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground-custom hover:text-primary-custom transition-colors ml-auto"
                      aria-label={`${project.title} live demo`}
                    >
                      Demo
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
        </div>
      </div>
    </section>
  );
}
