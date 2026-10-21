import React, { useState } from 'react';
import type { Skill } from '../lib/data';
import ScrollReveal from './ScrollReveal';
import SectionBackground from './SectionBackground';
import TechIcon from './TechIcon';

interface SkillsProps {
  skills: Skill[];
  sectionTag?: string;
  limit?: number;
  showSeeAll?: boolean;
  seeAllHref?: string;
}

export default function Skills({
  skills,
  sectionTag = 'Tech Stack',
  limit,
  showSeeAll = false,
  seeAllHref = '/about#skills'
}: SkillsProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  const [activeFilter, setActiveFilter] = useState<string>('All');

  const categories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean) as string[]));
  const filterOptions = ['All', ...categories];

  const filteredSkills = activeFilter === 'All'
    ? skills
    : skills.filter((s) => s.category === activeFilter);

  const displayedSkills = limit ? filteredSkills.slice(0, limit) : filteredSkills;

  return (
    <section id="skills" className="py-20 relative scroll-mt-20">
      <SectionBackground variant="skills" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom tracking-tight">
                Technologies &amp; Tools
              </h2>
            </div>
            {!limit && (
              <span className="text-xs font-mono text-muted-foreground-custom">
                {skills.length} total technologies
              </span>
            )}
          </div>

          {/* Simple Filter Pills */}
          {categories.length > 1 && !limit && (
            <div className="flex flex-wrap items-center gap-1.5 mt-5">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={activeFilter === opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`px-3 py-1 rounded-md text-xs font-mono tracking-wide border transition-all cursor-pointer ${
                    activeFilter === opt
                      ? 'bg-primary-custom text-white border-primary-custom shadow-xs font-medium'
                      : 'bg-card-custom/80 text-muted-foreground-custom border-border-custom hover:text-foreground-custom hover:border-border-custom/80'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Single Unified Tech Stack Section */}
        <ScrollReveal variant="fade-up" delay={100}>
          <div className="bento-card p-6 sm:p-8">
            <ul
              role="list"
              aria-label="Technologies list"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5 p-0 m-0 list-none"
            >
              {displayedSkills.map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card-custom/60 border border-border-custom hover:border-primary-custom/40 hover:bg-card-custom text-foreground-custom transition-all group shadow-xs list-none"
                  aria-label={skill.name}
                  role="listitem"
                >
                  <span className="text-muted-foreground-custom group-hover:text-primary-custom shrink-0 transition-colors">
                    <TechIcon name={skill.name} icon={skill.icon} className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium truncate block text-foreground-custom group-hover:text-primary-custom transition-colors">
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span className="text-[10px] text-muted-foreground-custom truncate block font-mono">
                        {skill.category}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* See All Button when limited */}
            {(showSeeAll || limit) && skills.length > (limit || 0) && (
              <div className="mt-8 pt-6 border-t border-border-custom flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-muted-foreground-custom">
                  Showing {displayedSkills.length} of {skills.length} technologies
                </span>
                <a
                  href={seeAllHref}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-custom text-white border border-primary-custom text-xs font-mono font-medium tracking-wide uppercase hover:bg-primary-custom/90 transition-all shadow-xs group"
                >
                  <span>See All Technologies ({skills.length})</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
