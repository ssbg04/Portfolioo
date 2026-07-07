import React, { useEffect, useRef } from 'react';

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Target coordinates
    const target = { x: width / 2, y: height / 2 };
    const mouse = { moving: false };
    let idleTimeout: number;

    // Elastic follow chain points
    const numPoints = 26;
    const points: { x: number; y: number }[] = [];
    
    // Initialize points at center
    for (let i = 0; i < numPoints; i++) {
      points.push({ x: target.x, y: target.y });
    }

    // Global opacity state for fade in / fade out
    let currentOpacity = 0;

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      mouse.moving = true;
      
      clearTimeout(idleTimeout);
      idleTimeout = window.setTimeout(() => {
        mouse.moving = false;
      }, 350);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        target.x = e.touches[0].clientX;
        target.y = e.touches[0].clientY;
        mouse.moving = true;

        clearTimeout(idleTimeout);
        idleTimeout = window.setTimeout(() => {
          mouse.moving = false;
        }, 350);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Animation rendering loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly update head point towards cursor
      points[0].x += (target.x - points[0].x) * 0.35;
      points[0].y += (target.y - points[0].y) * 0.35;

      // Make each chain point spring-follow the one in front of it
      for (let i = 1; i < numPoints; i++) {
        const p = points[i];
        const prev = points[i - 1];
        p.x += (prev.x - p.x) * 0.32;
        p.y += (prev.y - p.y) * 0.32;
      }

      // Smoothly fade trail opacity in or out depending on cursor activity
      if (mouse.moving) {
        currentOpacity = Math.min(0.35, currentOpacity + 0.03);
      } else {
        currentOpacity = Math.max(0, currentOpacity - 0.015);
      }

      // Render ribbon path if visible
      if (currentOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw connected line segments from tail to head
        // (Tail is at numPoints - 1, Head is at index 0)
        for (let i = numPoints - 1; i > 0; i--) {
          const p1 = points[i];
          const p2 = points[i - 1];

          // Calculate thickness ratio (1 at head, 0 at tail)
          const ratio = (numPoints - i) / numPoints;
          ctx.lineWidth = ratio * 26 + 1.5; // Tapers from 27.5px at cursor down to 1.5px

          // Dynamic color interpolation along the liquid stream (Cyan HSL 199 -> Blue HSL 217)
          const hue = 199 + (217 - 199) * ratio;
          ctx.strokeStyle = `hsl(${hue}, 90%, 58%)`;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(idleTimeout);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen dark:mix-blend-screen light:mix-blend-multiply"
        style={{ 
          backfaceVisibility: 'hidden',
          filter: 'url(#liquid-goo)'
        }}
      />
      {/* SVG liquid gooey filter definition */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
