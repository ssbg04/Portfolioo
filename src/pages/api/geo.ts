import type { APIRoute } from 'astro';

export const prerender = false;

// Country code to coordinates (normalized 0-100% on Equirectangular / Mercator map)
// and country display metadata
export const COUNTRY_COORDS: Record<string, { name: string; flag: string; x: number; y: number }> = {
  PH: { name: 'Philippines', flag: '🇵🇭', x: 83.8, y: 42.9 },
  US: { name: 'United States', flag: '🇺🇸', x: 22.6, y: 27.9 },
  CA: { name: 'Canada', flag: '🇨🇦', x: 20.5, y: 18.8 },
  GB: { name: 'United Kingdom', flag: '🇬🇧', x: 49.4, y: 20.3 },
  DE: { name: 'Germany', flag: '🇩🇪', x: 52.9, y: 21.6 },
  FR: { name: 'France', flag: '🇫🇷', x: 50.6, y: 24.3 },
  NL: { name: 'Netherlands', flag: '🇳🇱', x: 51.5, y: 21.0 },
  SG: { name: 'Singapore', flag: '🇸🇬', x: 78.8, y: 49.3 },
  JP: { name: 'Japan', flag: '🇯🇵', x: 88.4, y: 29.9 },
  KR: { name: 'South Korea', flag: '🇰🇷', x: 85.5, y: 30.1 },
  AU: { name: 'Australia', flag: '🇦🇺', x: 87.2, y: 64.0 },
  NZ: { name: 'New Zealand', flag: '🇳🇿', x: 98.6, y: 72.7 },
  IN: { name: 'India', flag: '🇮🇳', x: 71.9, y: 38.6 },
  BR: { name: 'Brazil', flag: '🇧🇷', x: 35.6, y: 57.9 },
  AE: { name: 'United Arab Emirates', flag: '🇦🇪', x: 65.0, y: 37.0 },
  VN: { name: 'Vietnam', flag: '🇻🇳', x: 80.1, y: 42.2 },
  ID: { name: 'Indonesia', flag: '🇮🇩', x: 81.6, y: 50.4 },
  MY: { name: 'Malaysia', flag: '🇲🇾', x: 78.3, y: 47.7 },
  ES: { name: 'Spain', flag: '🇪🇸', x: 49.0, y: 27.5 },
  IT: { name: 'Italy', flag: '🇮🇹', x: 53.5, y: 26.7 },
  SE: { name: 'Sweden', flag: '🇸🇪', x: 55.2, y: 16.6 },
  CH: { name: 'Switzerland', flag: '🇨🇭', x: 52.3, y: 24.0 },
  IE: { name: 'Ireland', flag: '🇮🇪', x: 47.7, y: 20.3 },
  HK: { name: 'Hong Kong', flag: '🇭🇰', x: 81.7, y: 37.6 },
  TW: { name: 'Taiwan', flag: '🇹🇼', x: 83.6, y: 36.8 },
  CN: { name: 'China', flag: '🇨🇳', x: 78.9, y: 30.1 },
  MX: { name: 'Mexico', flag: '🇲🇽', x: 21.5, y: 36.9 },
  PL: { name: 'Poland', flag: '🇵🇱', x: 55.3, y: 21.2 },
  NO: { name: 'Norway', flag: '🇳🇴', x: 52.4, y: 16.4 },
  FI: { name: 'Finland', flag: '🇫🇮', x: 57.2, y: 15.6 },
  TH: { name: 'Thailand', flag: '🇹🇭', x: 78.1, y: 41.2 },
  ZA: { name: 'South Africa', flag: '🇿🇦', x: 56.4, y: 67.0 },
  AR: { name: 'Argentina', flag: '🇦🇷', x: 32.3, y: 71.3 },
  CL: { name: 'Chile', flag: '🇨🇱', x: 30.1, y: 69.8 },
  EG: { name: 'Egypt', flag: '🇪🇬', x: 58.6, y: 35.1 },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦', x: 62.5, y: 36.7 },
  TR: { name: 'Turkey', flag: '🇹🇷', x: 59.8, y: 28.4 },
  IL: { name: 'Israel', flag: '🇮🇱', x: 59.7, y: 32.8 },
  UA: { name: 'Ukraine', flag: '🇺🇦', x: 58.7, y: 23.1 },
  RO: { name: 'Romania', flag: '🇷🇴', x: 56.9, y: 24.5 },
  BE: { name: 'Belgium', flag: '🇧🇪', x: 51.2, y: 21.9 },
  AT: { name: 'Austria', flag: '🇦🇹', x: 54.0, y: 23.6 },
  CZ: { name: 'Czechia', flag: '🇨🇿', x: 54.3, y: 22.3 },
  PT: { name: 'Portugal', flag: '🇵🇹', x: 47.7, y: 28.1 },
  GR: { name: 'Greece', flag: '🇬🇷', x: 56.1, y: 28.3 },
  DK: { name: 'Denmark', flag: '🇩🇰', x: 52.6, y: 18.7 },
  PK: { name: 'Pakistan', flag: '🇵🇰', x: 69.3, y: 33.1 },
  BD: { name: 'Bangladesh', flag: '🇧🇩', x: 75.1, y: 36.8 },
  RU: { name: 'Russia', flag: '🇷🇺', x: 79.3, y: 15.8 },
};

// In-memory country visitor counters across edge runtime instances
// Starts completely clean with 0 mock data - all counts are 100% real edge sessions
const visitorCounts: Record<string, number> = {};

// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

// Rate limiter / dedup per IP to avoid spamming the counter (3 min cooldown per IP)
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

    // 2. Resolve persistent Cloudflare KV using modern cloudflare:workers env
    let kv: any = null;
    try {
      if (typeof cfEnv !== 'undefined' && cfEnv) {
        kv = (cfEnv as any).GEO_KV || (cfEnv as any).GEO_ANALYTICS || (cfEnv as any).SESSION;
      }
      if (!kv && (locals as any)?.env) {
        kv = (locals as any).env.GEO_KV || (locals as any).env.GEO_ANALYTICS || (locals as any).env.SESSION;
      }
    } catch {
      // ignore - fall back to edge memory
    }

    let activeCounts: Record<string, number> = { ...visitorCounts };

    let kvStoredFound = false;
    if (kv) {
      try {
        const stored = await kv.get('geo_visitor_counts');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Purge legacy mock data (PH 148, US 96) so the world map only reflects genuine real-time traffic
          if (parsed && (parsed.PH === 148 || parsed.US === 96)) {
            activeCounts = {};
            await kv.put('geo_visitor_counts', JSON.stringify({}));
          } else {
            activeCounts = parsed;
            kvStoredFound = true;
          }
        }
      } catch (kvErr) {
        console.error('KV read error:', kvErr);
      }
    }

    // 3. Increment visitor count for the detected country (deduped per IP for 3 minutes)
    const now = Date.now();
    const lastSeen = recentIps.get(cfIp) || 0;
    const shouldIncrement = !kvStoredFound || (now - lastSeen > 3 * 60 * 1000);

    if (shouldIncrement) {
      recentIps.set(cfIp, now);
      // Clean old IPs if map grows large
      if (recentIps.size > 2000) {
        for (const [ip, time] of recentIps.entries()) {
          if (now - time > 60 * 60 * 1000) recentIps.delete(ip);
        }
      }
      activeCounts[cfCountry] = (activeCounts[cfCountry] || 0) + 1;
      visitorCounts[cfCountry] = activeCounts[cfCountry];

      if (kv) {
        try {
          await kv.put('geo_visitor_counts', JSON.stringify(activeCounts));
        } catch (kvWriteErr) {
          console.error('KV write error:', kvWriteErr);
        }
      }
    } else {
      // Ensure the active visitor's country has at least 1 count registered
      if (!activeCounts[cfCountry]) {
        activeCounts[cfCountry] = 1;
        visitorCounts[cfCountry] = 1;
        if (kv) {
          try {
            await kv.put('geo_visitor_counts', JSON.stringify(activeCounts));
          } catch {}
        }
      }
    }

    // 4. Format countries array for the world map
    const totalVisitors = Object.values(activeCounts).reduce((acc, curr) => acc + curr, 0);

    const countries = Object.entries(COUNTRY_COORDS).map(([code, meta]) => {
      const count = activeCounts[code] || 0;
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

    // Filter to countries with real recorded traffic
    const activeVisitedCountries = countries.filter((c) => c.count > 0);
    const topCountries = activeVisitedCountries.length > 0
      ? activeVisitedCountries.slice(0, 8)
      : countries.filter((c) => c.isClient);

    return new Response(
      JSON.stringify({
        client: clientInfo,
        stats: {
          totalVisitors: totalVisitors > 0 ? totalVisitors : 1,
          totalCountries: activeVisitedCountries.length > 0 ? activeVisitedCountries.length : 1,
          topCountries,
          allCountries: countries,
          storage: kv ? 'cloudflare_kv' : 'edge_memory',
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
