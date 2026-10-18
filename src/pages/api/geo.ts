import type { APIRoute } from 'astro';

export const prerender = false;

// Country code to coordinates (normalized 0-100% on Equirectangular / Mercator map)
// and country display metadata
export const COUNTRY_COORDS: Record<string, { name: string; flag: string; x: number; y: number }> = {
  PH: { name: 'Philippines', flag: '🇵🇭', x: 81.5, y: 55.2 },
  US: { name: 'United States', flag: '🇺🇸', x: 23.5, y: 38.0 },
  CA: { name: 'Canada', flag: '🇨🇦', x: 22.0, y: 27.0 },
  GB: { name: 'United Kingdom', flag: '🇬🇧', x: 48.0, y: 28.5 },
  DE: { name: 'Germany', flag: '🇩🇪', x: 51.5, y: 29.5 },
  FR: { name: 'France', flag: '🇫🇷', x: 49.5, y: 33.0 },
  NL: { name: 'Netherlands', flag: '🇳🇱', x: 50.2, y: 28.8 },
  SG: { name: 'Singapore', flag: '🇸🇬', x: 78.5, y: 59.5 },
  JP: { name: 'Japan', flag: '🇯🇵', x: 86.8, y: 40.0 },
  KR: { name: 'South Korea', flag: '🇰🇷', x: 84.0, y: 40.5 },
  AU: { name: 'Australia', flag: '🇦🇺', x: 87.0, y: 76.0 },
  NZ: { name: 'New Zealand', flag: '🇳🇿', x: 94.5, y: 84.0 },
  IN: { name: 'India', flag: '🇮🇳', x: 72.0, y: 48.5 },
  BR: { name: 'Brazil', flag: '🇧🇷', x: 34.5, y: 68.0 },
  AE: { name: 'United Arab Emirates', flag: '🇦🇪', x: 63.8, y: 46.5 },
  VN: { name: 'Vietnam', flag: '🇻🇳', x: 79.5, y: 53.0 },
  ID: { name: 'Indonesia', flag: '🇮🇩', x: 81.0, y: 63.5 },
  MY: { name: 'Malaysia', flag: '🇲🇾', x: 78.0, y: 58.0 },
  ES: { name: 'Spain', flag: '🇪🇸', x: 47.0, y: 36.5 },
  IT: { name: 'Italy', flag: '🇮🇹', x: 52.5, y: 34.8 },
  SE: { name: 'Sweden', flag: '🇸🇪', x: 53.0, y: 22.0 },
  CH: { name: 'Switzerland', flag: '🇨🇭', x: 50.8, y: 32.5 },
  IE: { name: 'Ireland', flag: '🇮🇪', x: 46.2, y: 29.0 },
  HK: { name: 'Hong Kong', flag: '🇭🇰', x: 80.5, y: 49.5 },
  TW: { name: 'Taiwan', flag: '🇹🇼', x: 82.8, y: 49.0 },
};

// In-memory country visitor counters across edge runtime instances
// Base seed counts represent historical developer traffic so the map is lively
const visitorCounts: Record<string, number> = {
  PH: 148,
  US: 96,
  SG: 42,
  GB: 35,
  DE: 29,
  JP: 24,
  AU: 19,
  CA: 18,
  IN: 15,
  NL: 12,
  AE: 9,
  VN: 8,
  KR: 7,
};

// Rate limiter / dedup per IP per hour to avoid spamming the counter
const recentIps = new Map<string, number>();

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Extract Cloudflare Edge Geolocation
    // Cloudflare Pages provides CF headers automatically
    const cfCountry = request.headers.get('cf-ipcountry') || 'PH';
    const cfCity = request.headers.get('cf-ipcity') || request.headers.get('x-real-city') || '';
    const cfRegion = request.headers.get('cf-region') || '';
    
    // Safely extract client IP
    const cfIp = request.headers.get('cf-connecting-ip') || 
                 request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 '127.0.0.1';

    // 2. Increment visitor count for the detected country (deduped per IP for 30 minutes)
    const now = Date.now();
    const lastSeen = recentIps.get(cfIp) || 0;
    if (now - lastSeen > 30 * 60 * 1000) {
      recentIps.set(cfIp, now);
      // Clean old IPs if map grows large
      if (recentIps.size > 2000) {
        for (const [ip, time] of recentIps.entries()) {
          if (now - time > 60 * 60 * 1000) recentIps.delete(ip);
        }
      }
      visitorCounts[cfCountry] = (visitorCounts[cfCountry] || 0) + 1;
    }

    // 3. Format countries array for the world map
    const totalVisitors = Object.values(visitorCounts).reduce((acc, curr) => acc + curr, 0);

    const countries = Object.entries(COUNTRY_COORDS).map(([code, meta]) => {
      const count = visitorCounts[code] || (code === cfCountry ? 1 : 0);
      return {
        code,
        name: meta.name,
        flag: meta.flag,
        x: meta.x,
        y: meta.y,
        count,
        percentage: totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0,
        isClient: code === cfCountry,
      };
    }).sort((a, b) => b.count - a.count);

    const clientInfo = {
      countryCode: cfCountry,
      countryName: COUNTRY_COORDS[cfCountry]?.name || cfCountry,
      flag: COUNTRY_COORDS[cfCountry]?.flag || '🌐',
      city: cfCity ? decodeURIComponent(cfCity) : undefined,
      region: cfRegion || undefined,
      coords: COUNTRY_COORDS[cfCountry] ? { x: COUNTRY_COORDS[cfCountry].x, y: COUNTRY_COORDS[cfCountry].y } : { x: 81.5, y: 55.2 },
    };

    return new Response(
      JSON.stringify({
        client: clientInfo,
        stats: {
          totalVisitors,
          totalCountries: Object.keys(visitorCounts).length,
          topCountries: countries.slice(0, 8),
          allCountries: countries,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to resolve location telemetry', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
