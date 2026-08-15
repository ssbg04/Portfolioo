import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;

  // Allow maintenance page, Astro bundled assets, and static file extensions
  if (
    pathname === '/maintenance' ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/api') ||
    /\.(png|svg|ico|webp|jpg|jpeg|gif|css|js|txt|xml|json|woff2?|ttf|eot)$/i.test(pathname)
  ) {
    return next();
  }

  // Redirect all traffic to /maintenance
  return context.redirect('/maintenance', 307);
});
