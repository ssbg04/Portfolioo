import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import haptic from '../lib/haptics';

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

/**
 * 100x50 High-Accuracy Equirectangular World Map Dot-Matrix Bitmask
 * Mathematically aligned with Natural Earth 50m physical geography
 * '#' = Landmass dot | '.' = Ocean
 * Matches 2:1 aspect ratio (1000x500 SVG viewBox)
 */
const WORLD_DOT_MATRIX: string[] = [
  "....................................................................................................",
  "...........................######....#######........................................................",
  "....................###########################.....########..#######..##.#####.....................",
  "...............###############################......#######.......####....########.....###.##.......",
  "...............###############...#############.........#........####.#################.#####........",
  "#..#############################..###########..#.....########.######################################",
  "#################################..#######.####.....################################################",
  ".################################..####....######..#################################################",
  ".########################..######...###........###.###############################################..",
  "..######....#######################............###..######################################...####...",
  "####.........######################............###########################################...##..###",
  "..............######################............###########################################.##......",
  "...............#####################...........##############################################.......",
  "...............################................#################.##########################.........",
  "...............###############...........###...###########################################..........",
  "................##############...............#.#####################################.#####..........",
  ".................###########...##............########################################.#.............",
  ".................#######..###...............########################################.##..#..........",
  ".....##...........#####..######..............########################################...............",
  "......#............##############............######################..#############.#......#.........",
  ".....................######.#.####........##.#####################....####..#####..##.....#.........",
  "........................###..#####...........#####################....###..#.####..##.....#.....#...",
  "..........................########...........####################.....###..######.####.##...#...#...",
  ".....#......................########..........##################......#.#...###.######.......#.#.#..",
  "......#.................#..##########..............#############......#.....###########..........##.",
  "..#.....................##.#############............##########...............################...###.",
  ".##...#....................##############............#########...#............################......",
  "..#........#...............##############....##......#########........#........########.#########..#",
  "###....#....................############.............###########....................#######.#.###..#",
  "#......####.................############........#....############..................########.....#..#",
  "###..#....###.................#########..............########.##.##...............##########..####.#",
  "..............#...............#########..............#######..##.................############..##.#.",
  "...................#..........#######.................######..#..................############.......",
  "..............................#######.................#####......................############.......",
  "............................########..................####.......................####..######....##.",
  ".............................######....................................................#####......##",
  ".............................####........................................................###.....###",
  "##..........................####................................#.........................##....###.",
  "............................####............................#........#..........................#...",
  ".............................###.#.....#..............................#.........................##..",
  ".............................####......##.....................................................#.....",
  "..................................#..#....#.........................................................",
  "................................###.................................................................",
  "..............................####...........................#########.######################..#....",
  ".....................###....######............####################################################..",
  ".........#########################.........#######################################################..",
  "....#############################..###.###########################################################..",
  ".#..#############################################################################################...",
  "#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.",
  "....................................................................................................",
];

export default function VisitorWorldMap() {
  const [data, setData] = useState<GeoPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const activeCountry = hoveredCountry || selectedCountry;

  const [mounted, setMounted] = useState(false);

  // Fullscreen War-Room Lightbox State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const modalCanvasRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const isDraggingRef = useRef(isDragging);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const clampPan = (newPan: { x: number; y: number }, currentZoom: number) => {
    if (currentZoom <= 1) return { x: 0, y: 0 };
    const canvas = modalCanvasRef.current;
    const w = canvas ? canvas.clientWidth : 800;
    const h = canvas ? canvas.clientHeight : 450;
    const maxPanX = (w * (currentZoom - 1)) / 1.5;
    const maxPanY = (h * (currentZoom - 1)) / 1.5;
    return {
      x: Math.min(Math.max(newPan.x, -maxPanX), maxPanX),
      y: Math.min(Math.max(newPan.y, -maxPanY), maxPanY),
    };
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-calculate the SVG coordinates for the landmass dot matrix
  const landDots = useMemo(() => {
    const dots: { cx: number; cy: number; key: string }[] = [];
    const rows = WORLD_DOT_MATRIX.length; // 40
    const cols = WORLD_DOT_MATRIX[0].length; // 80
    const cellW = 1000 / cols; // 12.5
    const cellH = 500 / rows; // 12.5

    for (let r = 0; r < rows; r++) {
      const rowStr = WORLD_DOT_MATRIX[r];
      for (let c = 0; c < cols; c++) {
        if (rowStr[c] === '#') {
          dots.push({
            cx: c * cellW + cellW / 2,
            cy: r * cellH + cellH / 2,
            key: `${r}-${c}`,
          });
        }
      }
    }
    return dots;
  }, []);

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

  // Keyboard navigation for fullscreen modal
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSearchQuery('');
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => Math.min(Number((z + 0.5).toFixed(2)), 4));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((z) => {
          const next = Math.max(Number((z - 0.5).toFixed(2)), 1);
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Zoom controls
  const handleZoomIn = () => {
    haptic.tick();
    setZoom((z) => Math.min(Number((z + 0.5).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    haptic.tick();
    setZoom((z) => {
      const next = Math.max(Number((z - 0.5).toFixed(2)), 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    haptic.tick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mobile Touch Gestures: Pinch-to-zoom & 1-finger pan on the modal canvas
  useEffect(() => {
    if (!isFullscreen) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;

    let initialDist = 0;
    let initialZoom = 1;
    let initialPan = { x: 0, y: 0 };
    let startMid = { x: 0, y: 0 };
    let isPinching = false;
    let isTouching = false;
    let lastTapTime = 0;

    const getDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input')) {
        return;
      }

      if (e.touches.length === 1) {
        const now = Date.now();
        // Double-tap to quick toggle 1x / 2.5x
        if (now - lastTapTime < 300) {
          e.preventDefault();
          haptic.tap();
          if (zoomRef.current > 1) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          } else {
            setZoom(2.5);
          }
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;

        if (zoomRef.current > 1) {
          e.preventDefault();
          isTouching = true;
          isPinching = false;
          startMid = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          initialPan = { ...panRef.current };
          setIsDragging(true);
        }
      } else if (e.touches.length >= 2) {
        e.preventDefault();
        isPinching = true;
        isTouching = false;
        initialDist = getDistance(e.touches[0], e.touches[1]);
        initialZoom = zoomRef.current;
        initialPan = { ...panRef.current };
        startMid = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPinching && e.touches.length >= 2) {
        e.preventDefault();
        const currentDist = getDistance(e.touches[0], e.touches[1]);
        if (initialDist > 0) {
          const factor = currentDist / initialDist;
          const newZoom = Math.min(Math.max(Number((initialZoom * factor).toFixed(2)), 1), 4);
          setZoom(newZoom);
          if (newZoom === 1) {
            setPan({ x: 0, y: 0 });
          }
        }

        const currentMid = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        setPan(clampPan({
          x: initialPan.x + (currentMid.x - startMid.x),
          y: initialPan.y + (currentMid.y - startMid.y),
        }, zoomRef.current));
      } else if (isTouching && e.touches.length === 1 && zoomRef.current > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - startMid.x;
        const dy = e.touches[0].clientY - startMid.y;
        setPan(clampPan({
          x: initialPan.x + dx,
          y: initialPan.y + dy,
        }, zoomRef.current));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        isTouching = false;
        isPinching = false;
        setIsDragging(false);
      } else if (e.touches.length === 1) {
        isPinching = false;
        if (zoomRef.current > 1) {
          isTouching = true;
          startMid = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          initialPan = { ...panRef.current };
        } else {
          isTouching = false;
          setIsDragging(false);
        }
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isFullscreen]);

  // Drag & pan handlers when zoomed in (Mouse / Desktop)
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan(clampPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    }, zoom));
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 1), 4);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Helper to render map blips with smart positioning and high-contrast readability
  const renderCountryBlips = (isModal = false) => {
    if (!data?.stats?.allCountries) return null;

    return data.stats.allCountries.map((country) => {
      const isClient = country.code === data.client.countryCode;
      const isHovered = hoveredCountry?.code === country.code;
      const isSelected = selectedCountry?.code === country.code;
      const isActive = isHovered || isSelected;
      const hasTraffic = country.count > 0;
      const matchesSearch =
        searchQuery.trim() !== '' &&
        (country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.code.toLowerCase().includes(searchQuery.toLowerCase()));

      // Smart vertical placement:
      // If dot is in top 45% (northern hemisphere), place tooltip BELOW the dot to avoid container clipping
      // If dot is in bottom 55% (southern hemisphere), place tooltip ABOVE the dot
      const verticalPos = country.y < 45 ? 'top-full mt-2.5' : 'bottom-full mb-2.5';

      // Smart horizontal alignment:
      // If dot is near right edge (x > 75%), anchor to right
      // If dot is near left edge (x < 25%), anchor to left
      // Otherwise center
      const horizontalPos =
        country.x > 75
          ? 'right-0'
          : country.x < 25
          ? 'left-0'
          : 'left-1/2 -translate-x-1/2';

      return (
        <div
          key={country.code}
          style={{
            left: `${country.x}%`,
            top: `${country.y}%`,
          }}
          onMouseEnter={() => {
            if (isDraggingRef.current) return;
            setHoveredCountry(country);
          }}
          onMouseLeave={() => {
            if (isDraggingRef.current) return;
            setHoveredCountry(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            haptic.tap();
            setSelectedCountry((prev) => (prev?.code === country.code ? null : country));
            setHoveredCountry(country);
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer p-2.5 group/dot touch-manipulation"
        >
          {/* Pulsing beacon for client or active traffic or search match */}
          {(isClient || country.count > 0 || matchesSearch) && (
            <span
              className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                matchesSearch
                  ? 'bg-amber-400 ring-4 ring-amber-400/50'
                  : isClient
                  ? 'bg-primary-custom'
                  : 'bg-primary-custom/60'
              }`}
            />
          )}

          {/* Blip Center Dot */}
          <div
            className={`relative rounded-full transition-all duration-300 ${
              matchesSearch
                ? 'w-4 h-4 bg-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_16px_rgba(251,191,36,0.9)] animate-pulse'
                : isClient
                ? 'w-3.5 h-3.5 bg-primary-custom ring-4 ring-primary-custom/30 shadow-[0_0_12px_var(--primary-color)]'
                : isActive
                ? 'w-3.5 h-3.5 bg-foreground-custom ring-2 ring-primary-custom shadow-md scale-125'
                : hasTraffic
                ? 'w-2.5 h-2.5 bg-primary-custom shadow-[0_0_8px_var(--primary-color)] hover:scale-150'
                : 'w-1.5 h-1.5 bg-muted-foreground-custom/30 hover:bg-muted-foreground-custom/70'
            }`}
          />

          {/* High-Contrast Readable Tooltip Card (Theme-Adaptive & Counter-Scaled) */}
          {(isActive || (isModal && matchesSearch)) && (
            <div
              style={{
                transform: isModal && zoom > 1 ? `scale(${1 / zoom})` : undefined,
                transformOrigin: country.y < 45
                  ? (country.x > 75 ? 'top right' : country.x < 25 ? 'top left' : 'top center')
                  : (country.x > 75 ? 'bottom right' : country.x < 25 ? 'bottom left' : 'bottom center'),
              }}
              className={`absolute ${verticalPos} ${horizontalPos} hidden sm:block w-56 p-3 rounded-xl border-2 border-primary-custom/40 shadow-2xl text-left pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl bg-card-custom/95 text-foreground-custom`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-border-custom">
                <span className="flex items-center gap-2 font-bold font-heading text-xs truncate">
                  <span className="text-base shrink-0">{country.flag}</span>
                  <span className="truncate">{country.name}</span>
                </span>
                {isClient && (
                  <span className="shrink-0 text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary-custom text-white font-bold tracking-wider shadow-xs">
                    YOU
                  </span>
                )}
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground-custom">Recorded Sessions:</span>
                  <strong className="font-bold text-foreground-custom text-xs">
                    {country.count} {country.count === 1 ? 'session' : 'sessions'}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground-custom">Traffic Share:</span>
                  <span className="font-semibold text-primary-custom">
                    {country.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-foreground-custom/10 overflow-hidden mt-1">
                  <div
                    className="h-full bg-primary-custom rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(country.percentage, country.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full bento-card p-4 sm:p-6 md:p-7 flex flex-col gap-4 sm:gap-5 border border-border-custom bg-card-custom rounded-2xl shadow-sm">
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
                REAL-TIME TELEMETRY
              </span>
            </h3>
            <p className="text-xs text-muted-foreground-custom mt-0.5 font-mono">
              Live traffic origins detected via Cloudflare Edge
            </p>
          </div>
        </div>

        {/* Right Action Bar: Client Location Badge + Fullscreen Expand Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {data?.client && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated-custom border border-border-custom text-xs font-mono text-foreground-custom">
              <span className="text-sm">{data.client.flag}</span>
              <span>
                Connected from{' '}
                <strong className="text-primary-custom font-semibold">
                  {data.client.city ? `${data.client.city}, ` : ''}
                  {data.client.countryName}
                </strong>
              </span>
            </div>
          )}

          {/* Expand to Fullscreen War-Room Button */}
          <button
            id="world-map-header-expand-btn"
            type="button"
            onClick={() => {
              haptic.openModal();
              setIsFullscreen(true);
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-custom hover:bg-elevated-custom border border-border-custom text-xs font-mono font-medium text-foreground-custom shadow-xs hover:border-primary-custom/40 transition-all cursor-pointer active:scale-95"
            title="Expand to interactive fullscreen war-room view"
          >
            <svg className="w-3.5 h-3.5 text-primary-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span className="hidden sm:inline">Expand Fullscreen</span>
            <span className="sm:hidden">Expand</span>
          </button>
        </div>
      </div>

      {/* ── Spacious Interactive Dot-Matrix Map Container ── */}
      <div className="relative w-full aspect-[16/8] min-h-[280px] sm:min-h-[380px] md:min-h-[440px] rounded-xl overflow-hidden bg-background-custom/60 border border-border-custom flex items-center justify-center group/map select-none">
        {/* Dot-Matrix World SVG */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full text-foreground-custom pointer-events-none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Subtle background ocean matrix */}
            <pattern
              id="ocean-dot-matrix"
              x="0"
              y="0"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="5"
                cy="5"
                r="0.85"
                className="fill-current opacity-[0.06] dark:opacity-[0.08]"
              />
            </pattern>
          </defs>

          {/* Render Ocean Sub-Grid */}
          <rect width="1000" height="500" fill="url(#ocean-dot-matrix)" />

          {/* Render Continental Landmass Dot Matrix */}
          <g className="fill-current opacity-[0.22] dark:opacity-[0.32]">
            {landDots.map((dot) => (
              <circle
                key={dot.key}
                cx={dot.cx}
                cy={dot.cy}
                r="2.2"
              />
            ))}
          </g>
        </svg>

        {/* Radar Scanning Line Animation */}
        <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary-custom/10 to-transparent pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />

        {/* ── Interactive Country Blips ── */}
        {renderCountryBlips(false)}

        {/* ── Active Inspector HUD Overlay (Top Right Corner) ── */}
        <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card-custom/95 backdrop-blur-md border border-border-custom shadow-md max-w-xs pointer-events-none transition-all z-30">
          <span className="text-xl shrink-0">
            {activeCountry ? activeCountry.flag : data?.client?.flag || '🌐'}
          </span>
          <div className="truncate text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-heading text-foreground-custom truncate">
                {activeCountry
                  ? activeCountry.name
                  : data?.client
                  ? `${data.client.city ? data.client.city + ', ' : ''}${data.client.countryName}`
                  : 'Resolving Location...'}
              </span>
              {(activeCountry?.isClient || (!activeCountry && data?.client)) && (
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-primary-custom text-white font-bold">
                  YOU
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground-custom mt-0.5">
              {activeCountry
                ? `${activeCountry.count} recorded ${activeCountry.count === 1 ? 'session' : 'sessions'} (${activeCountry.percentage}% share)`
                : data?.stats?.totalVisitors
                ? `${data.stats.totalVisitors} real sessions • Hover dot for info`
                : 'Real-time telemetry'}
            </p>
          </div>
        </div>

        {/* Legend / Overlay Note with Expand Callout */}
        <div className="absolute bottom-2.5 left-3 flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-foreground-custom bg-card-custom/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-border-custom shadow-xs z-30">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-custom shadow-[0_0_6px_var(--primary-color)]" />
            <span>Active Origin</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-custom animate-ping" />
            <span>Your Location</span>
          </span>
          <button
            id="world-map-legend-expand-btn"
            type="button"
            onClick={() => {
              haptic.tap();
              setIsFullscreen(true);
            }}
            className="text-primary-custom hover:underline font-medium cursor-pointer hidden md:inline"
          >
            Click to expand war-room ↗
          </button>
        </div>
      </div>

      {/* ── Top Country Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {data?.stats?.topCountries && data.stats.topCountries.length > 0 ? (
          data.stats.topCountries.slice(0, 4).map((c) => (
            <div
              key={c.code}
              onMouseEnter={() => setHoveredCountry(c)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => setHoveredCountry(c)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                hoveredCountry?.code === c.code
                  ? 'border-primary-custom bg-elevated-custom'
                  : 'border-border-custom bg-card-custom/50 hover:border-primary-custom/30'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base shrink-0">{c.flag}</span>
                <div className="truncate">
                  <p className="text-xs font-semibold text-foreground-custom truncate leading-none">
                    {c.name}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground-custom mt-1">
                    {c.percentage}% of traffic
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground-custom pl-2 shrink-0">
                {c.count}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-2 sm:col-span-4 p-3 rounded-xl border border-dashed border-border-custom text-center text-xs font-mono text-muted-foreground-custom">
            Real visitor data is actively accumulating via Cloudflare Edge...
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          CINEMA FULLSCREEN WAR-ROOM LIGHTBOX MODAL (Matching Photo Gallery Preview)
         ══════════════════════════════════════════════════════════════════════════════ */}
      {mounted && isFullscreen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md select-none animate-modal-fade text-foreground-custom"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={() => {
            haptic.tap();
            setIsFullscreen(false);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setSearchQuery('');
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* ── Top Bar Controls: Telemetry info, Search, Zoom Toolbar, Leaderboard, Close ── */}
          <div
            className="w-full max-w-6xl flex items-center justify-between gap-2 sm:gap-3 z-50 py-1.5 px-3 bg-card-custom/95 border border-border-custom rounded-xl shadow-xl backdrop-blur-md shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Telemetry status badge */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="truncate">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground-custom truncate block">
                  GLOBAL RADAR
                </span>
                <span className="text-[10px] font-mono text-muted-foreground-custom hidden sm:inline">
                  {data?.stats?.totalVisitors || 0} sessions • {data?.stats?.totalCountries || 0} countries
                </span>
              </div>
            </div>

            {/* Center: Search country input */}
            <div className="relative hidden md:block w-64 lg:w-72">
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground-custom pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find country (e.g. Philippines, USA)..."
                className="w-full bg-elevated-custom border border-border-custom rounded-lg pl-8 pr-7 py-1 text-xs text-foreground-custom placeholder:text-muted-foreground-custom font-mono focus:outline-none focus:border-primary-custom shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground-custom hover:text-foreground-custom text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Right: Zoom Toolbar, Leaderboard Drawer Toggle, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Zoom Toolbar */}
              <div className="flex items-center bg-card-custom border border-border-custom rounded-lg p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="p-1.5 rounded-md text-foreground-custom hover:bg-foreground-custom/5 disabled:opacity-30 cursor-pointer transition-all text-xs flex items-center"
                  title="Zoom Out (-)"
                  aria-label="Zoom out"
                >
                  <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-0.5 text-[11px] font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors cursor-pointer"
                  title="Reset Zoom (0)"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 4}
                  className="p-1.5 rounded-md text-foreground-custom hover:bg-foreground-custom/5 disabled:opacity-30 cursor-pointer transition-all text-xs flex items-center"
                  title="Zoom In (+)"
                  aria-label="Zoom in"
                >
                  <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Leaderboard Drawer Toggle */}
              <button
                type="button"
                onClick={() => {
                  haptic.tap();
                  setIsLeaderboardOpen(!isLeaderboardOpen);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono border shadow-xs transition-all cursor-pointer ${
                  isLeaderboardOpen
                    ? 'bg-primary-custom text-white border-primary-custom font-medium'
                    : 'bg-card-custom text-muted-foreground-custom hover:text-foreground-custom border-border-custom hover:border-border-custom/80'
                }`}
                title="Toggle Country Leaderboard"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <span className="hidden sm:inline">Leaderboard</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  haptic.tap();
                  setIsFullscreen(false);
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setSearchQuery('');
                }}
                className="p-1.5 sm:p-2 rounded-lg bg-card-custom hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 text-muted-foreground-custom transition-all cursor-pointer border border-border-custom shadow-xs"
                aria-label="Close fullscreen radar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Main Full-Modal Viewport Container (Centered Card Frame that takes the screen) ── */}
          <div
            className="relative w-full max-w-6xl flex-1 flex flex-col items-center justify-center my-auto min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={modalCanvasRef}
              className={`relative w-full h-full max-h-[78vh] sm:max-h-[82vh] rounded-2xl overflow-hidden border border-border-custom bg-card-custom/95 shadow-2xl flex items-center justify-center p-2 sm:p-4 select-none touch-none ${
                zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              }`}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onWheel={handleWheel}
              onClick={() => {
                setSelectedCountry(null);
                setHoveredCountry(null);
              }}
            >
              {/* Scalable & Draggable Canvas Frame */}
              <div
                className="relative w-full h-full flex items-center justify-center select-none"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Strict 2:1 Aspect Ratio Canvas Frame that expands cleanly */}
                <div
                  className="relative w-full aspect-[2/1] flex items-center justify-center"
                  style={{
                    width: 'min(100%, calc((100vh - 180px) * 2))',
                    maxHeight: '100%',
                  }}
                >
                  {/* Dot-Matrix World SVG */}
                  <svg
                    viewBox="0 0 1000 500"
                    className="w-full h-full text-foreground-custom pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <pattern
                        id="fullscreen-ocean-matrix"
                        x="0"
                        y="0"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="5" cy="5" r="0.85" className="fill-current opacity-[0.06] dark:opacity-[0.10]" />
                      </pattern>
                    </defs>

                    <rect width="1000" height="500" fill="url(#fullscreen-ocean-matrix)" />

                    <g className="fill-current opacity-[0.25] dark:opacity-[0.35]">
                      {landDots.map((dot) => (
                        <circle key={dot.key} cx={dot.cx} cy={dot.cy} r="2.2" />
                      ))}
                    </g>
                  </svg>

                  {/* Radar sweep line */}
                  <div className="absolute inset-y-0 w-48 bg-gradient-to-r from-transparent via-primary-custom/15 to-transparent pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />

                  {/* Render country blips */}
                  {renderCountryBlips(true)}
                </div>
              </div>

              {/* Live Hover Telemetry Inspector HUD (Top Left Corner inside card - Desktop & Tablet) */}
              <div className="absolute top-3 left-3 z-30 hidden sm:flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-card-custom/95 backdrop-blur-xl border border-border-custom shadow-xl max-w-sm pointer-events-none">
                <span className="text-2xl shrink-0">
                  {activeCountry ? activeCountry.flag : data?.client?.flag || '🌐'}
                </span>
                <div className="truncate text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-heading text-foreground-custom truncate">
                      {activeCountry
                        ? activeCountry.name
                        : data?.client
                        ? `${data.client.city ? data.client.city + ', ' : ''}${data.client.countryName}`
                        : 'Resolving Location...'}
                    </span>
                    {(activeCountry?.isClient || (!activeCountry && data?.client)) && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary-custom text-white font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground-custom mt-0.5 truncate">
                    {activeCountry
                      ? `${activeCountry.count} ${activeCountry.count === 1 ? 'session' : 'sessions'} • ${activeCountry.percentage}% total traffic`
                      : data?.stats?.totalVisitors
                      ? `${data.stats.totalVisitors} real sessions • Hover dot for country telemetry`
                      : 'Real-time Edge telemetry'}
                  </p>
                </div>
              </div>

              {/* Mobile Responsive Pinpoint Info Card (Always Readable at Any Zoom Level) */}
              {activeCountry && (
                <div
                  className="absolute bottom-2.5 inset-x-2 sm:hidden z-30 flex items-center justify-between gap-2.5 p-3 rounded-xl bg-card-custom/95 backdrop-blur-xl border border-primary-custom/40 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{activeCountry.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-heading text-foreground-custom truncate">
                          {activeCountry.name}
                        </span>
                        {activeCountry.isClient && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-primary-custom text-white font-bold tracking-wider shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground-custom truncate mt-0.5">
                        {activeCountry.count} {activeCountry.count === 1 ? 'session' : 'sessions'} • {activeCountry.percentage}% total traffic
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.tap();
                      setHoveredCountry(null);
                      setSelectedCountry(null);
                    }}
                    className="p-1.5 rounded-lg bg-card-custom hover:bg-elevated-custom text-muted-foreground-custom hover:text-foreground-custom text-xs cursor-pointer border border-border-custom shrink-0"
                    aria-label="Dismiss pinpoint info"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Collapsible Leaderboard Side Drawer (Theme Adaptive) */}
              {isLeaderboardOpen && (
                <div
                  className="absolute top-0 right-0 bottom-0 w-80 max-w-full bg-card-custom/95 backdrop-blur-2xl border-l border-border-custom p-4 flex flex-col z-40 animate-in slide-in-from-right duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground-custom">
                        Country Leaderboard
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated-custom text-muted-foreground-custom border border-border-custom">
                        {data?.stats?.allCountries?.filter((c) => c.count > 0).length || 0} active
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLeaderboardOpen(false)}
                      className="text-muted-foreground-custom hover:text-foreground-custom text-xs cursor-pointer p-1 rounded hover:bg-elevated-custom"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 no-scrollbar">
                    {data?.stats?.allCountries
                      ?.slice()
                      .filter((c) => c.count > 0 || c.isClient)
                      .sort((a, b) => b.count - a.count)
                      .map((country, rank) => (
                        <div
                          key={country.code}
                          onClick={() => {
                            haptic.tap();
                            setHoveredCountry(country);
                            setSearchQuery(country.name);
                          }}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            hoveredCountry?.code === country.code
                              ? 'border-primary-custom bg-primary-custom/15 text-foreground-custom'
                              : 'border-border-custom bg-card-custom/50 hover:bg-elevated-custom text-foreground-custom'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono text-muted-foreground-custom w-4">
                              #{rank + 1}
                            </span>
                            <span className="text-base">{country.flag}</span>
                            <span className="font-medium truncate">{country.name}</span>
                            {country.isClient && (
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-primary-custom text-white font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="font-bold text-foreground-custom">{country.count}</span>
                            <span className="text-[10px] text-muted-foreground-custom">
                              ({country.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Floating Bottom Hint Bar ── */}
          <div
            className="w-full max-w-6xl flex items-center justify-between gap-3 z-50 py-1 px-2 text-[11px] font-mono text-muted-foreground-custom shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="hidden sm:inline">
              Scroll / Pinch to zoom • Drag to pan • Click country for telemetry
            </span>
            <span className="sm:hidden">
              Pinch to zoom • Drag to pan
            </span>
            <span className="ml-auto">
              Press <kbd className="px-1.5 py-0.5 rounded bg-card-custom border border-border-custom text-[10px] font-mono">ESC</kbd> to exit
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}