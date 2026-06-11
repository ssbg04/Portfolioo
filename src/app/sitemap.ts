import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://crischarles.vercel.app';
  const lastMod = '2026-06-11T07:44:07+00:00';

  return [
    {
      url: baseUrl,
      lastModified: lastMod,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: lastMod,
      priority: 0.8,
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
  ];
}
