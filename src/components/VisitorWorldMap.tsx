import React, { useState, useEffect } from 'react';

interface CountryData {
  code: string;
  name: string;
  flag: string;
  x: number;
  y: number;
  count: number;
  percentage: number;
  isClient?: boolean;
}

interface GeoPayload {
  client: {
    countryCode: string;
    countryName: string;
    flag: string;
    city?: string;
    region?: string;
    coords: { x: number; y: number };
  };
  stats: {
    totalVisitors: number;
    totalCountries: number;
    topCountries: CountryData[];
    allCountries: CountryData[];
  };
}

export default function VisitorWorldMap() {
  const [data, setData] = useState<GeoPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/geo')
      .then((res) => res.json())
      .then((res: GeoPayload) => {
        if (mounted && res?.stats) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Geo error:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full bento-card p-4 sm:p-6 flex flex-col gap-4 border border-border-custom bg-card-custom rounded-2xl shadow-sm">
      {/* ── Header Telemetry Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border-custom">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-foreground-custom flex items-center gap-2">
              <span>Global Visitor Radar</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-foreground-custom/5 text-muted-foreground-custom border border-border-custom font-normal">
                LIVE TELEMETRY
              </span>
            </h3>
            <p className="text-xs text-muted-foreground-custom mt-0.5 font-mono">
              Real-time traffic origins detected via Cloudflare Edge
            </p>
          </div>
        </div>

        {/* Client Detected Location Badge */}
        {data?.client && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated-custom border border-border-custom text-xs font-mono text-foreground-custom self-start sm:self-auto">
            <span className="text-sm">{data.client.flag}</span>
            <span>
              Connected from{' '}
              <strong className="text-primary-custom font-semibold">
                {data.client.city ? `${data.client.city}, ` : ''}{data.client.countryName}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Interactive Map Canvas Container ── */}
      <div className="relative w-full aspect-[16/8.5] min-h-[220px] sm:min-h-[300px] rounded-xl overflow-hidden bg-background-custom/60 border border-border-custom flex items-center justify-center group/map select-none">
        {/* Subtle grid pattern backdrop */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--fg-color) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Simplified Continents Silhouette Overlay (SVG equirectangular projection) */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full opacity-[0.14] dark:opacity-[0.20] text-foreground-custom fill-current pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* North America */}
          <path d="M 80,120 Q 150,90 280,80 Q 320,130 260,180 Q 220,240 200,280 Q 170,250 140,210 Q 90,160 80,120 Z" />
          {/* South America */}
          <path d="M 280,290 Q 380,310 370,390 Q 340,460 300,470 Q 270,410 270,330 Z" />
          {/* Europe */}
          <path d="M 450,110 Q 560,90 560,170 Q 500,210 460,180 Q 430,150 450,110 Z" />
          {/* Africa */}
          <path d="M 460,200 Q 580,200 590,300 Q 550,420 500,430 Q 440,330 450,250 Z" />
          {/* Asia */}
          <path d="M 570,90 Q 820,70 870,200 Q 820,280 710,260 Q 640,230 580,150 Z" />
          {/* Australia */}
          <path d="M 790,340 Q 910,340 900,420 Q 830,450 790,400 Z" />
        </svg>

        {/* Radar Scanning Line Animation */}
        <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary-custom/10 to-transparent pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />

        {/* ── Interactive Country Blips ── */}
        {data?.stats?.allCountries?.map((country) => {
          const isClient = country.code === data.client.countryCode;
          const isHovered = hoveredCountry?.code === country.code;
          const hasTraffic = country.count > 0;

          return (
            <div
              key={country.code}
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
              }}
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => setHoveredCountry(country)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer p-2 group/dot touch-manipulation"
            >
              {/* Pulsing ring for client or top countries */}
              {(isClient || country.count > 25) && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-60 bg-primary-custom" />
              )}

              {/* Blip Center Dot */}
              <div
                className={`relative rounded-full transition-all duration-300 ${
                  isClient
                    ? 'w-3.5 h-3.5 bg-primary-custom ring-4 ring-primary-custom/30 shadow-[0_0_12px_var(--primary-color)]'
                    : isHovered
                    ? 'w-3 h-3 bg-foreground-custom ring-2 ring-primary-custom'
                    : hasTraffic
                    ? 'w-2 h-2 bg-primary-custom/80 hover:scale-150'
                    : 'w-1.5 h-1.5 bg-muted-foreground-custom/30'
                }`}
              />

              {/* Hover Tooltip Card */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl bg-card-custom/95 backdrop-blur-md border border-border-custom shadow-xl text-left pointer-events-none z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold font-heading text-xs text-foreground-custom">
                      <span className="text-sm">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </span>
                    {isClient && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary-custom text-white font-medium">
                        YOU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground-custom">
                    <span>Recorded Visitors:</span>
                    <strong className="text-foreground-custom font-semibold">{country.count}</strong>
                  </div>

                  {/* Share of Traffic Bar */}
                  <div className="w-full h-1.5 rounded-full bg-foreground-custom/10 mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary-custom rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(country.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legend / Overlay Note */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-3 text-[10px] font-mono text-muted-foreground-custom bg-card-custom/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-border-custom">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-custom shadow-[0_0_6px_var(--primary-color)]" />
            <span>Active / Recorded</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-custom animate-ping" />
            <span>Your Location</span>
          </span>
        </div>
      </div>

      {/* ── Top Country Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {data?.stats?.topCountries?.slice(0, 4).map((c) => (
          <div
            key={c.code}
            onMouseEnter={() => setHoveredCountry(c)}
            onMouseLeave={() => setHoveredCountry(null)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              hoveredCountry?.code === c.code
                ? 'border-primary-custom bg-elevated-custom'
                : 'border-border-custom bg-card-custom/50 hover:border-border-strong'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-base">{c.flag}</span>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground-custom truncate leading-none">
                  {c.name}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground-custom mt-1">
                  {c.percentage}% of traffic
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-foreground-custom pl-2">
              {c.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
