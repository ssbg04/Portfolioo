import React, { Suspense, lazy } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useIsMobile } from '../lib/hooks';
import type { SocialLink } from '../lib/data';
import ppDay from '../assets/pp-day.webp';
import ppNight from '../assets/pp-night.webp';

const TiltedCard = lazy(() => import('./reactbits/TiltedCard'));
const GlareHover = lazy(() => import('./reactbits/GlareHover'));

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
      whileTap={{ scale: 0.94, rotateX: 0, rotateY: 0 }}
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
  socialLinks?: SocialLink[];
}

const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.09-1.03-1.87-1.09-2.93-3.16-2.61-5.25.38-2.52 2.5-4.46 5.04-4.46.73 0 1.43.16 2.07.46.06.03.11.05.16.08v4.18c-1.38-.24-2.81-.19-4.16.14-1.12.28-2.12 1.05-2.67 2.06-.55 1.01-.58 2.22-.09 3.25.48 1.01 1.41 1.72 2.49 2.03 1.1.32 2.27.32 3.37.01.69-.2 1.34-.55 1.87-.99.53-.44.97-.99 1.25-1.61.28-.62.43-1.28.46-1.95.06-2.69.02-5.38.02-8.07z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  if (p.includes('twitter') || p.includes('x.com')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
};

export default function Hero({ fullName, title, valueProposition, heroImage, socialLinks = [] }: HeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const isMobile = useIsMobile();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.12,
        delayChildren: isMobile ? 0.05 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isMobile ? 0.35 : 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const linksToRender = socialLinks.length > 0 ? socialLinks : [
    { platform: "GitHub", url: "https://github.com/ssbg04", icon: "github", order: 1 },
    { platform: "Facebook", url: "https://www.facebook.com/kristyarls345/", icon: "facebook", order: 2 },
    { platform: "TikTok", url: "https://www.tiktok.com/@sisibigi", icon: "tiktok", order: 3 },
    { platform: "Email", url: "mailto:crischarlesgarcia345@gmail.com", icon: "mail", order: 4 }
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col md:flex-row items-center justify-center pt-24 md:pt-28 pb-10 md:pb-0 overflow-hidden"
    >
      <div className="container mx-auto px-6 max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Left Column: Text & Actions */}
        <motion.div
          className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1 will-change-transform-opacity"
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-primary-custom border border-primary-custom/20 mb-4 sm:mb-6 shadow-sm"
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
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 text-foreground-custom leading-tight"
          >
            Hi, I'm <span className="text-glow text-primary-custom">{fullName}</span>
          </motion.h1>

          {/* Title */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl font-bold text-foreground-custom mb-3 font-heading"
          >
            {title}
          </motion.p>

          {/* Value Proposition */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-foreground-custom/85 dark:text-foreground-custom/90 mb-6 sm:mb-8 max-w-xl leading-relaxed font-normal"
          >
            {valueProposition}
          </motion.p>

          {/* Actions & Social Links */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-1 w-full justify-center md:justify-start"
          >
            {/* Social Icons */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5">
                {linksToRender.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full glass-card text-foreground-custom hover:text-primary-custom hover:border-primary-custom/40 transition-all duration-250 flex items-center justify-center shadow-sm"
                    aria-label={`Visit Cris on ${link.platform}`}
                    title={link.platform}
                  >
                    {getPlatformIcon(link.platform)}
                  </a>
                ))}
              </div>
              <div className="hidden sm:block w-px h-8 bg-border-custom" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto justify-center">
              <InteractiveButton
                href="#projects"
                onClick={(e) => handleSmoothScroll(e, 'projects')}
                variant="primary"
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl bg-primary-custom text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 text-center cursor-pointer uppercase tracking-wider group flex items-center justify-center gap-1.5"
              >
                Projects
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </InteractiveButton>
              <InteractiveButton
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, 'contact')}
                variant="secondary"
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl glass-card text-foreground-custom font-bold text-xs border border-border-custom hover:border-primary-custom/40 hover:text-primary-custom transition-all duration-200 text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Contact
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </InteractiveButton>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Profile Image Frame */}
        <div className="md:col-span-5 flex justify-center order-1 md:order-2">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
            {/* Backdrop Aura */}
            <motion.div
              className="absolute w-[85%] h-[85%] rounded-[36px] bg-gradient-to-tr from-primary-custom via-secondary-custom to-primary-custom blur-3xl pointer-events-none opacity-30"
            />
            <Suspense fallback={<div className="w-full h-full rounded-[36px] bg-foreground-custom/5 animate-pulse-slow" />}>
              <TiltedCard
                imageSrc={heroImage || (ppDay as any).src || ppDay}
                darkImageSrc={heroImage || (ppNight as any).src || ppNight}
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
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
