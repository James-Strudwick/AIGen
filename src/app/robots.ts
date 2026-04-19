import { MetadataRoute } from 'next';

/**
 * robots.txt — tells crawlers what to index and where the sitemap lives.
 *
 * We hide:
 *  - API routes (noise, never useful to rank)
 *  - Authenticated surfaces (dashboard, settings, onboarding, admin)
 *  - Embed + preview routes (internal utility pages, not content)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/settings',
          '/onboarding',
          '/admin',
          '/embed/',
          '/preview/',
          '/auth/',
          '/reset-password',
          '/share-card',
        ],
      },
    ],
    sitemap: 'https://fomoforms.com/sitemap.xml',
    host: 'https://fomoforms.com',
  };
}
