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
