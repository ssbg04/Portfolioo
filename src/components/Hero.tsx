import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import TiltedCard from './reactbits/TiltedCard';
import GlareHover from './reactbits/GlareHover';

interface InteractiveButtonProps {
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className: string;
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
}

function InteractiveButton({ href, onClick, className, children, variant }: InteractiveButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Magnetic / Tilt effect relative to button bounds
  const rotateX = useTransform(y, [-40, 40], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  // Radial glow coordinates inside the button
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative mouse position from center (-width/2 to width/2)
    const relX = event.clientX - rect.left - width / 2;
    const relY = event.clientY - rect.top - height / 2;

    x.set(relX);
    y.set(relY);

    // Pixel coordinates inside the button (for radial gradient)
    glowX.set(event.clientX - rect.left);
    glowY.set(event.clientY - rect.top);
    glowOpacity.set(1);
  };

  const handleMouseLeave = () => {
    // Reset tilt and fade out the glow
    x.set(0);
    y.set(0);
    glowOpacity.set(0);
  };

  return (
    <motion.a
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '600px'
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94, rotateX: 0, rotateY: 0 }} // Hold press compresses and resets rotation
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic Radial Glow Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [glowX, glowY, glowOpacity],
            ([gx, gy, go]) => `radial-gradient(circle 80px at ${gx}px ${gy}px, rgba(255, 255, 255, ${variant === 'primary' ? 0.25 : 0.12}), transparent 80%)`
          ),
          opacity: glowOpacity
        }}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.a>
  );
}


interface HeroProps {
  fullName: string;
  title: string;
  valueProposition: string;
  heroImage?: string;
}

const socialLinks = [
  {
    name: 'GitHub',
    handle: '@ssbg04',
    url: 'https://github.com/ssbg04',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    handle: 'ccvg3405',
    url: 'https://linkedin.com/in/ccvg3405',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  },
  {
    name: 'Twitter',
    handle: '@N/A',
    url: '#',
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

  // Motion animation config for text elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col md:flex-row items-center justify-center pt-20 md:pt-24 pb-6 md:pb-0 overflow-hidden"
    >


      <div className="container mx-auto px-6 max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center">
        {/* Left Column: Text & Actions */}
        <motion.div
          className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1"
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
        >
          {/* Profile/Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-[10px] sm:text-xs font-semibold text-primary-custom border border-primary-custom/10 mb-3 sm:mb-6 shadow-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available for new projects
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom via-foreground-custom to-primary-custom leading-tight"
          >
            Hi, I'm <span className="text-glow text-primary-custom">{fullName}</span>
          </motion.h1>

          {/* Title */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-xl md:text-2xl font-semibold text-muted-foreground-custom mb-1.5 sm:mb-4 font-heading"
          >
            {title}
          </motion.p>

          {/* Value Proposition */}
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-base md:text-lg text-muted-foreground-custom/80 mb-4 sm:mb-8 max-w-xl leading-relaxed"
          >
            {valueProposition}
          </motion.p>

          {/* Actions & Social Alignment Group */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-1 sm:mt-2 w-full justify-center md:justify-start"
          >
            {/* Social Links & Divider */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <div key={link.name} className="relative group flex flex-col items-center">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full glass-card hover:bg-primary-custom/10 hover:text-primary-custom transition-all duration-300 flex items-center justify-center"
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
              <div className="hidden sm:block w-[1px] h-8 bg-border/20" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto justify-center">
              <InteractiveButton
                href="#projects"
                onClick={(e) => handleSmoothScroll(e, 'projects')}
                variant="primary"
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-custom to-secondary-custom text-primary-foreground font-bold text-[10px] sm:text-xs shadow-md hover:shadow-lg transition-all duration-200 text-center cursor-pointer uppercase tracking-wider group flex items-center justify-center gap-1.5"
              >
                Projects
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </InteractiveButton>
              <InteractiveButton
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, 'contact')}
                variant="secondary"
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-lg glass-card text-foreground-custom font-bold text-[10px] sm:text-xs border border-border/25 hover:bg-primary-custom/10 hover:text-primary-custom transition-all duration-200 text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Contact
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </InteractiveButton>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Professional Profile Picture Frame */}
        <div className="md:col-span-5 flex justify-center order-1 md:order-2">
          <div className="relative w-40 h-40 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
            {/* Glowing Backdrop Aura */}
            <motion.div
              className="absolute w-[85%] h-[85%] rounded-[36px] bg-gradient-to-tr from-primary-custom via-secondary-custom to-accent-custom blur-3xl pointer-events-none"
              variants={{
                rest: { scale: 0.95, opacity: 0.25 },
                hover: { scale: 1.08, opacity: 0.45, transition: { duration: 0.4 } }
              }}
              initial="rest"
              whileHover="hover"
              animate="rest"
            />
            
            <TiltedCard
              imageSrc={heroImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80"}
              altText={fullName}
              captionText="Available for new projects"
              containerHeight="100%"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              rotateAmplitude={12}
              scaleOnHover={1.03}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              overlayContent={
                <GlareHover
                  className="rounded-[15px]"
                  glareColor="#ffffff"
                  glareOpacity={0.25}
                  glareSize={200}
                />
              }
            />
          </div>
        </div>

        {/* Down indicator */}
        <a
          href="#projects"
          onClick={(e) => handleSmoothScroll(e, 'projects')}
          className="absolute top-140 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
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
