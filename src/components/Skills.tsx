import React from 'react';
import type { Skill } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  const categories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-custom">
            <div>
              <span className="section-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom" />
                03 // Stack
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground-custom mt-1 tracking-tight">
                Technologies
              </h2>
            </div>
            <p className="text-sm text-muted-foreground-custom max-w-sm">
              Core stack, languages, and relational database systems.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category, idx) => {
            const categorySkills = skills.filter((s) => s.category === category);

            return (
              <ScrollReveal key={category} variant="fade-up" delay={idx * 50}>
                <div className="bento-card p-6 h-full flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-custom">
                      <h3 className="text-base font-bold font-heading text-foreground-custom">
                        {category}
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground-custom">
                        {categorySkills.length} items
                      </span>
                    </div>

                    {/* Skill List */}
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="tech-tag"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-5 border-t border-border-custom flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground-custom">
                      {category.toUpperCase()}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-custom/60" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
