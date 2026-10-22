import React from 'react';
import type { SocialLink } from '../lib/data';
import ppDay from '../assets/pp-day.webp';
import ppNight from '../assets/pp-night.webp';

interface HeroProps {
  fullName: string;
  title: string;
  valueProposition: string;
  heroImage?: string;
  heroImageNight?: string;
  isAvailable?: boolean;
  availabilityStatus?: string;
  socialLinks?: SocialLink[];
  resumeFile?: string;
}

export default function Hero({
  fullName,
  title,
  valueProposition,
  heroImage,
  heroImageNight,
  isAvailable = true,
  availabilityStatus = 'Available for opportunities',
  socialLinks = [],
  resumeFile = '/CV-Cris-Charles-Garcia.pdf'
}: HeroProps) {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  const linksToRender = (socialLinks.length > 0
    ? socialLinks.filter(l => l.showInHero !== false)
    : [
        { platform: "GitHub", url: "https://github.com/ssbg04", icon: "github", order: 1 },
        { platform: "LinkedIn", url: "https://www.linkedin.com/in/cris-charles-garcia/", icon: "linkedin", order: 2 },
        { platform: "Email", url: "mailto:crischarlesgarcia345@gmail.com", icon: "mail", order: 3 }
      ]
  ).filter(l => !['facebook', 'tiktok'].includes(l.platform.toLowerCase()));

  const dayImg = heroImage || (ppDay as any).src || ppDay;
  const nightImg = heroImageNight || heroImage || (ppNight as any).src || ppNight;

  return (
    <section
      id="home"
      className="relative pt-6 sm:pt-10 md:pt-14 pb-14 border-b border-border-custom bryl-entrance stagger-1"
    >
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-10 items-start">
          
          {/* Main Editorial Bio */}
          <div className="md:col-span-8 flex flex-col items-start text-left order-2 md:order-1">
            
            {/* Live Availability Status Indicator */}
            {isAvailable !== false && (
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground-custom animate-pulse opacity-80" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
                  {availabilityStatus.toLowerCase()}
                </span>
              </div>
            )}

            {/* Display Page Title (Lowercase, technical scale, mobile friendly) */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.08] tracking-tight text-foreground-custom lowercase break-words mb-2 sm:mb-3">
              {fullName.toLowerCase()}
            </h1>

            {/* Technical Sub-Role */}
            <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-muted-foreground-custom mb-4 sm:mb-5">
              {title.toLowerCase()}
            </p>

            {/* Value Proposition Body */}
            <p className="text-sm sm:text-base leading-relaxed text-foreground-custom/90 mb-6 max-w-xl font-normal">
              {valueProposition}
            </p>

            {/* Action Bar (Monochrome Inversion & Hairline Text Links) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1">
              <a
                href={resumeFile}
                target="_blank"
                rel="noopener noreferrer"
                className="bryl-btn-primary"
              >
                <span>download cv</span>
                <span className="text-[10px]" aria-hidden="true">↗</span>
              </a>

              <a
                href="#projects"
                onClick={(e) => handleSmoothScroll(e, 'projects')}
                className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors flex items-center gap-1.5 py-1"
              >
                <span>view projects</span>
                <span aria-hidden="true">↓</span>
              </a>

              <a
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, 'contact')}
                className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors flex items-center gap-1.5 py-1"
              >
                <span>contact</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            {/* Social Links (Clean Micro-Labels with Trailing Arrow) */}
            <div className="flex items-center gap-4 sm:gap-5 mt-6 pt-4 border-t border-border-custom w-full max-w-md">
              <span className="text-[10px] font-mono uppercase tracking-widest text-subtle-custom">
                links:
              </span>
              <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap">
                {linksToRender.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-foreground-custom/80 hover:text-foreground-custom transition-colors inline-flex items-center gap-1"
                  >
                    <span>{link.platform.toLowerCase()}</span>
                    <span className="text-[10px] opacity-60" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Portrait Column (Full natural color photo, 16px radius, hairline border, subtle image zoom on hover) */}
          <div className="md:col-span-4 flex justify-start md:justify-end order-1 md:order-2 mb-2 md:mb-0">
            <div className="group relative w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 rounded-2xl border border-border-custom p-1.5 bg-card-custom shadow-sm overflow-hidden transition-all duration-300">
              <div className="w-full h-full rounded-[12px] overflow-hidden relative bg-elevated-custom">
                {nightImg && nightImg !== dayImg ? (
                  <>
                    <img
                      src={dayImg}
                      alt={fullName}
                      width="240"
                      height="240"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover dark:hidden transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <img
                      src={nightImg}
                      alt={fullName}
                      width="240"
                      height="240"
                      loading="lazy"
                      fetchPriority="auto"
                      decoding="async"
                      className="w-full h-full object-cover hidden dark:block transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </>
                ) : (
                  <img
                    src={dayImg}
                    alt={fullName}
                    width="240"
                    height="240"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
