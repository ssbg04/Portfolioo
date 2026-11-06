import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const isMaintenanceMode = import.meta.env.MAINTENANCE_MODE === 'true';
  const pathname = context.url.pathname;
  const hostname = context.url.hostname.toLowerCase();
  const search = context.url.search || '';

  // Static assets and internal Astro assets pass through immediately
  const isStaticOrInternal =
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/_image') ||
    pathname.startsWith('/api') ||
    /\.(png|svg|ico|webp|jpg|jpeg|gif|css|js|txt|xml|json|woff2?|ttf|eot|pdf)$/i.test(pathname);

  if (isStaticOrInternal) {
    return next();
  }

  // Canonical query parameter cleanup: redirect crawler-discovered search template placeholders directly to clean path
  if (
    search.includes('{search_term_string}') ||
    search.includes('%7Bsearch_term_string%7D') ||
    (context.url.searchParams.has('q') && context.url.searchParams.get('q') === '{search_term_string}')
  ) {
    return context.redirect(pathname || '/', 301);
  }

  // Maintenance mode handling
  if (isMaintenanceMode) {
    if (pathname === '/maintenance') {
      return next();
    }
    return context.redirect('/maintenance', 307);
  }

  // Subdomain handling: card.crischarles.com (or card.localhost in dev)
  const isCardSubdomain =
    hostname === 'card.crischarles.com' ||
    (hostname.startsWith('card.') && (hostname.includes('localhost') || hostname.includes('127.0.0.1')));

  const isLegacyLinksSubdomain =
    hostname === 'links.crischarles.com' ||
    (hostname.startsWith('links.') && (hostname.includes('localhost') || hostname.includes('127.0.0.1')));

  if (isLegacyLinksSubdomain) {
    return context.redirect(`https://card.crischarles.com${pathname === '/links' ? '' : pathname}`, 301);
  }

  if (isCardSubdomain) {
    // Root on card subdomain renders the /card page seamlessly via internal rewrite
    if (pathname === '/' || pathname === '/card') {
      return context.rewrite('/card');
    }
    // Any other path on card subdomain redirects to main portfolio
    return context.redirect(`https://crischarles.com${pathname}`, 302);
  }

  // Main domain: redirect legacy /links to dedicated card.crischarles.com subdomain (in production)
  if (pathname === '/links') {
    if (hostname === 'crischarles.com' || hostname === 'www.crischarles.com') {
      return context.redirect('https://card.crischarles.com', 301);
    }
    return context.rewrite('/card');
  }

  return next();
});

