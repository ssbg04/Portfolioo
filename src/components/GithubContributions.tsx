import React, { useEffect, useState, useMemo } from 'react';
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
}

export default function GithubContributions({ username = 'ssbg04' }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchContributions() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/github-contributions?username=${username}`);
        if (!res.ok) throw new Error('Failed to load contributions');
        const json: ApiResponse = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchContributions();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Group into weeks of 7 days
  const weeks = useMemo(() => {
    if (!data || !data.contributions || data.contributions.length === 0) return [];
    const list = data.contributions;
    const result: ContributionDay[][] = [];
    for (let i = 0; i < list.length; i += 7) {
      result.push(list.slice(i, i + 7));
    }
    return result;
  }, [data]);

  // Generate month headers
  const monthLabels = useMemo(() => {
    if (weeks.length === 0) return [];
    const labels: { name: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
      if (week.length > 0) {
        const d = new Date(week[0].date);
        const m = d.getMonth();
        if (m !== lastMonth && index - (labels[labels.length - 1]?.index ?? -10) >= 3) {
          labels.push({
            name: d.toLocaleDateString('en-US', { month: 'short' }),
            index
          });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  const totalCount = data?.total?.lastYear ?? 880;

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-500/35 dark:bg-emerald-500/40 hover:ring-2 hover:ring-emerald-400';
      case 2:
        return 'bg-emerald-500/60 dark:bg-emerald-500/65 hover:ring-2 hover:ring-emerald-300';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-400 hover:ring-2 hover:ring-emerald-200';
      case 4:
        return 'bg-emerald-400 dark:bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.45)] hover:ring-2 hover:ring-white';
      case 0:
      default:
        return 'bg-foreground-custom/[0.06] dark:bg-zinc-800/80 hover:bg-foreground-custom/15';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-3xl glass-card border border-border-custom p-4 sm:p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group">
      {/* ─── Top Row: Title, Stats & GitHub Link ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-custom/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-foreground-custom/5 dark:bg-zinc-800 flex items-center justify-center text-foreground-custom border border-border-custom/80 shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-heading text-foreground-custom">
                GitHub Contributions
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Live Activity
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground-custom mt-0.5">
              @{username} • <span className="font-semibold text-foreground-custom">{totalCount.toLocaleString()}</span> contributions in the last year
            </p>
          </div>
        </div>

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => haptic.tap()}
          className="self-start sm:self-auto text-xs font-mono font-medium px-3 py-1.5 rounded-xl border border-border-custom hover:border-primary-custom/40 bg-foreground-custom/[0.02] hover:bg-primary-custom/10 text-foreground-custom flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Profile</span>
          <svg className="w-3 h-3 text-muted-foreground-custom" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>

      {/* ─── Center Grid / Heatmap ─── */}
      {loading ? (
        <div className="h-32 w-full flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground-custom">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Loading GitHub activity matrix...
          </div>
        </div>
      ) : error ? (
        <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-xs text-muted-foreground-custom font-mono">
            Unable to fetch live GitHub stream. Direct chart view:
          </p>
          <img
            src={`https://ghchart.rshah.org/ssbg04`}
            alt="GitHub Contributions Chart"
            className="max-w-full rounded-xl opacity-90 invert dark:invert-0"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative flex flex-col gap-1.5">
          {/* Month Labels along the top */}
          <div className="flex items-center text-[10px] font-mono text-muted-foreground-custom pl-7 overflow-x-auto no-scrollbar select-none">
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => {
                const label = monthLabels.find((l) => l.index === wIdx);
                return (
                  <div key={wIdx} className="w-[11px] h-4 flex items-center shrink-0">
                    {label && (
                      <span className="absolute text-[10px] font-mono text-muted-foreground-custom whitespace-nowrap">
                        {label.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap with Row Labels on Left */}
          <div className="flex items-start gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* Weekday indicators */}
            <div className="flex flex-col gap-[3px] text-[9px] font-mono text-muted-foreground-custom select-none pt-0.5 shrink-0">
              <span className="h-[11px] leading-[11px]">Sun</span>
              <span className="h-[11px] leading-[11px]">Mon</span>
              <span className="h-[11px] leading-[11px]">Tue</span>
              <span className="h-[11px] leading-[11px]">Wed</span>
              <span className="h-[11px] leading-[11px]">Thu</span>
              <span className="h-[11px] leading-[11px]">Fri</span>
              <span className="h-[11px] leading-[11px]">Sat</span>
            </div>

            {/* Grid Columns (Weeks) */}
            <div className="flex gap-[3px] shrink-0">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[11px] h-[11px] rounded-[2.5px] transition-all cursor-pointer ${getLevelColor(day.level)}`}
                      title={`${day.count} contributions on ${formatDate(day.date)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer Details: Hover Date & Level Legend ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border-custom/40 text-[11px] font-mono text-muted-foreground-custom">
        <div className="min-h-5 flex items-center">
          {hoveredDay ? (
            <span className="text-foreground-custom flex items-center gap-1.5 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="font-semibold">{hoveredDay.count}</strong> contributions on {formatDate(hoveredDay.date)}
            </span>
          ) : (
            <span className="text-muted-foreground-custom/80">
              Hover over squares to see daily contribution activity
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto select-none">
          <span className="text-[10px]">Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-foreground-custom/[0.06] dark:bg-zinc-800/80" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/35 dark:bg-emerald-500/40" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/60 dark:bg-emerald-500/65" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500 dark:bg-emerald-400" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400 dark:bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.45)]" />
          <span className="text-[10px]">More</span>
        </div>
      </div>
    </div>
  );
}
