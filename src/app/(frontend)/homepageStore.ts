'use server'

import pool from '@/lib/db'
import { unstable_cache } from 'next/cache'

type HomepageSolution = {
  id: number
  title: string
  slug: string
  subtitle?: string
  description?: string
  image?: string
  imageAlt?: string
  logo?: string
  logoAlt?: string
}

type HomepagePost = {
  id: number
  title: string
  slug: string
  excerpt?: string
  image?: string
  imageAlt?: string
  featuredImage?: string
  publishedAt?: string
  createdAt?: string
  categoryId?: number
}

type HomepageBrand = {
  id: number
  name: string
  slug: string
  logo?: string
  status: string
}

type HomepageData = {
  solutions: HomepageSolution[]
  posts: HomepagePost[]
  brands: HomepageBrand[]
  homepageSettings: any
}

/**
 * Optimized homepage data query - only fetches what's displayed
 */
async function fetchHomepageData(): Promise<HomepageData> {
  console.time('DB Query: Solutions')
  // Only fetch featured solutions (limit 9) - exclude large description field
  const [solutionsRows] = await pool.query(`
    SELECT id, title, slug, subtitle, image, image_alt, logo, logo_alt
    FROM solutions 
    WHERE status = 'active' AND is_featured = 1
    ORDER BY sort_order ASC
    LIMIT 9
  `)
  console.timeEnd('DB Query: Solutions')

  console.time('DB Query: Posts')
  // Only fetch recent published posts (limit 3) - exclude large description field
  const [postsRows] = await pool.query(`
    SELECT id, title, slug, image, image_alt, published_at, created_at, category_id
    FROM blog_posts 
    WHERE status = 'published'
    ORDER BY published_at DESC
    LIMIT 3
  `)
  console.timeEnd('DB Query: Posts')

  console.time('DB Query: Brands')
  // Only fetch active brands for homepage
  const [brandsRows] = await pool.query(`
    SELECT id, name, slug, logo, status
    FROM brands 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 20
  `)
  console.timeEnd('DB Query: Brands')

  console.time('DB Query: Settings')
  // Fetch homepage settings
  const [settingsRows] = await pool.query<any[]>(`
    SELECT value 
    FROM site_settings 
    WHERE \`key\` = 'PANZER_HOMEPAGE_SETTINGS'
  `)
  console.timeEnd('DB Query: Settings')

  const homepageSettings = settingsRows[0]?.value 
    ? JSON.parse(settingsRows[0].value)
    : null

  return {
    solutions: (solutionsRows as any[]).map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      subtitle: s.subtitle,
      description: '', // Don't load full description for homepage
      image: s.image,
      imageAlt: s.image_alt,
      logo: s.logo,
      logoAlt: s.logo_alt,
    })),
    posts: (postsRows as any[]).map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: '', // Don't load description for homepage
      image: p.image,
      imageAlt: p.image_alt,
      featuredImage: p.image,
      publishedAt: p.published_at instanceof Date ? p.published_at.toISOString() : p.published_at,
      createdAt: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
      categoryId: p.category_id,
    })),
    brands: (brandsRows as any[]).map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      status: b.status,
    })),
    homepageSettings
  }
}

// Don't cache - data is too large (18MB) due to base64 images
export const getHomepageData = fetchHomepageData
