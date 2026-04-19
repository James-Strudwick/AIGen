import { MetadataRoute } from 'next';
import { getServiceClient } from '@/lib/supabase';

const BASE_URL = 'https://fomoforms.com';

/**
 * Sitemap for Google / Bing / other crawlers.
 *
 * Two layers:
 *  1. Static marketing + legal pages.
 *  2. A page per active trainer so coach landing pages get indexed
 *     individually — good for long-tail location / niche searches like
 *     "weight loss coach Manchester".
 *
 * Gated routes (dashboard, settings, onboarding, admin, api, embed) are
 * deliberately excluded — they're either authenticated or have noindex
 * set in generateMetadata.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
  ];

  try {
    const supabase = getServiceClient();
    const { data: trainers } = await supabase
      .from('trainers')
      .select('slug, created_at')
      .eq('active', true)
      .not('user_id', 'is', null);

    const trainerRoutes: MetadataRoute.Sitemap = (trainers ?? []).map((t) => ({
      url: `${BASE_URL}/${t.slug}`,
      lastModified: t.created_at ? new Date(t.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...trainerRoutes];
  } catch (err) {
    // If Supabase is unreachable at build-time (e.g. during CI without
    // env vars), still return the static sitemap rather than 500ing.
    console.error('[sitemap] failed to fetch trainers:', err);
    return staticRoutes;
  }
}
