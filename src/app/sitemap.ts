import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://crischarles.vercel.app';
  // Updated to match the latest timestamp from your XML generator
  const lastMod = '2026-06-15T10:13:28+00:00';

  return [
    {
      url: baseUrl,
      lastModified: lastMod,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: lastMod,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: lastMod,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: lastMod,
      priority: 0.8,
    },
  ];
}
