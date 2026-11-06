import React, { useMemo } from 'react';
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

  // Group skills by category, preserving logical order
  const groupedSkills = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills) {
      const cat = s.category || 'General';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(s);
    }

    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => (a.order || 0) - (b.order || 0))
    }));
  }, [skills]);

  return (
    <section id="skills" className="py-12 sm:py-16 border-b border-border-custom bryl-entrance stagger-3 scroll-mt-14">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">

        {/* Section Header (bryl-minimal convention) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 mb-6 sm:mb-8 border-b border-border-custom">
          <div>
            <span className="section-marker mb-1 block">
              {sectionTag}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground-custom">
              Technologies &amp; Tools
            </h2>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground-custom">
            <span>verified stack // {skills.length} core technologies</span>
          </div>
        </div>

        {/* Category-Grouped Spec Rows (Hairline dividers, compact technical measure) */}
        <div className="bryl-card overflow-hidden divide-y divide-border-custom">
          {groupedSkills.map(({ category, items }) => (
            <div
              key={category}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-6 transition-colors hover:bg-elevated-custom/40"
            >
              {/* Category Spec Title */}
              <div className="md:w-44 shrink-0 flex items-center justify-between md:block">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground-custom">
                  {category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground-custom md:block md:mt-1">
                  {items.length} tools
                </span>
              </div>

              {/* Tools Pill Cloud */}
              <div className="flex-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {items.map((skill) => (
                  <div
                    key={skill.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border-custom bg-background-custom text-foreground-custom hover:border-border-strong hover:bg-elevated-custom transition-all group/item shadow-2xs"
                  >
                    <span className="text-muted-foreground-custom group-hover/item:text-foreground-custom transition-colors shrink-0">
                      <TechIcon name={skill.name} icon={skill.icon} className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-mono font-medium leading-none">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Optional See All link */}
        {(showSeeAll || limit) && skills.length > (limit || 0) && (
          <div className="mt-6 pt-3 flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground-custom">
              showing core technologies
            </span>
            <a
              href={seeAllHref}
              className="text-xs font-mono text-foreground-custom hover:underline transition-all inline-flex items-center gap-1"
            >
              <span>View All Technologies</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
