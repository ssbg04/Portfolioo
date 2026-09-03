import React from 'react';
import type { Skill } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface SkillsProps {
  skills: Skill[];
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('front')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    );
  }
  if (cat.includes('back')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.75 5.1a3 3 0 0 1 2.4-1.1h7.7a3 3 0 0 1 2.4 1.1l2.6 3.45a4.5 4.5 0 0 1 .9 2.7" />
      </svg>
    );
  }
  if (cat.includes('data') || cat.includes('sql')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    );
  }
  if (cat.includes('mobile')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    );
  }
  if (cat.includes('secur') || cat.includes('cyber')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.32l-3.276 3.277a1.5 1.5 0 0 1-2.122-2.122l3.277-3.276a4.5 4.5 0 0 0-6.32 4.486c.048.58.024 1.193-.14 1.743" />
    </svg>
  );
};

export default function Skills({ skills }: SkillsProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  const categories = Array.from(new Set(skills.map((s) => s.category || 'Core')));

  // Bento span calculation to produce aesthetic varying card proportions
  const getBentoSpan = (index: number, total: number) => {
    if (total === 1) return 'lg:col-span-12';
    if (total === 2) return 'lg:col-span-6';
    if (total === 3) {
      if (index === 0) return 'lg:col-span-12';
      return 'lg:col-span-6';
    }
    if (total === 4) {
      if (index === 0) return 'lg:col-span-7';
      if (index === 1) return 'lg:col-span-5';
      return 'lg:col-span-6';
    }
    if (total >= 5) {
      if (index === 0) return 'lg:col-span-7 md:col-span-12';
      if (index === 1) return 'lg:col-span-5 md:col-span-12';
      if (index === 2) return 'lg:col-span-4 md:col-span-6';
      if (index === 3) return 'lg:col-span-4 md:col-span-6';
      if (index === 4) return 'lg:col-span-4 md:col-span-12';
      return 'lg:col-span-6';
    }
    return 'lg:col-span-4';
  };

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                03 // Tech Stack
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Technologies &amp; Tools
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Modular bento layout of core languages, database systems, and development toolkits.
            </p>
          </div>
        </ScrollReveal>

        {/* ─── Bento Box Grid for Tech Stack ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {categories.map((category, idx) => {
            const categorySkills = skills.filter((s) => (s.category || 'Core') === category);
            const spanClass = getBentoSpan(idx, categories.length);

            return (
              <div key={category} className={`${spanClass} col-span-12`}>
                <ScrollReveal variant="fade-up" delay={idx * 60} className="h-full">
                  <div className="bento-card p-6 sm:p-7 flex flex-col justify-between h-full group">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-custom">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-primary-custom/10 text-primary-custom">
                            {getCategoryIcon(category)}
                          </span>
                          <h3 className="text-base font-bold font-heading text-foreground-custom tracking-tight">
                            {category}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-primary-custom px-2 py-0.5 rounded-full bg-primary-custom/10 border border-primary-custom/20 font-medium">
                          {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                        </span>
                      </div>

                      {/* Skill Items List / Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
                        {categorySkills.map((skill) => (
                          <div
                            key={skill.name}
                            className="p-3 rounded-xl border border-border-custom/80 bg-foreground-custom/[0.02] hover:bg-foreground-custom/[0.05] transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground-custom">
                                {skill.name}
                              </span>
                              {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                                <span className="text-[10px] font-mono text-primary-custom font-medium">
                                  {skill.proficiency}%
                                </span>
                              )}
                            </div>

                            {/* Minimal Proficiency Meter if defined */}
                            {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                              <div className="w-full h-1 bg-border-custom/50 rounded-full overflow-hidden mt-2">
                                <div
                                  className="h-full bg-primary-custom rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, skill.proficiency))}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bento Cell Foot */}
                    <div className="pt-3 mt-4 border-t border-border-custom flex items-center justify-between text-[10px] font-mono text-muted-foreground-custom">
                      <span>CATEGORY // {category.toUpperCase()}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-custom/60" />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
