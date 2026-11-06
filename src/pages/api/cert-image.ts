import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing image url parameter', { status: 400 });
  }

  try {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new Response('Invalid url', { status: 400 });
    }

    // Only allow authorized image CDNs (Sanity CDN, Credly, or site images)
    const allowedHosts = ['cdn.sanity.io', 'images.credly.com'];
    const isAllowed = allowedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`));

    if (!isAllowed) {
      return new Response('Forbidden host', { status: 403 });
    }

    // Fetch image server-side
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Portfolio-Cert-Proxy/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!upstreamRes.ok) {
      return new Response('Upstream error fetching image', { status: upstreamRes.status });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    const body = await upstreamRes.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
        // Hard crawler block headers
        'X-Robots-Tag': 'noindex, noimageindex, nofollow, nosnippet',
      },
    });
  } catch (err: any) {
    return new Response(`Error proxying image: ${err.message}`, { status: 500 });
  }
};
