import React, { useState } from 'react';
import type { Skill } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface SkillsProps {
  skills: Skill[];
  sectionTag?: string;
  limit?: number;
  showSeeAll?: boolean;
  seeAllHref?: string;
}

const getFaClassByName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('react')) return 'fa-brands fa-react';
  if (n.includes('node')) return 'fa-brands fa-node-js';
  if (n.includes('php')) return 'fa-brands fa-php';
  if (n.includes('js') || n.includes('javascript')) return 'fa-brands fa-js';
  if (n.includes('ts') || n.includes('typescript')) return 'fa-brands fa-js';
  if (n.includes('html')) return 'fa-brands fa-html5';
  if (n.includes('css')) return 'fa-brands fa-css3-alt';
  if (n.includes('python')) return 'fa-brands fa-python';
  if (n.includes('flutter')) return 'fa-solid fa-mobile-screen-button';
  if (n.includes('mysql') || n.includes('sql') || n.includes('database') || n.includes('mongo') || n.includes('postgres')) return 'fa-solid fa-database';
  if (n.includes('github') || n.includes('git')) return 'fa-brands fa-github';
  if (n.includes('docker')) return 'fa-brands fa-docker';
  if (n.includes('secur') || n.includes('cyber') || n.includes('shield')) return 'fa-solid fa-shield-halved';
  if (n.includes('linux')) return 'fa-brands fa-linux';
  if (n.includes('java') && !n.includes('script')) return 'fa-brands fa-java';
  if (n.includes('vue')) return 'fa-brands fa-vuejs';
  if (n.includes('angular')) return 'fa-brands fa-angular';
  if (n.includes('bootstrap')) return 'fa-brands fa-bootstrap';
  if (n.includes('sass') || n.includes('scss')) return 'fa-brands fa-sass';
  if (n.includes('aws')) return 'fa-brands fa-aws';
  if (n.includes('network') || n.includes('telemetry') || n.includes('cisco')) return 'fa-solid fa-network-wired';
  if (n.includes('cloud')) return 'fa-solid fa-cloud';
  if (n.includes('terminal') || n.includes('bash') || n.includes('cli')) return 'fa-solid fa-terminal';
  if (n.includes('ai') || n.includes('ml') || n.includes('bot')) return 'fa-solid fa-robot';
  return 'fa-solid fa-code';
};

const getSkillFaClass = (skill: Skill): string => {
  if (skill.icon && skill.icon.trim()) {
    const raw = skill.icon.trim();
    if (raw.includes('fa-') && (raw.includes('fa-brands') || raw.includes('fa-solid') || raw.includes('fa-regular') || raw.includes('fab') || raw.includes('fas'))) {
      return raw;
    }
    if (raw.startsWith('fa-')) {
      return `fa-brands ${raw}`;
    }
    return getFaClassByName(raw);
  }
  return getFaClassByName(skill.name);
};

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom tracking-tight">
                Technologies &amp; Tools
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground-custom">
              {limit ? `Showing ${displayedSkills.length} of ${skills.length} technologies` : `${skills.length} total technologies`}
            </span>
          </div>

          {/* Simple Filter Pills */}
          {categories.length > 1 && !limit && (
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    activeFilter === opt
                      ? 'bg-primary-custom text-white font-bold shadow-sm'
                      : 'bg-foreground-custom/5 text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/10'
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {displayedSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground-custom/3 hover:bg-primary-custom/10 border border-border-custom hover:border-primary-custom/30 text-foreground-custom hover:text-primary-custom transition-all group cursor-default"
                >
                  <i className={`${getSkillFaClass(skill)} text-lg text-primary-custom shrink-0 group-hover:scale-110 transition-transform`} />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold truncate block text-foreground-custom group-hover:text-primary-custom transition-colors">
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span className="text-[10px] text-muted-foreground-custom truncate block font-mono">
                        {skill.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* See All Button when limited */}
            {(showSeeAll || limit) && skills.length > (limit || 0) && (
              <div className="mt-8 pt-6 border-t border-border-custom flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-muted-foreground-custom">
                  Previewing {displayedSkills.length} of {skills.length} core technologies
                </span>
                <a
                  href={seeAllHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-custom/10 hover:bg-primary-custom text-primary-custom hover:text-white border border-primary-custom/20 hover:border-primary-custom text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 shadow-xs active:scale-95 group"
                >
                  <span>See All Technologies ({skills.length})</span>
                  <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}

