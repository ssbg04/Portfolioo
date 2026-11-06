import React, { useEffect, useState, useMemo, useRef } from 'react';
import haptic from '../lib/haptics';

export interface StatsResponse {
  total: number;
  maxStreak: number;
  currentStreak: number;
  avgWeekly: number;
  weeks: number[];
}

interface Props {
  username?: string;
  className?: string;
}

const DEFAULT_DATA: StatsResponse = {
  total: 1718,
  maxStreak: 48,
  currentStreak: 5,
  avgWeekly: 33,
  weeks: [
    15, 24, 30, 20, 38, 42, 28, 35, 40, 25, 30, 45, 32, 28, 36, 42,
    38, 26, 34, 40, 48, 33, 29, 37, 41, 35, 28, 36, 44, 39, 31, 27,
    38, 45, 32, 29, 35, 42, 48, 36, 30, 38, 44, 35, 28, 34, 40, 46,
    32, 26, 35, 30
  ]
};

export default function GithubContributions({ username = 'ssbg04', className = '' }: Props) {
  const [data, setData] = useState<StatsResponse>(DEFAULT_DATA);
  const [hoveredWeek, setHoveredWeek] = useState<{ index: number; count: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const CACHE_KEY = `gh_compact_${username}`;
    const CACHE_TTL = 30 * 60 * 1000; // 30 mins

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL && Array.isArray(parsed.data?.weeks)) {
          setData(parsed.data);
          return;
        }
      }
    } catch {
      // Ignore cache read errors
    }

    async function loadData() {
      try {
        const res = await fetch(`/api/github-contributions?username=${username}`);
        if (!res.ok) return;
        const json: StatsResponse = await res.json();
        if (isMounted && Array.isArray(json?.weeks) && json.weeks.length > 0) {
          setData(json);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: json, timestamp: Date.now() }));
          } catch {
            // Ignore cache write errors
          }
        }
      } catch {
        // Retain fallback data gracefully
      }
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(loadData, { timeout: 4000 });
      return () => {
        isMounted = false;
        (window as any).cancelIdleCallback(id);
      };
    } else {
      const timer = setTimeout(loadData, 2000);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [username]);

  // Generate lightweight SVG path coordinates (ViewBox 320 x 44)
  const chart = useMemo(() => {
    const weeks = data.weeks && data.weeks.length > 0 ? data.weeks : DEFAULT_DATA.weeks;
    const width = 320;
    const height = 44;
    const padTop = 6;
    const padBottom = 6;
    const usableHeight = height - padTop - padBottom;
    const maxVal = Math.max(...weeks, 1);
    const stepX = width / (weeks.length - 1);

    const points = weeks.map((val, i) => {
      const x = i * stepX;
      const normalizedY = (val / maxVal) * usableHeight;
      const y = height - padBottom - normalizedY;
      return { x, y, val, index: i };
    });

    if (points.length === 0) return { lineD: '', areaD: '', points: [] };

    // Build smooth cubic bezier path
    let lineD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      lineD += ` C ${mx.toFixed(1)} ${p0.y.toFixed(1)}, ${mx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }

    const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

    return { lineD, areaD, points };
  }, [data.weeks]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || chart.points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const targetIdx = Math.round(ratio * (chart.points.length - 1));
    const target = chart.points[targetIdx];
    if (target) {
      setHoveredWeek({
        index: target.index,
        count: target.val,
        x: target.x,
        y: target.y
      });
    }
  };

  const handlePointerLeave = () => {
    setHoveredWeek(null);
  };

  return (
    <div
      className={`bryl-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full group ${className}`}
    >
      {/* ─── Left Section: Brand & Aggregate Metric ─── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-foreground-custom/[0.04] border border-border-custom flex items-center justify-center text-foreground-custom shrink-0">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-foreground-custom tracking-tight">
              {data.total.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground-custom">
              commits
            </span>
          </div>
          <span className="text-[10px] font-mono text-subtle-custom">
            52-week activity // @{username}
          </span>
        </div>
      </div>

      {/* ─── Center Section: Ultra-Lightweight SVG Micro-Pulse Sparkline ─── */}
      <div className="w-full md:w-auto md:flex-1 md:max-w-md h-10 relative flex items-center px-1">
        <svg
          ref={svgRef}
          viewBox="0 0 320 44"
          preserveAspectRatio="none"
          className="w-full h-full cursor-crosshair overflow-visible touch-none text-foreground-custom"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          role="img"
          aria-label="GitHub annual contribution activity sparkline"
        >
          {/* Subtle baseline */}
          <line x1="0" y1="43" x2="320" y2="43" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />

          {/* Area fill */}
          {chart.areaD && (
            <path d={chart.areaD} fill="currentColor" fillOpacity="0.06" />
          )}

          {/* Sparkline curve */}
          {chart.lineD && (
            <path
              d={chart.lineD}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.85"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover interactive point */}
          {hoveredWeek && (
            <g>
              <line
                x1={hoveredWeek.x}
                y1="0"
                x2={hoveredWeek.x}
                y2="44"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoveredWeek.x}
                cy={hoveredWeek.y}
                r="3.5"
                fill="var(--background-color, #ffffff)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Micro-Badge */}
        {hoveredWeek && (
          <div
            className="absolute -top-6 pointer-events-none transform -translate-x-1/2 px-2 py-0.5 rounded bg-foreground-custom text-background-custom text-[10px] font-mono whitespace-nowrap shadow-xs z-20"
            style={{ left: `${(hoveredWeek.x / 320) * 100}%` }}
          >
            {hoveredWeek.count} commits
          </div>
        )}
      </div>

      {/* ─── Right Section: Streak & External Direct Link ─── */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs font-mono self-end md:self-auto">
        <div className="flex items-center gap-1.5 text-muted-foreground-custom text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground-custom animate-pulse opacity-70" />
          <span>{data.maxStreak}d streak</span>
        </div>

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => haptic.tap()}
          className="text-xs font-mono text-foreground-custom hover:underline transition-all inline-flex items-center gap-1"
        >
          <span>GitHub</span>
          <span className="text-[10px] opacity-60" aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
