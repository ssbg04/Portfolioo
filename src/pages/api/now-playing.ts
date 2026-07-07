import type { APIRoute } from 'astro';

// Read secure Spotify credentials from server environment variables
const client_id = import.meta.env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID || '';
const client_secret = import.meta.env.SPOTIFY_CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET || '';
const refresh_token = import.meta.env.SPOTIFY_REFRESH_TOKEN || process.env.SPOTIFY_REFRESH_TOKEN || '';

console.log('Spotify Config Diagnostic:', {
  clientIdPresent: !!client_id,
  clientIdLength: client_id.length,
  clientSecretPresent: !!client_secret,
  clientSecretLength: client_secret.length,
  refreshTokenPresent: !!refresh_token,
  refreshTokenLength: refresh_token.length,
});

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

// Helper to retrieve a fresh Spotify access token using the refresh token
async function getAccessToken() {
  if (!client_id || !client_secret || !refresh_token) {
    throw new Error('Spotify API keys are missing in env.');
  }

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
    throw new Error(`Spotify token error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Server-side GET API handler
export const GET: APIRoute = async () => {
  let token = null;
  let tokenError = null;

  try {
    token = await getAccessToken();
  } catch (error: any) {
    tokenError = error.message || String(error);
  }

  if (!token) {
    return new Response(
      JSON.stringify({
        isPlaying: false,
        message: 'Spotify integration not configured or credentials missing.',
        debug: {
          clientIdPresent: !!client_id,
          clientIdLength: client_id.length,
          clientSecretPresent: !!client_secret,
          clientSecretLength: client_secret.length,
          refreshTokenPresent: !!refresh_token,
          refreshTokenLength: refresh_token.length,
          tokenError
        }
      }),
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
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 204 means nothing is currently playing
    if (response.status === 204 || response.status > 400) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10',
        },
      });
    }

    const song = await response.json();

    // Check if item is valid and it is a music track
    if (!song.item || song.currently_playing_type !== 'track') {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist: any) => _artist.name).join(', ');
    const album = song.item.album.name;
    const albumArt = song.item.album.images[0]?.url || '';
    const spotifyUrl = song.item.external_urls.spotify;
    const progressMs = song.progress_ms;
    const durationMs = song.item.duration_ms;
    const progressPercent = (progressMs / durationMs) * 100;

    return new Response(
      JSON.stringify({
        isPlaying,
        title,
        artist,
        album,
        albumArt,
        spotifyUrl,
        progressPercent,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Instruct Vercel CDN to cache the response for 3 seconds to reduce Spotify API rate limiting
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=2',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Spotify now playing info:', error);
    return new Response(JSON.stringify({ isPlaying: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
