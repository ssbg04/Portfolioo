import React from 'react';

interface HeroProps {
  fullName: string;
  title: string;
  valueProposition: string;
  heroImage?: string;
}

const socialLinks = [
  {
    name: 'GitHub',
    handle: '@ssbg',
    url: 'https://github.com/ssbg',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    handle: 'crischarlesgarcia',
    url: 'https://linkedin.com/in/cris-charles-garcia-187415303',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  },
  {
    name: 'Twitter',
    handle: '@crischarles',
    url: 'https://twitter.com/crischarles',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    name: 'Email',
    handle: 'crischarlesgarcia345@gmail.com',
    url: 'mailto:crischarlesgarcia345@gmail.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    )
  }
];

export default function Hero({ fullName, title, valueProposition, heroImage }: HeroProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden"
    >
      {/* Animated Aurora backgrounds */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-custom/10 blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-60 -right-20 w-80 h-80 rounded-full bg-secondary-custom/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] rounded-full bg-accent-custom/5 blur-3xl animate-pulse-slow" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-6 max-w-5xl text-center relative z-10 flex flex-col items-center">
        {/* Premium Layered Profile Picture Frame */}
        <div className={`relative w-48 h-48 sm:w-56 sm:h-56 group flex items-center justify-center mb-8 transform transition-all duration-1000 ease-out delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Back Glowing Accent Halo */}
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-primary-custom via-secondary-custom to-accent-custom blur-xl opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500" />

          {/* Decorative Tilted Grid Card behind the image */}
          <div className="absolute inset-0 rounded-[32px] border border-border/10 bg-card-custom/20 backdrop-blur-sm rotate-6 group-hover:rotate-3 transition-transform duration-500 hidden sm:block shadow-inner" />

          {/* Decorative Tilted Solid card behind the image */}
          <div className="absolute inset-0 rounded-[32px] border border-primary-custom/10 bg-gradient-to-br from-primary-custom/5 to-secondary-custom/5 -rotate-3 group-hover:-rotate-1 transition-transform duration-500 hidden sm:block" />

          {/* Main Photo Frame Card */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[32px] p-1 bg-gradient-to-br from-primary-custom via-border/20 to-secondary-custom shadow-2xl group-hover:scale-[1.01] transition-transform duration-500 overflow-hidden glass-card">
            <div className="w-full h-full rounded-[28px] overflow-hidden bg-muted-custom/20 relative">
              <img
                src={heroImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=350&h=350&q=80"}
                alt={fullName}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay glass glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 ease-out" />
            </div>
          </div>

          {/* Floating tech badge 1 */}
          <div className="absolute -top-1 -left-1 p-2.5 rounded-2xl glass-card border border-border/25 shadow-lg animate-float hidden md:flex items-center justify-center bg-background-custom/85" style={{ animationDelay: '1s' }}>
            <span className="text-[10px] font-bold text-primary-custom tracking-wide">⚡ Full-Stack</span>
          </div>

          {/* Floating tech badge 2 */}
          <div className="absolute -bottom-1 -right-1 p-2.5 rounded-2xl glass-card border border-border/25 shadow-lg animate-float hidden md:flex items-center justify-center bg-background-custom/85" style={{ animationDelay: '3s' }}>
            <span className="text-[10px] font-bold text-secondary-custom tracking-wide">🤖 AI Architect</span>
          </div>
        </div>

        {/* Profile/Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-semibold text-primary-custom border border-primary-custom/10 mb-8 shadow-sm transition-all duration-800 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Available for new projects
        </div>

        {/* Heading */}
        <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom via-foreground-custom to-primary-custom max-w-4xl leading-tight transition-all duration-800 ease-out delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Hi, I'm <span className="text-glow text-primary-custom">{fullName}</span>
        </h1>

        {/* Title */}
        <p className={`text-xl md:text-2xl font-semibold text-muted-foreground-custom mb-6 font-heading max-w-2xl transition-all duration-800 ease-out delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {title}
        </p>

        {/* Value Proposition */}
        <p className={`text-base md:text-lg text-muted-foreground-custom/80 mb-8 max-w-2xl leading-relaxed transition-all duration-800 ease-out delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {valueProposition}
        </p>

        {/* Actions & Social Alignment Group */}
        <div className={`flex flex-col md:flex-row items-center gap-6 mt-6 transition-all duration-800 ease-out delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <a
              href="#projects"
              onClick={(e) => handleSmoothScroll(e, 'projects')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-custom to-emerald-600 text-primary-foreground font-bold text-xs shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 group"
            >
              Explore Projects
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-card text-foreground-custom font-bold text-xs border border-border/25 hover:bg-primary-custom/10 hover:text-primary-custom hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Get In Touch
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden md:block w-[1px] h-8 bg-border/20" />

          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <div key={link.name} className="relative group flex flex-col items-center">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full glass-card hover:bg-primary-custom/10 hover:text-primary-custom transition-all duration-300 flex items-center justify-center"
                  aria-label={`Visit Cris's ${link.name}`}
                >
                  {link.icon}
                </a>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-foreground-custom text-background-custom text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg z-20">
                  {link.handle}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-foreground-custom rotate-45" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Down indicator */}
        <a
          href="#projects"
          onClick={(e) => handleSmoothScroll(e, 'projects')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Scroll down to projects"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
