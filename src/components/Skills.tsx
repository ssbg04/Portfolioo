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
    <section id="skills" className="py-24 relative overflow-hidden bg-muted-custom/10">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-secondary-custom/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary-custom/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Section Title */}
        <ScrollReveal variant="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-glow bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom to-primary-custom">
            Skills & Expertise
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-custom to-secondary-custom mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground-custom max-w-lg mx-auto">
            A comprehensive matrix of technical capabilities, spanning user interfaces, backend operations, database layers, and AI engineering.
          </p>
        </ScrollReveal>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, idx) => {
            const categorySkills = skills.filter((s) => s.category === category);
            return (
              <ScrollReveal
                key={category}
                variant="scale-up"
                delay={(idx % 3) * 100}
              >
                <div
                  className="glass-card p-6 rounded-[24px] border border-border/25 relative overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-bold font-heading text-foreground-custom mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-custom" />
                      {category}
                    </h3>
                    <div className="w-8 h-[2px] bg-primary-custom/30 rounded-full mb-6" />

                    {/* Skill Items */}
                    <div className="flex flex-wrap gap-2.5">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-muted-custom/25 border border-border/15 text-foreground-custom/90 hover:border-primary-custom/30 hover:text-primary-custom hover:bg-primary-custom/5 transition-all duration-250 cursor-default shadow-sm"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
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
