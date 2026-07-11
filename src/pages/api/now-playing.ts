import type { APIRoute } from 'astro';

// Read secure Spotify credentials from server environment variables
const client_id = import.meta.env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID || '';
const client_secret = import.meta.env.SPOTIFY_CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET || '';
const refresh_token = import.meta.env.SPOTIFY_REFRESH_TOKEN || process.env.SPOTIFY_REFRESH_TOKEN || '';

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

// Helper to retrieve a fresh Spotify access token using the refresh token
async function getAccessToken() {
  if (!client_id || !client_secret || !refresh_token) {
    console.error('Spotify API keys are missing in env.');
    return null;
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to fetch Spotify access token:', response.status, errText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching Spotify access token:', error);
    return null;
  }
}

// Helper to fetch the most recently played track (limit=1) from Spotify.
// Returns { track, debugError } so the caller can surface *why* it failed
// (missing scope, expired token, etc.) instead of silently returning null.
async function getRecentlyPlayed(token: string) {
  try {
    const recentlyPlayedRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (recentlyPlayedRes.status !== 200) {
      const errBody = await recentlyPlayedRes.text();
      console.error('Recently-played request failed:', recentlyPlayedRes.status, errBody);
      return {
        track: null,
        debugError: `recently-played returned ${recentlyPlayedRes.status}: ${errBody.slice(0, 300)}`,
      };
    }

    const recentText = await recentlyPlayedRes.text();
    if (!recentText) {
      return { track: null, debugError: 'recently-played returned an empty body' };
    }

    const recentData = JSON.parse(recentText);
    const track = recentData?.items?.[0]?.track;
    if (!track) {
      return { track: null, debugError: 'recently-played returned no items (listening history may be empty)' };
    }

    return {
      track: {
        title: track.name,
        artist: track.artists?.map((_artist: any) => _artist.name).join(', ') || 'Unknown Artist',
        album: track.album?.name || '',
        albumArt: track.album?.images?.[0]?.url || '',
        spotifyUrl: track.external_urls?.spotify || '',
        playedAt: recentData.items[0].played_at,
        isPlaying: false,
      },
      debugError: null,
    };
  } catch (error: any) {
    console.error('Error fetching Spotify recently played:', error);
    return { track: null, debugError: `exception: ${error?.message || String(error)}` };
  }
}

// Server-side GET API handler
export const GET: APIRoute = async () => {
  const token = await getAccessToken();

  if (!token) {
    return new Response(
      JSON.stringify({ currentPlaying: null, recentlyPlayed: null, message: 'Spotify integration not configured or credentials missing.' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
        },
      }
    );
  }

  try {
    const nowPlayingRes = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Only treat it as "currently playing" when Spotify confirms an active track.
    // Any other case (paused, stopped, no content, error, etc.) falls through
    // to the recently-played (limit=1) lookup below.
    if (nowPlayingRes.status === 200) {
      const text = await nowPlayingRes.text();
      if (text) {
        const song = JSON.parse(text);
        if (song?.item && song.currently_playing_type === 'track' && song.is_playing) {
          return new Response(
            JSON.stringify({
              currentPlaying: {
                isPlaying: true,
                title: song.item.name,
                artist: song.item.artists?.map((_artist: any) => _artist.name).join(', ') || 'Unknown Artist',
                album: song.item.album?.name || '',
                albumArt: song.item.album?.images?.[0]?.url || '',
                spotifyUrl: song.item.external_urls?.spotify || '',
                progressPercent: song.item.duration_ms ? (song.progress_ms / song.item.duration_ms) * 100 : 0,
              },
              recentlyPlayed: null,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=2',
              },
            }
          );
        }
      }
    }

    // Not actively playing (paused, stopped, empty body, or non-200) —
    // always resolve to the real recently-played (limit=1) endpoint.
    const { track: recentlyPlayed, debugError } = await getRecentlyPlayed(token);

    return new Response(
      JSON.stringify({
        currentPlaying: null,
        recentlyPlayed,
        // Remove this field once recently-played is confirmed working.
        ...(debugError ? { debugError } : {}),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Spotify info:', error);
    return new Response(JSON.stringify({ currentPlaying: null, recentlyPlayed: null, error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
