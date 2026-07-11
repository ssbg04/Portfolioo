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
      headers: { Authorization: `Bearer ${token}` }
    });

    if (nowPlayingRes.status === 200) {
      const text = await nowPlayingRes.text();
      if (text) {
        const song = JSON.parse(text);
        if (song && song.item && song.currently_playing_type === 'track') {
          if (song.is_playing) {
            return new Response(
              JSON.stringify({
                currentPlaying: {
                  isPlaying: true,
                  title: song.item.name,
                  artist: song.item.artists?.map((_artist: any) => _artist.name).join(', ') || 'Unknown Artist',
                  album: song.item.album?.name || '',
                  albumArt: song.item.album?.images?.[0]?.url || '',
                  spotifyUrl: song.item.external_urls?.spotify || '',
                  progressPercent: song.item.duration_ms ? (song.progress_ms / song.item.duration_ms) * 100 : 0
                },
                recentlyPlayed: null
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=2',
                }
              }
            );
          } else {
            // Track is paused, we can return it as recently played without needing extra API call
            return new Response(
              JSON.stringify({
                currentPlaying: null,
                recentlyPlayed: {
                  title: song.item.name,
                  artist: song.item.artists?.map((_artist: any) => _artist.name).join(', ') || 'Unknown Artist',
                  album: song.item.album?.name || '',
                  albumArt: song.item.album?.images?.[0]?.url || '',
                  spotifyUrl: song.item.external_urls?.spotify || '',
                  playedAt: new Date().toISOString(),
                  isPlaying: false
                }
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
                }
              }
            );
          }
        }
      }
    }

    // If we reach here, the song is STOPPED (e.g. Spotify closed), or the API returned an empty body (204)
    // We now fetch the Recently Played song
    const recentlyPlayedRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` }
    });

    let recentlyPlayed = null;

    if (recentlyPlayedRes.status === 200) {
      const recentText = await recentlyPlayedRes.text();
      if (recentText) {
        const recentData = JSON.parse(recentText);
        if (recentData && recentData.items && recentData.items.length > 0) {
          const track = recentData.items[0].track;
          if (track) {
            recentlyPlayed = {
              title: track.name,
              artist: track.artists?.map((_artist: any) => _artist.name).join(', ') || 'Unknown Artist',
              album: track.album?.name || '',
              albumArt: track.album?.images?.[0]?.url || '',
              spotifyUrl: track.external_urls?.spotify || '',
              playedAt: recentData.items[0].played_at,
              isPlaying: false
            };
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        currentPlaying: null,
        recentlyPlayed
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
