import React, { useState } from 'react';
import type { Skill } from '../lib/data';
import ScrollReveal from './ScrollReveal';
import SectionBackground from './SectionBackground';

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
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-extrabold border-2 border-border-custom transition-all cursor-pointer ${
                    activeFilter === opt
                      ? 'bg-[#facc15] text-black shadow-[3px_3px_0_0_var(--border-color)]'
                      : 'bg-card-custom text-foreground-custom shadow-[2px_2px_0_0_var(--border-color)] hover:bg-[#00f0ff] hover:text-black hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
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
                  className="flex items-center gap-3 p-3 rounded-xl bg-card-custom border-2 border-border-custom shadow-[2.5px_2.5px_0_0_var(--border-color)] hover:bg-[#facc15]/10 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3.5px_3.5px_0_0_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-foreground-custom transition-all group cursor-default"
                  aria-label={skill.name}
                  role="listitem"
                >
                  <i className={`${getSkillFaClass(skill)} text-xl text-foreground-custom group-hover:text-primary-custom shrink-0 group-hover:scale-110 transition-transform`} />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold truncate block text-foreground-custom group-hover:text-primary-custom transition-colors">
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span className="text-[10px] text-muted-foreground-custom truncate block font-mono font-semibold">
                        {skill.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* See All Button when limited */}
            {(showSeeAll || limit) && skills.length > (limit || 0) && (
              <div className="mt-8 pt-6 border-t-2 border-border-custom flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-muted-foreground-custom font-bold">
                  Showing {displayedSkills.length} of {skills.length} technologies
                </span>
                <a
                  href={seeAllHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#facc15] text-black border-2 border-border-custom shadow-[3px_3px_0_0_var(--border-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-mono font-extrabold tracking-wider uppercase transition-all duration-150"
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

