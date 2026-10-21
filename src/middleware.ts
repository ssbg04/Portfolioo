import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const isMaintenanceMode = import.meta.env.MAINTENANCE_MODE === 'true';
  const pathname = context.url.pathname;
  const hostname = context.url.hostname.toLowerCase();

  // Static assets and internal Astro assets pass through immediately
  const isStaticOrInternal =
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/_image') ||
    pathname.startsWith('/api') ||
    /\.(png|svg|ico|webp|jpg|jpeg|gif|css|js|txt|xml|json|woff2?|ttf|eot|pdf)$/i.test(pathname);

  if (isStaticOrInternal) {
    return next();
  }

  // Maintenance mode handling
  if (isMaintenanceMode) {
    if (pathname === '/maintenance') {
      return next();
    }
    return context.redirect('/maintenance', 307);
  }

  // Subdomain handling: links.crischarles.com (or links.localhost in dev)
  const isLinksSubdomain =
    hostname === 'links.crischarles.com' ||
    (hostname.startsWith('links.') && (hostname.includes('localhost') || hostname.includes('127.0.0.1')));

  if (isLinksSubdomain) {
    // Root on subdomain renders the /links page seamlessly
    if (pathname === '/') {
      return context.rewrite('/links');
    }
    // Redundant /links path redirects to /
    if (pathname === '/links' || pathname === '/links/') {
      return context.redirect('/', 301);
    }
    // Any other path on links subdomain redirects to main portfolio
    return context.redirect(`https://crischarles.com${pathname}`, 302);
  }

  // Main domain: redirect /links to dedicated links.crischarles.com subdomain (in production)
  if (pathname === '/links' || pathname === '/links/') {
    if (hostname === 'crischarles.com' || hostname === 'www.crischarles.com') {
      return context.redirect('https://links.crischarles.com', 301);
    }
  }

  return next();
});

