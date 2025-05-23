import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://fillform.info/',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://app .fillform.info/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://app.fillform.info/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ];
}
