'use server'

import pool from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { toSlug } from './solutionHelpers'
import { sanitizeDeep, stripBase64 } from '@/lib/sanitize'
import type {
  SolutionCategory,
  SolutionCategoryFormData,
  SolutionExtraCard,
  SolutionFeatureCard,
  SolutionFormData,
  SolutionImplementationStep,
  SolutionService,
  SolutionStatus,
} from './solutionTypes'

// Re-export types for convenience of other modules
export type {
  SolutionCategory,
  SolutionCategoryFormData,
  SolutionExtraCard,
  SolutionFeatureCard,
  SolutionFormData,
  SolutionImplementationStep,
  SolutionService,
  SolutionStatus,
}



// Legacy function for backward compatibility
export const readSolutions = async (): Promise<SolutionService[]> => {
  const result = await readSolutionsPaginated(1, 1000)
  return result.solutions
}

// New paginated function
export const readSolutionsPaginated = async (page: number = 1, limit: number = 10): Promise<{ solutions: SolutionService[], total: number }> => {
  const offset = (page - 1) * limit
  
  // Get total count
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM solutions')
  const total = (countRows as any[])[0]?.total || 0
  
  // Get paginated solutions
  const [solutionsRow] = await pool.query(
    'SELECT * FROM solutions ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )
  const solutions = solutionsRow as any[]

  if (solutions.length === 0) return { solutions: [], total }

  const solutionIds = solutions.map(s => s.id)
  
  // Only fetch related data for the current page of solutions
  const [featureCardsRow] = await pool.query('SELECT * FROM solution_feature_cards WHERE solution_id IN (?)', [solutionIds])
  const [stepsRow] = await pool.query('SELECT * FROM solution_implementation_steps WHERE solution_id IN (?) ORDER BY step_number ASC', [solutionIds])
  const [extraCardsRow] = await pool.query('SELECT * FROM solution_extra_cards WHERE solution_id IN (?)', [solutionIds])

  const featureCards = featureCardsRow as any[]
  const steps = stepsRow as any[]
  const extraCards = extraCardsRow as any[]

  const mappedSolutions = solutions.map(sol => ({
    id: sol.id,
    title: sol.title,
    subtitle: sol.subtitle || '',
    description: sol.description || '',
    category: sol.category || '',
    image: sol.image || '',
    imageTitle: sol.image_title || '',
    imageCaption: sol.image_caption || '',
    imageDescription: sol.image_description || '',
    imageAlt: sol.image_alt || '',
    logo: sol.logo || '',
    logoAlt: sol.logo_alt || '',
    slug: sol.slug,
    order: sol.sort_order,
    status: sol.status,
    createdAt: sol.created_at instanceof Date ? sol.created_at.toISOString() : sol.created_at,
    metaTitle: sol.meta_title || '',
    metaDescription: sol.meta_description || '',
    metaKeywords: sol.meta_keywords || '',
    isFeatured: !!sol.is_featured,
    featureCards: featureCards.filter(fc => fc.solution_id === sol.id).map(fc => ({
      id: fc.id,
      icon: fc.icon || '',
      image: fc.image || '',
      imageTitle: fc.image_title || '',
      imageCaption: fc.image_caption || '',
      imageDescription: fc.image_description || '',
      imageAlt: fc.image_alt || '',
      title: fc.title,
      description: fc.description || ''
    })),
    implementationSteps: steps.filter(st => st.solution_id === sol.id).map(st => ({
      id: st.id,
      step: st.step_number || '',
      title: st.title,
      description: st.description || ''
    })),
    extraCards: extraCards.filter(ec => ec.solution_id === sol.id).map(ec => {
      let parsedPoints: string[] = [];
      try {
        parsedPoints = JSON.parse(ec.points || '[]');
      } catch(e) {}
      return {
        id: ec.id,
        heading: ec.heading || '',
        description: ec.description || '',
        image: ec.image || '',
        imageTitle: ec.image_title || '',
        imageCaption: ec.image_caption || '',
        imageDescription: ec.image_description || '',
        imageAlt: ec.image_alt || '',
        points: parsedPoints
      }
    })
  }))
  
  return { solutions: mappedSolutions.map(sanitizeDeep), total }
}

export const createSolution = async (data: SolutionFormData): Promise<SolutionService | { success: false, message: string }> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const id = `s${Date.now()}`
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const slug = toSlug(data.slug || data.title)

    const [existing] = await connection.query('SELECT id FROM solutions WHERE slug = ? OR title = ?', [slug, data.title || ''])
    if ((existing as any[]).length > 0) {
      await connection.rollback()
      return { success: false, message: `A solution with this title or slug already exists.` }
    }

    await connection.query(
      `INSERT INTO solutions (id, title, subtitle, description, category, image, image_title, image_caption, image_description, image_alt, logo, logo_alt, slug, sort_order, status, meta_title, meta_description, meta_keywords, is_featured, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title || '',
        data.subtitle || '',
        data.description || '',
        data.category || '',
        data.image ? stripBase64(data.image) : '',
        data.imageTitle || '',
        data.imageCaption || '',
        data.imageDescription || '',
        data.imageAlt || '',
        data.logo ? stripBase64(data.logo) : '',
        data.logoAlt || '',
        slug,
        data.order || 0,
        data.status || 'active',
        data.metaTitle || '',
        data.metaDescription || '',
        data.metaKeywords || '',
        data.isFeatured ? 1 : 0,
        createdAt
      ]
    )

    if (data.featureCards?.length) {
      for (const fc of data.featureCards) {
        const fcId = `fc${Date.now()}${Math.floor(Math.random() * 1000)}`
        await connection.query(
          `INSERT INTO solution_feature_cards (id, solution_id, icon, image, image_title, image_caption, image_description, image_alt, title, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [fcId, id, fc.icon || '', fc.image ? stripBase64(fc.image) : '', fc.imageTitle || '', fc.imageCaption || '', fc.imageDescription || '', fc.imageAlt || '', fc.title || '', fc.description || '']
        )
      }
    }

    if (data.implementationSteps?.length) {
      for (const st of data.implementationSteps) {
        const stId = `st${Date.now()}${Math.floor(Math.random() * 1000)}`
        await connection.query(
          `INSERT INTO solution_implementation_steps (id, solution_id, step_number, title, description) VALUES (?, ?, ?, ?, ?)`,
          [stId, id, st.step || '', st.title || '', st.description || '']
        )
      }
    }

    if (data.extraCards?.length) {
      for (const ec of data.extraCards) {
        const ecId = `ec${Date.now()}${Math.floor(Math.random() * 1000)}`
        const pointsStr = JSON.stringify(ec.points || []);
        await connection.query(
          `INSERT INTO solution_extra_cards (id, solution_id, heading, description, image, image_title, image_caption, image_description, image_alt, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ecId, id, ec.heading || '', ec.description || '', ec.image ? stripBase64(ec.image) : '', ec.imageTitle || '', ec.imageCaption || '', ec.imageDescription || '', ec.imageAlt || '', pointsStr]
        )
      }
    }

    await connection.commit()
    revalidateTag('header-data')
    
    // Fetch and return the fully constructed solution
    const [solutions] = await connection.query('SELECT * FROM solutions WHERE id = ?', [id])
    const result = (solutions as any[])[0]
    
    return {
      ...data,
      id: result.id,
      slug: result.slug,
      createdAt: result.created_at instanceof Date ? result.created_at.toISOString() : result.created_at
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const updateSolution = async (id: string, data: SolutionFormData): Promise<SolutionService | undefined | { success: false, message: string }> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const slug = toSlug(data.slug || data.title)

    const [existing] = await connection.query('SELECT id FROM solutions WHERE (slug = ? OR title = ?) AND id != ?', [slug, data.title || '', id])
    if ((existing as any[]).length > 0) {
      await connection.rollback()
      return { success: false, message: `A solution with this title or slug already exists.` }
    }

    await connection.query(
      `UPDATE solutions SET title = ?, subtitle = ?, description = ?, category = ?, image = ?, image_title = ?, image_caption = ?, image_description = ?, image_alt = ?, logo = ?, logo_alt = ?, slug = ?, sort_order = ?, status = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, is_featured = ? WHERE id = ?`,
      [
        data.title || '',
        data.subtitle || '',
        data.description || '',
        data.category || '',
        data.image ? stripBase64(data.image) : '',
        data.imageTitle || '',
        data.imageCaption || '',
        data.imageDescription || '',
        data.imageAlt || '',
        data.logo ? stripBase64(data.logo) : '',
        data.logoAlt || '',
        slug,
        data.order || 0,
        data.status || 'active',
        data.metaTitle || '',
        data.metaDescription || '',
        data.metaKeywords || '',
        data.isFeatured ? 1 : 0,
        id
      ]
    )

    // Delete existing related data and re-insert
    await connection.query('DELETE FROM solution_feature_cards WHERE solution_id = ?', [id])
    await connection.query('DELETE FROM solution_implementation_steps WHERE solution_id = ?', [id])
    await connection.query('DELETE FROM solution_extra_cards WHERE solution_id = ?', [id])

    if (data.featureCards?.length) {
      for (const fc of data.featureCards) {
        const fcId = `fc${Date.now()}${Math.floor(Math.random() * 1000)}`
        await connection.query(
          `INSERT INTO solution_feature_cards (id, solution_id, icon, image, image_title, image_caption, image_description, image_alt, title, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [fcId, id, fc.icon || '', fc.image ? stripBase64(fc.image) : '', fc.imageTitle || '', fc.imageCaption || '', fc.imageDescription || '', fc.imageAlt || '', fc.title || '', fc.description || '']
        )
      }
    }

    if (data.implementationSteps?.length) {
      for (let index = 0; index < data.implementationSteps.length; index++) {
        const st = data.implementationSteps[index];
        const stepNum = String(index + 1).padStart(2, '0');
        const stId = `st${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await connection.query(
          `INSERT INTO solution_implementation_steps (id, solution_id, step_number, title, description) VALUES (?, ?, ?, ?, ?)`,
          [stId, id, stepNum, st.title || '', st.description || '']
        );
      }
    }

    if (data.extraCards?.length) {
      for (const ec of data.extraCards) {
        const ecId = `ec${Date.now()}${Math.floor(Math.random() * 1000)}`
        await connection.query(
          `INSERT INTO solution_extra_cards (id, solution_id, heading, description, image, image_title, image_caption, image_description, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ecId, id, ec.heading || '', ec.description || '', ec.image ? stripBase64(ec.image) : '', ec.imageTitle || '', ec.imageCaption || '', ec.imageDescription || '', ec.imageAlt || '']
        )
      }
    }

    await connection.commit()
    revalidateTag('header-data')
    
    // We don't fetch full structure, just returning mocked structure for simplicity 
    // Normally we'd do readSolutions().find(x=>x.id === id)
    return { ...data, id, slug, createdAt: new Date().toISOString() }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const deleteSolution = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM solutions WHERE id = ?', [id])
  revalidateTag('header-data')
}

export const findSolution = async (id: string): Promise<SolutionService | undefined> => {
  const [solutionsRow] = await pool.query('SELECT * FROM solutions WHERE id = ? LIMIT 1', [id])
  const sol = (solutionsRow as any[])[0]
  if (!sol) return undefined

  const [featureCardsRow] = await pool.query('SELECT * FROM solution_feature_cards WHERE solution_id = ?', [id])
  const [stepsRow] = await pool.query('SELECT * FROM solution_implementation_steps WHERE solution_id = ? ORDER BY step_number ASC', [id])
  const [extraCardsRow] = await pool.query('SELECT * FROM solution_extra_cards WHERE solution_id = ?', [id])

  const featureCards = (featureCardsRow as any[]).map((fc) => ({
    id: fc.id,
    icon: fc.icon || '',
    image: fc.image || '',
    imageTitle: fc.image_title || '',
    imageCaption: fc.image_caption || '',
    imageDescription: fc.image_description || '',
    imageAlt: fc.image_alt || '',
    title: fc.title,
    description: fc.description || '',
  }))

  const implementationSteps = (stepsRow as any[]).map((st) => ({
    id: st.id,
    step: st.step_number || '',
    title: st.title,
    description: st.description || '',
  }))

  const extraCards = (extraCardsRow as any[]).map((ec) => {
    let parsedPoints: string[] = []
    try {
      parsedPoints = JSON.parse(ec.points || '[]')
    } catch {
      parsedPoints = []
    }

    return {
      id: ec.id,
      heading: ec.heading || '',
      description: ec.description || '',
      image: ec.image || '',
      imageTitle: ec.image_title || '',
      imageCaption: ec.image_caption || '',
      imageDescription: ec.image_description || '',
      imageAlt: ec.image_alt || '',
      points: parsedPoints,
    }
  })

  return {
    id: sol.id,
    title: sol.title,
    subtitle: sol.subtitle || '',
    description: sol.description || '',
    category: sol.category || '',
    image: sol.image || '',
    imageTitle: sol.image_title || '',
    imageCaption: sol.image_caption || '',
    imageDescription: sol.image_description || '',
    imageAlt: sol.image_alt || '',
    logo: sol.logo || '',
    logoAlt: sol.logo_alt || '',
    slug: sol.slug,
    order: sol.sort_order,
    status: sol.status,
    createdAt: sol.created_at instanceof Date ? sol.created_at.toISOString() : sol.created_at,
    metaTitle: sol.meta_title || '',
    metaDescription: sol.meta_description || '',
    metaKeywords: sol.meta_keywords || '',
    isFeatured: !!sol.is_featured,
    featureCards,
    implementationSteps,
    extraCards,
  }
}


export const readCategories = async (): Promise<SolutionCategory[]> => {
  const [rows] = await pool.query('SELECT * FROM solution_categories ORDER BY created_at DESC')
  return (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const createCategory = async (data: SolutionCategoryFormData): Promise<SolutionCategory | { success: false, message: string }> => {
  const id = `sc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.name)
  
  const [existing] = await pool.query('SELECT id FROM solution_categories WHERE slug = ? OR name = ?', [slug, data.name])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

  await pool.query(
    'INSERT INTO solution_categories (id, name, slug, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name, slug, data.status, createdAt]
  )

  return { ...data, id, slug, createdAt }
}

export const updateCategory = async (id: string, data: SolutionCategoryFormData): Promise<SolutionCategory | undefined | { success: false, message: string }> => {
  const slug = toSlug(data.slug || data.name)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    const [existing] = await connection.query('SELECT id FROM solution_categories WHERE (slug = ? OR name = ?) AND id != ?', [slug, data.name, id])
    if ((existing as any[]).length > 0) {
      await connection.rollback()
      return { success: false, message: `A category with this name or slug already exists.` }
    }

    // get previous name
    const [rows] = await connection.query('SELECT name FROM solution_categories WHERE id = ?', [id])
    const oldName = (rows as any[])[0]?.name

    await connection.query(
      'UPDATE solution_categories SET name = ?, slug = ?, status = ? WHERE id = ?',
      [data.name.trim(), slug, data.status, id]
    )

    if (oldName && oldName !== data.name.trim()) {
      await connection.query(
        'UPDATE solutions SET category = ? WHERE category = ?',
        [data.name.trim(), oldName]
      )
    }

    await connection.commit()
    return { ...data, id, slug, createdAt: new Date().toISOString() }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const deleteCategory = async (id: string): Promise<void | { success: false, message: string }> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    // get previous name
    const [rows] = await connection.query('SELECT name FROM solution_categories WHERE id = ?', [id])
    const oldName = (rows as any[])[0]?.name

    if (oldName) {
      const [solutions] = await connection.query('SELECT COUNT(*) as count FROM solutions WHERE category = ?', [oldName])
      const count = (solutions as any[])[0].count
      if (count > 0) {
        await connection.rollback()
        return { success: false, message: `Cannot delete. This category is used in ${count} Solution(s).` }
      }
    }

    await connection.query('DELETE FROM solution_categories WHERE id = ?', [id])

    await connection.commit()
    revalidateTag('header-data')
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const findCategory = async (id: string): Promise<SolutionCategory | undefined> => {
  const categories = await readCategories()
  return categories.find((category) => category.id === id)
}


