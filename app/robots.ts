import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/user/', '/admin/'],
    },
    sitemap: 'https://app.survify.info/sitemap.xml',
  };
}
