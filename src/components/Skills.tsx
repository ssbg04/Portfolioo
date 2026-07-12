import React from 'react';
import type { Skill } from '../lib/data';
import ScrollReveal from './ScrollReveal';

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  // Group skills by category
  const categories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Section Title */}
        <ScrollReveal variant="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-glow bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom to-primary-custom">
            Skills & Expertise
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-custom to-secondary-custom mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground-custom max-w-lg mx-auto">
            An overview of the technologies and tools I use to build scalable, high-performance applications and intuitive digital experiences.
          </p>
        </ScrollReveal>

        {/* Unified Skills Card with Internal Category Sections */}
        <ScrollReveal variant="scale-up">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-border-hover/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {categories.map((category) => {
                const categorySkills = skills.filter((s) => s.category === category);
                return (
                  <div key={category} className="flex flex-col">
                    <h3 className="text-xl font-bold font-heading text-foreground-custom mb-5 flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-custom" />
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="group flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-muted-custom/30 border border-border/10 text-foreground-custom/90 hover:border-primary-custom/40 hover:text-primary-custom hover:bg-primary-custom/5 transition-all shadow-sm cursor-default"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-custom/50 group-hover:bg-primary-custom transition-colors" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
