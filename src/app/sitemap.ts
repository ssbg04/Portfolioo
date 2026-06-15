import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://crischarles.vercel.app';
  const lastMod = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: lastMod,
      priority: 1.0,
      changeFrequency: 'weekly', // Add this
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: lastMod,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: lastMod,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: lastMod,
      priority: 0.8,
      changeFrequency: 'weekly',
    },
  ];
}
