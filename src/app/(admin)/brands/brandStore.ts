'use server'

import pool from '@/lib/db'
import type {
  BrandCategory,
  BrandCategoryFormData,
  BrandFormData,
  BrandPartner,
  BrandStatus,
} from './brandTypes'

export type {
  BrandCategory,
  BrandCategoryFormData,
  BrandFormData,
  BrandPartner,
  BrandStatus,
}

// ─── Brands ──────────────────────────────────────────────────────────────────

export const readBrands = async (): Promise<BrandPartner[]> => {
  const [rows] = await pool.query('SELECT * FROM brands ORDER BY sort_order ASC, created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    website: row.website ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageAlt: row.image_alt ?? '',
    logo: row.logo ?? '',
    logoAlt: row.logo_alt ?? '',
    order: row.sort_order ?? 1,
    featured: Boolean(row.featured),
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
  }))
}

export const findBrand = async (id: string): Promise<BrandPartner | undefined> => {
  const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    website: row.website ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageAlt: row.image_alt ?? '',
    logo: row.logo ?? '',
    logoAlt: row.logo_alt ?? '',
    order: row.sort_order ?? 1,
    featured: Boolean(row.featured),
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
  }
}

export const createBrand = async (data: BrandFormData): Promise<BrandPartner> => {
  const id = `b${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

  await pool.query(
    `INSERT INTO brands (
      id, name, slug, website, category, description, image, image_alt,
      logo, logo_alt, sort_order, featured, status, meta_title,
      meta_description, meta_keywords, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      data.website || '',
      data.category || '',
      data.description || '',
      data.image || '',
      data.imageAlt || '',
      data.logo || '',
      data.logoAlt || '',
      data.order || 1,
      data.featured ? 1 : 0,
      data.status || 'active',
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      createdAt,
    ],
  )

  const created = await findBrand(id)
  if (!created) throw new Error('Failed to create brand')
  return created
}

export const updateBrand = async (id: string, data: Partial<BrandFormData>): Promise<BrandPartner | undefined> => {
  const updates: string[] = []
  const values: any[] = []

  const fields: Record<string, string> = {
    name: 'name',
    slug: 'slug',
    website: 'website',
    category: 'category',
    description: 'description',
    image: 'image',
    imageAlt: 'image_alt',
    logo: 'logo',
    logoAlt: 'logo_alt',
    order: 'sort_order',
    featured: 'featured',
    status: 'status',
    metaTitle: 'meta_title',
    metaDescription: 'meta_description',
    metaKeywords: 'meta_keywords',
  }

  for (const [key, dbField] of Object.entries(fields)) {
    if (key in data) {
      updates.push(`${dbField} = ?`)
      let val = (data as any)[key]
      if (key === 'featured') val = val ? 1 : 0
      values.push(val)
    }
  }

  if (updates.length > 0) {
    values.push(id)
    await pool.query(`UPDATE brands SET ${updates.join(', ')} WHERE id = ?`, values)
  }

  return findBrand(id)
}

export const deleteBrand = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM brands WHERE id = ?', [id])
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const readCategories = async (): Promise<BrandCategory[]> => {
  const [rows] = await pool.query('SELECT * FROM brand_categories ORDER BY created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const createCategory = async (data: BrandCategoryFormData): Promise<BrandCategory> => {
  const id = `bc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  await pool.query(
    'INSERT INTO brand_categories (id, name, slug, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name, slug, data.status || 'active', createdAt],
  )

  const [rows] = await pool.query('SELECT * FROM brand_categories WHERE id = ?', [id])
  const row = (rows as any[])[0]
  
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export const updateCategory = async (id: string, data: Partial<BrandCategoryFormData>): Promise<BrandCategory | undefined> => {
  const updates: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.slug !== undefined) {
    updates.push('slug = ?')
    values.push(data.slug)
  }
  if (data.status !== undefined) {
    updates.push('status = ?')
    values.push(data.status)
  }

  if (updates.length > 0) {
    values.push(id)
    await pool.query(`UPDATE brand_categories SET ${updates.join(', ')} WHERE id = ?`, values)
  }

  const [rows] = await pool.query('SELECT * FROM brand_categories WHERE id = ?', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export const deleteCategory = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM brand_categories WHERE id = ?', [id])
}
