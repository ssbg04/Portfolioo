import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-up';
  delay?: number;
}

export default function ScrollReveal({ 
  children, 
  className = '', 
  variant = 'fade-up',
  delay = 0 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setActive(true);
          }, delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref} 
      className={`reveal-${variant} ${active ? 'active' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
