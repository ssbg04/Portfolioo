import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../lib/hooks';

export default function Background() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const isMobile = useIsMobile();

  // Check for fine pointer (mouse/desktop)
  useEffect(() => {
    const checkInteractive = () => {
      const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      setIsInteractive(isFinePointer && !isMobile);
    };
    
    checkInteractive();
    window.addEventListener('resize', checkInteractive);

    return () => window.removeEventListener('resize', checkInteractive);
  }, [isMobile]);

  // Animation and event listeners only active if interactive
  useEffect(() => {
    if (!isInteractive || isMobile) return;

    let animationFrameId: number;
    let targetX = -1000;
    let targetY = -1000;
    
    // Smooth follow approach using lerp
    let currentX = -1000;
    let currentY = -1000;

    const animate = () => {
      // Lerp for smooth flashlight movement
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      setPosition({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, isInteractive]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Subtle Dot Grid (Always visible, lightweight CSS) */}
      <div className="absolute inset-0 bg-[radial-gradient(hsla(var(--foreground)/0.15)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_50%,transparent_100%)] opacity-50" />
      
      {/* Flashlight Blob (Only rendered on desktop to save battery/performance) */}
      {isInteractive && (
        <div
          className="absolute rounded-full blur-[100px] transition-opacity duration-700 will-change-transform hidden md:block"
          style={{
            width: '800px',
            height: '800px',
            left: -400,
            top: -400,
            transform: `translate(${position.x}px, ${position.y}px)`,
            backgroundColor: 'hsla(var(--primary) / 0.12)',
            opacity: isVisible ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}
