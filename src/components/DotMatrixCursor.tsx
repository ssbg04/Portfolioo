import React, { useEffect, useRef } from 'react';

/**
 * Dot Arrow Cursor (Sprite-based, lightweight GPU transform)
 * Renders an arrow silhouette filled with dots into an off-screen sprite once,
 * then moves with pure hardware-accelerated translate3d.
 */
export default function DotMatrixCursor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only execute on desktop pointer devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const el = containerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    inner.innerHTML = '';

    const CFG = {
      scale: 1.4,                 // cursor size
      step: 2,                    // dot spacing (smaller = denser, more solid-looking)
      radius: 0.85,               // dot radius
      color: '#ffffff',
      hoverColor: '#7cdcff',
      outline: 'rgba(0,0,0,.65)', // dark halo so it shows on light backgrounds
      hoverSelector: 'a, button, input[type="submit"], input[type="button"], [role="button"], [data-cursor], .cursor-pointer, select, summary'
    };

    const ARROW: [number, number][] = [
      [0, 0],
      [0, 17],
      [4.2, 13],
      [7, 19],
      [9.6, 18],
      [6.8, 12],
      [12, 12]
    ];
    const PAD = 2;
    const W = 14;
    const H = 21;

    const inside = (x: number, y: number) => {
      let c = false;
      for (let i = 0, j = ARROW.length - 1; i < ARROW.length; j = i++) {
        const [xi, yi] = ARROW[i];
        const [xj, yj] = ARROW[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          c = !c;
        }
      }
      return c;
    };

    // Compute dot positions once
    const pts: [number, number][] = [];
    for (let x = 0.6; x <= 12; x += CFG.step) {
      for (let y = 0.6; y <= 19; y += CFG.step) {
        if (inside(x, y)) pts.push([x, y]);
      }
    }

    // Render a sprite once per color (no per-frame redrawing)
    function sprite(color: string, cls: string) {
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const s = CFG.scale;
      const c = document.createElement('canvas');
      c.className = cls;
      c.width = (W + PAD * 2) * s * dpr;
      c.height = (H + PAD * 2) * s * dpr;
      c.style.width = (c.width / dpr) + 'px';
      c.style.height = (c.height / dpr) + 'px';
      const g = c.getContext('2d');
      if (g) {
        g.scale(dpr * s, dpr * s);
        g.translate(PAD, PAD);
        // Halo outline
        g.fillStyle = CFG.outline;
        for (const [x, y] of pts) {
          g.beginPath();
          g.arc(x, y, CFG.radius + 0.7, 0, Math.PI * 2);
          g.fill();
        }
        // Dots
        g.fillStyle = color;
        for (const [x, y] of pts) {
          g.beginPath();
          g.arc(x, y, CFG.radius, 0, Math.PI * 2);
          g.fill();
        }
      }
      return c;
    }

    const idle = sprite(CFG.color, 'idle');
    const hover = sprite(CFG.hoverColor, 'hover');
    // Offset so the arrow tip is exactly at the pointer hotspot (0, 0)
    idle.style.cssText += `top:${-PAD * CFG.scale}px;left:${-PAD * CFG.scale}px`;
    hover.style.cssText += `top:${-PAD * CFG.scale}px;left:${-PAD * CFG.scale}px`;
    inner.append(idle, hover);

    // Move with GPU transform only; one paint per animation frame
    let x = 0;
    let y = 0;
    let queued = false;

    const paint = () => {
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      queued = false;
    };

    const TEXT_INPUT_SELECTOR = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, [contenteditable="true"]';

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(TEXT_INPUT_SELECTOR)) {
        el.style.opacity = '0';
      } else {
        el.style.opacity = '1';
      }
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isTextInput = Boolean(target?.closest?.(TEXT_INPUT_SELECTOR));
      
      // If hovering on an input or textarea, hide custom dot cursor so native I-beam caret is cleanly visible
      if (isTextInput) {
        el.style.opacity = '0';
      } else {
        el.style.opacity = '1';
        el.classList.toggle('is-hover', Boolean(target?.closest?.(CFG.hoverSelector)));
      }
    };

    const onMouseDown = () => el.classList.add('is-down');
    const onMouseUp = () => el.classList.remove('is-down');
    const onMouseLeave = () => { el.style.opacity = '0'; };
    const onMouseEnter = () => { el.style.opacity = '1'; };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <div id="dot-cursor" ref={containerRef} aria-hidden="true">
      <div className="inner" ref={innerRef} />
    </div>
  );
}
