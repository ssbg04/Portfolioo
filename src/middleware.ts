import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const isMaintenanceMode = import.meta.env.MAINTENANCE_MODE === 'true';

  // If maintenance mode is off, let all requests through
  if (!isMaintenanceMode) {
    return next();
  }

  const pathname = context.url.pathname;

  // Always allow the maintenance page itself, static assets, and API routes
  if (
    pathname === '/maintenance' ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/api') ||
    /\.(png|svg|ico|webp|jpg|jpeg|gif|css|js|txt|xml|json|woff2?|ttf|eot|pdf)$/i.test(pathname)
  ) {
    return next();
  }

  // Redirect all other traffic to /maintenance
  return context.redirect('/maintenance', 307);
});
