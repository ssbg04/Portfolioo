import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../lib/hooks';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-up';
  delay?: number;
}

const variantsMap = {
  'fade-up': { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } },
  'fade-down': { hidden: { opacity: 0, y: -32 }, visible: { opacity: 1, y: 0 } },
  'fade-left': { hidden: { opacity: 0, x: -35 }, visible: { opacity: 1, x: 0 } },
  'fade-right': { hidden: { opacity: 0, x: 35 }, visible: { opacity: 1, x: 0 } },
  'scale-up': { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } }
};

export default function ScrollReveal({ 
  children, 
  className = '', 
  variant = 'fade-up',
  delay = 0 
}: ScrollRevealProps) {
  const chosenVariant = variantsMap[variant] || variantsMap['fade-up'];
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      variants={chosenVariant}
      transition={{ 
        duration: isMobile ? 0.35 : 0.65, 
        delay: delay / 1000, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={`${className} will-change-transform-opacity`}
    >
      {children}
    </motion.div>
  );
}
