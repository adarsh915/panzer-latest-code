'use server'

import pool from '@/lib/db'
import { unstable_cache } from 'next/cache'

type HeaderSolution = {
  label: string
  logo?: string
  logoAlt: string
  icon: string
  href: string
}

type HeaderBrand = {
  label: string
  logo?: string
  href: string
}

export type HeaderData = {
  solutions: HeaderSolution[]
  brands: HeaderBrand[]
  logoData: { logoUrl: string; logoAlt: string; logoWidth: number }
}

/**
 * Optimized header data query - only fetches minimal fields needed for navigation
 */
async function fetchHeaderData(): Promise<HeaderData> {
  console.time('Header Query: Solutions')
  // Single optimized query for header navigation
  const [solutionsRows] = await pool.query(`
    SELECT id, title, slug, logo, logo_alt
    FROM solutions 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 20
  `)
  console.timeEnd('Header Query: Solutions')

  console.time('Header Query: Brands')
  const [brandsRows] = await pool.query(`
    SELECT id, name, slug, logo
    FROM brands 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 30
  `)
  console.timeEnd('Header Query: Brands')

  console.time('Header Query: Settings')
  const [settingsRows] = await pool.query<any[]>(`
    SELECT value 
    FROM site_settings 
    WHERE \`key\` = 'PANZER_HEADER_SETTINGS'
  `)
  console.timeEnd('Header Query: Settings')

  const logoData = settingsRows[0]?.value 
    ? JSON.parse(settingsRows[0].value)
    : { logoUrl: '', logoAlt: 'Header Logo', logoWidth: 140 }

  return {
    solutions: (solutionsRows as any[]).map(s => ({
      label: s.title,
      logo: s.logo || undefined,
      logoAlt: s.logo_alt || s.title,
      icon: "fa-shield-check",
      href: `/solution/${s.slug}`
    })),
    brands: (brandsRows as any[]).map(b => ({
      label: b.name,
      logo: b.logo || undefined,
      href: `/brand/${b.slug}`
    })),
    logoData
  }
}

export const getHeaderData = fetchHeaderData
