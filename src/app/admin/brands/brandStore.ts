'use server'

import pool from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { sanitizeDeep, stripBase64 } from '@/lib/sanitize'
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

// Legacy function for backward compatibility
export const readBrands = async (): Promise<BrandPartner[]> => {
  const result = await readBrandsPaginated(1, 1000)
  return result.brands
}

// New paginated function
export const readBrandsPaginated = async (page: number = 1, limit: number = 10): Promise<{ brands: BrandPartner[], total: number }> => {
  const offset = (page - 1) * limit
  
  // Get total count
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM brands')
  const total = (countRows as any[])[0]?.total || 0
  
  // Get paginated results
  const [rows] = await pool.query(
    'SELECT * FROM brands ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )
  
  const brands = (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    website: row.website ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
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
    capabilitiesTitle: row.capabilities_title ?? '',
    capabilitiesHeading: row.capabilities_heading ?? '',
    capabilitiesPoints: row.capabilities_points ?? '',
  }))

  const brandIds = brands.map(b => b.id)
  let extraCards: any[] = []
  if (brandIds.length > 0) {
    const [extraCardsRow] = await pool.query('SELECT * FROM brand_extra_cards WHERE brand_id IN (?)', [brandIds])
    extraCards = extraCardsRow as any[]
  }

  const mappedBrands = brands.map(brand => ({
    ...brand,
    extraCards: extraCards.filter(ec => ec.brand_id === brand.id).map(ec => ({
      id: ec.id,
      heading: ec.heading || '',
      description: ec.description || ''
    }))
  }))
  
  return { brands: mappedBrands.map(sanitizeDeep), total }
}

export const findBrand = async (id: string): Promise<BrandPartner | undefined> => {
  const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  const brand: BrandPartner = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    website: row.website ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
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
    capabilitiesTitle: row.capabilities_title ?? '',
    capabilitiesHeading: row.capabilities_heading ?? '',
    capabilitiesPoints: row.capabilities_points ?? '',
    extraCards: [],
  }

  const [extraCardsRow] = await pool.query('SELECT * FROM brand_extra_cards WHERE brand_id = ?', [id])
  brand.extraCards = (extraCardsRow as any[]).map((ec) => ({
    id: ec.id,
    heading: ec.heading || '',
    description: ec.description || '',
  }))

  return brand
}

export const createBrand = async (data: BrandFormData): Promise<BrandPartner | { success: false, message: string }> => {
  const id = `b${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const finalSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const [existing] = await pool.query('SELECT id FROM brands WHERE slug = ? OR name = ?', [finalSlug, data.name || ''])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A brand with this name or slug already exists.` }
  }

  await pool.query(
    `INSERT INTO brands (
      id, name, slug, website, category, description, image, image_title, image_caption, image_description, image_alt,
      logo, logo_alt, sort_order, featured, status, meta_title,
      meta_description, meta_keywords, capabilities_title, capabilities_heading, capabilities_points, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      finalSlug,
      data.website || '',
      data.category || '',
      data.description || '',
      data.image ? stripBase64(data.image) : '',
      data.imageTitle || '',
      data.imageCaption || '',
      data.imageDescription || '',
      data.imageAlt || '',
      data.logo ? stripBase64(data.logo) : '',
      data.logoAlt || '',
      data.order || 1,
      data.featured ? 1 : 0,
      data.status || 'active',
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      data.capabilitiesTitle || '',
      data.capabilitiesHeading || '',
      data.capabilitiesPoints || '',
      createdAt,
    ],
  )

  if (data.extraCards?.length) {
    for (const ec of data.extraCards) {
      const ecId = `bec${Date.now()}${Math.floor(Math.random() * 1000)}`
      await pool.query(
        `INSERT INTO brand_extra_cards (id, brand_id, heading, description) VALUES (?, ?, ?, ?)`,
        [ecId, id, ec.heading || '', ec.description || '']
      )
    }
  }

  const created = await findBrand(id)
  if (!created) return { success: false as const, message: 'Failed to create brand' }
  
  revalidateTag('header-data')
  return created
}

export const updateBrand = async (id: string, data: Partial<BrandFormData>): Promise<BrandPartner | undefined | { success: false, message: string }> => {
  if (data.slug || data.name) {
    const [existing] = await pool.query('SELECT id FROM brands WHERE (slug = ? OR name = ?) AND id != ?', [data.slug || '', data.name || '', id])
    if ((existing as any[]).length > 0) {
      return { success: false, message: `A brand with this name or slug already exists.` }
    }
  }

  const updates: string[] = []
  const values: any[] = []

  const fields: Record<string, string> = {
    name: 'name',
    slug: 'slug',
    website: 'website',
    category: 'category',
    description: 'description',
    image: 'image',
    imageTitle: 'image_title',
    imageCaption: 'image_caption',
    imageDescription: 'image_description',
    imageAlt: 'image_alt',
    logo: 'logo',
    logoAlt: 'logo_alt',
    order: 'sort_order',
    featured: 'featured',
    status: 'status',
    metaTitle: 'meta_title',
    metaDescription: 'meta_description',
    metaKeywords: 'meta_keywords',
    capabilitiesTitle: 'capabilities_title',
    capabilitiesHeading: 'capabilities_heading',
    capabilitiesPoints: 'capabilities_points',
  }

  for (const [key, dbField] of Object.entries(fields)) {
    if (key in data) {
      updates.push(`${dbField} = ?`)
      let val = (data as any)[key]
      if (key === 'featured') val = val ? 1 : 0
      if ((key === 'image' || key === 'logo') && typeof val === 'string') val = stripBase64(val)
      values.push(val)
    }
  }

  if (updates.length > 0) {
    values.push(id)
    await pool.query(`UPDATE brands SET ${updates.join(', ')} WHERE id = ?`, values)
  }

  // Update extra cards
  if ('extraCards' in data) {
    await pool.query('DELETE FROM brand_extra_cards WHERE brand_id = ?', [id])
    if (data.extraCards?.length) {
      for (const ec of data.extraCards) {
        const ecId = `bec${Date.now()}${Math.floor(Math.random() * 1000)}`
        await pool.query(
          `INSERT INTO brand_extra_cards (id, brand_id, heading, description) VALUES (?, ?, ?, ?)`,
          [ecId, id, ec.heading || '', ec.description || '']
        )
      }
    }
  }

  const updated = await findBrand(id)
  revalidateTag('header-data')
  return updated
}

export const deleteBrand = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM brands WHERE id = ?', [id])
  revalidateTag('header-data')
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

export const createCategory = async (data: BrandCategoryFormData): Promise<BrandCategory | { success: false, message: string }> => {
  const id = `bc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const [existing] = await pool.query('SELECT id FROM brand_categories WHERE slug = ? OR name = ?', [slug, data.name])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

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

export const updateCategory = async (id: string, data: Partial<BrandCategoryFormData>): Promise<BrandCategory | undefined | { success: false, message: string }> => {
  if (data.slug || data.name) {
    const [existing] = await pool.query('SELECT id FROM brand_categories WHERE (slug = ? OR name = ?) AND id != ?', [data.slug || '', data.name || '', id])
    if ((existing as any[]).length > 0) {
      return { success: false, message: `A category with this name or slug already exists.` }
    }
  }

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

export const deleteCategory = async (id: string): Promise<void | { success: false, message: string }> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    // get previous name
    const [rows] = await connection.query('SELECT name FROM brand_categories WHERE id = ?', [id])
    const oldName = (rows as any[])[0]?.name

    if (oldName) {
      const [brands] = await connection.query('SELECT COUNT(*) as count FROM brands WHERE category = ?', [oldName])
      const count = (brands as any[])[0].count
      if (count > 0) {
        await connection.rollback()
        return { success: false, message: `Cannot delete. This category is used in ${count} Brand(s).` }
      }
    }

    await connection.query('DELETE FROM brand_categories WHERE id = ?', [id])

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
