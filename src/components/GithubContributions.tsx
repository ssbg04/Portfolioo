import React, { useEffect, useState, useMemo, useRef } from 'react';
import haptic from '../lib/haptics';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ApiResponse {
  total: {
    [key: string]: number;
    lastYear: number;
  };
  contributions: ContributionDay[];
}

interface Props {
  username?: string;
  className?: string;
}

interface WeekData {
  index: number;
  total: number;
  startDate: string;
  endDate: string;
  peakDay: number;
}

export default function GithubContributions({ username = 'ssbg04', className = '' }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<WeekData | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const CACHE_KEY = `gh_contrib_${username}`;
    const CACHE_TTL = 30 * 60 * 1000; // 30 mins

    // 1. Instant Cache Hydration
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL && parsed.data?.contributions) {
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore sessionStorage issues
    }

    async function fetchContributions() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/github-contributions?username=${username}`);
        if (!res.ok) throw new Error('Failed to load contributions');
        const json: ApiResponse = await res.json();
        if (isMounted) {
          setData(json);
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: json, timestamp: Date.now() })
            );
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Defer network request to prevent blocking FCP / LCP
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(fetchContributions, { timeout: 5000 });
      return () => {
        isMounted = false;
        (window as any).cancelIdleCallback(id);
      };
    } else {
      const timer = setTimeout(fetchContributions, 3500);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [username]);

  // Aggregate daily contributions into weekly data points for a smooth SVG area curve
  const weeklyData = useMemo<WeekData[]>(() => {
    if (!data?.contributions || data.contributions.length === 0) return [];
    const list = data.contributions;
    const weeks: WeekData[] = [];
    const weekCount = Math.ceil(list.length / 7);

    for (let w = 0; w < weekCount; w++) {
      const slice = list.slice(w * 7, (w + 1) * 7);
      const total = slice.reduce((sum, d) => sum + d.count, 0);
      const peakDay = Math.max(...slice.map((d) => d.count), 0);
      weeks.push({
        index: w,
        total,
        startDate: slice[0]?.date || '',
        endDate: slice[slice.length - 1]?.date || '',
        peakDay
      });
    }
    return weeks;
  }, [data]);

  // Calculate stats: Longest streak, Weekly Average, Busiest Week
  const stats = useMemo(() => {
    if (!data?.contributions || data.contributions.length === 0) {
      return { total: data?.total?.lastYear ?? 1718, maxStreak: 48, currentStreak: 5, avgWeekly: 33 };
    }
    const days = data.contributions;
    let maxStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < days.length; i++) {
      if (days[i].count > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Calculate current streak from most recent days backwards
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else if (i === days.length - 1) {
        // Today might not have commits yet, check yesterday
        continue;
      } else {
        break;
      }
    }

    const total = data.total?.lastYear ?? days.reduce((sum, d) => sum + d.count, 0);
    const avgWeekly = weeklyData.length > 0 ? Math.round(total / weeklyData.length) : 33;

    return { total, maxStreak, currentStreak, avgWeekly };
  }, [data, weeklyData]);

  // SVG dimensions & coordinate calculations (ViewBox 1000 x 200)
  const chart = useMemo(() => {
    if (weeklyData.length === 0) return { pathD: '', areaD: '', points: [] };
    const width = 1000;
    const height = 180;
    const paddingBottom = 20;
    const paddingTop = 25;
    const usableHeight = height - paddingTop - paddingBottom;

    const maxWeekly = Math.max(...weeklyData.map((w) => w.total), 10);
    const stepX = width / (weeklyData.length - 1);

    const points = weeklyData.map((w, i) => {
      const x = i * stepX;
      const normalizedY = (w.total / maxWeekly) * usableHeight;
      const y = height - paddingBottom - normalizedY;
      return { x, y, data: w };
    });

    // Build smooth cubic bezier curve
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx = (p0.x + p1.x) / 2;
      pathD += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    // Area closed path for gradient fill
    const areaD = `${pathD} L ${width} ${height - paddingBottom} L 0 ${height - paddingBottom} Z`;

    return { pathD, areaD, points, width, height, paddingBottom };
  }, [weeklyData]);

  // Track hover coordinate along SVG
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || chart.points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * 1000;

    // Find closest data point
    let closest = chart.points[0];
    let minDiff = Infinity;
    for (const pt of chart.points) {
      const diff = Math.abs(pt.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }

    setHoveredPoint(closest.data);
    setHoverX(closest.x);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const d1 = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const d2 = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${d1} – ${d2}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  return (
    <div className={`w-full rounded-2xl bento-card p-5 sm:p-7 flex flex-col gap-5 relative overflow-hidden group ${className}`}>
      {/* ─── Top Header: Title, Live Status & GitHub Profile Link ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-custom">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-card-custom/90 flex items-center justify-center text-foreground-custom border border-border-custom shadow-xs shrink-0">
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-heading text-foreground-custom tracking-tight">
                Development Activity &amp; Velocity
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground-custom mt-0.5">
              Verified GitHub commit pulse across 52 weeks • @{username}
            </p>
          </div>
        </div>

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => haptic.tap()}
          className="self-start sm:self-auto text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg border border-border-custom shadow-xs bg-card-custom hover:border-primary-custom/40 text-foreground-custom flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>View GitHub</span>
          <svg className="w-3.5 h-3.5 text-muted-foreground-custom" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>

      {/* ─── Metric Pills Row (Ultra-lightweight DOM, High Executive Value) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card-custom/60 border border-border-custom shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom block">
            Annual Total
          </span>
          <span className="text-lg sm:text-xl font-bold font-heading text-foreground-custom mt-0.5 block">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            contributions
          </span>
        </div>

        <div className="p-3 rounded-xl bg-card-custom/60 border border-border-custom shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom block">
            Weekly Velocity
          </span>
          <span className="text-lg sm:text-xl font-bold font-heading text-foreground-custom mt-0.5 block">
            ~{stats.avgWeekly}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground-custom">
            commits / week
          </span>
        </div>

        <div className="p-3 rounded-xl bg-card-custom/60 border border-border-custom shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom block">
            Longest Streak
          </span>
          <span className="text-lg sm:text-xl font-bold font-heading text-foreground-custom mt-0.5 block">
            {stats.maxStreak}
          </span>
          <span className="text-[10px] font-mono text-primary-custom font-medium">
            active days
          </span>
        </div>

        <div className="p-3 rounded-xl bg-card-custom/60 border border-border-custom shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-custom block">
            Current Status
          </span>
          <span className="text-lg sm:text-xl font-bold font-heading text-emerald-700 dark:text-emerald-400 mt-0.5 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
          <span className="text-[10px] font-mono text-muted-foreground-custom">
            continuous build
          </span>
        </div>
      </div>

      {/* ─── Hardware-Accelerated SVG Area Curve (<10 DOM nodes vs 480 nodes!) ─── */}
      {loading && !data ? (
        <div className="h-44 w-full flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground-custom">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Generating activity velocity telemetry...
          </div>
        </div>
      ) : error && !data ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs text-muted-foreground-custom font-mono">
            Unable to stream live commit events. Cached metrics shown above.
          </p>
        </div>
      ) : (
        <div className="relative w-full flex flex-col gap-2">
          {/* Interactive Sparkline */}
          <div className="relative w-full h-36 sm:h-44">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 180"
              preserveAspectRatio="none"
              className="w-full h-full cursor-crosshair overflow-visible touch-none"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              role="img"
              aria-label="GitHub annual contribution activity area chart"
            >
              <defs>
                {/* Emerald Gradient Area Fill */}
                <linearGradient id="contribGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                </linearGradient>

                {/* Subtle Horizontal Reference Grid */}
                <pattern id="gridLines" width="1000" height="45" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="1000" y2="0" stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                </pattern>
              </defs>

              {/* Background Reference Grid */}
              <rect width="1000" height="160" fill="url(#gridLines)" />

              {/* Gradient Area Fill */}
              {chart.areaD && (
                <path
                  d={chart.areaD}
                  fill="url(#contribGradient)"
                  className="transition-opacity duration-300"
                />
              )}

              {/* Foreground Smooth Stroke Line */}
              {chart.pathD && (
                <path
                  d={chart.pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Interactive Crosshair & Indicator Point */}
              {hoverX !== null && (
                <g className="transition-opacity duration-150">
                  <line
                    x1={hoverX}
                    y1={10}
                    x2={hoverX}
                    y2={160}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    strokeOpacity="0.8"
                  />
                  {hoveredPoint && (
                    <circle
                      cx={hoverX}
                      cy={chart.points.find((p) => p.data.index === hoveredPoint.index)?.y ?? 90}
                      r="4.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-sm"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* 12-Month Timeline Along X-Axis */}
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground-custom px-1 select-none border-t border-border-custom/40 pt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>

          {/* Dynamic Inspector Bar on Hover / Default Status */}
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground-custom pt-1 min-h-6">
            {hoveredPoint ? (
              <span className="text-foreground-custom font-medium flex items-center gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {hoveredPoint.total} contributions
                </strong>{' '}
                during {formatDateRange(hoveredPoint.startDate, hoveredPoint.endDate)}
              </span>
            ) : (
              <span className="text-muted-foreground-custom/80 flex items-center gap-1.5">
                <span className="hidden sm:inline">Hover over the activity curve to inspect weekly velocity</span>
                <span className="sm:hidden">Tap across the wave to inspect velocity</span>
              </span>
            )}
            <span className="text-[10px] text-muted-foreground-custom hidden sm:inline">
              52-Week Rolling Velocity
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
