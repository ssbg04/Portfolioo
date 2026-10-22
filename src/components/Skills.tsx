import React, { useState } from 'react';
import type { Skill } from '../lib/data';
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
  sectionTag = '03 — skills',
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
    <section id="skills" className="py-12 sm:py-16 border-b border-border-custom bryl-entrance stagger-3 scroll-mt-14">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">

        {/* Section Header (bryl-minimal convention) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 sm:mb-8 border-b border-border-custom">
          <div>
            <span className="section-marker mb-1 block">
              {sectionTag.toLowerCase()}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground-custom lowercase">
              technologies &amp; tools
            </h2>
          </div>

          {categories.length > 1 && !limit && (
            <div className="flex flex-wrap items-center gap-1.5">
              {filterOptions.map((opt) => {
                const active = activeFilter === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setActiveFilter(opt)}
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
          )}
        </div>

        {/* Hairline Grid of Technical Cells (Dividers ARE the design) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 border-t border-l border-border-custom rounded-2xl overflow-hidden bg-card-custom shadow-sm">
          {displayedSkills.map((skill) => (
            <div
              key={skill.name}
              className="border-r border-b border-border-custom p-4 flex flex-col justify-between transition-colors hover:bg-elevated-custom group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground-custom group-hover:text-foreground-custom transition-colors">
                  <TechIcon name={skill.name} icon={skill.icon} className="w-4 h-4" />
                </span>
                {skill.category && (
                  <span className="text-[9px] font-mono uppercase tracking-widest text-subtle-custom">
                    {skill.category.slice(0, 10)}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[13px] font-medium text-foreground-custom block truncate group-hover:underline">
                  {skill.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* See All link if on summary view */}
        {(showSeeAll || limit) && skills.length > (limit || 0) && (
          <div className="mt-6 pt-3 flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground-custom">
              showing {displayedSkills.length} of {skills.length} skills
            </span>
            <a
              href={seeAllHref}
              className="text-xs font-mono text-foreground-custom hover:underline transition-all inline-flex items-center gap-1"
            >
              <span>view all technologies</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
