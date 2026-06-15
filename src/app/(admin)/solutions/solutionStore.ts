'use server'

import pool from '@/lib/db'
import { toSlug } from './solutionHelpers'
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



export const readSolutions = async (): Promise<SolutionService[]> => {
  const [solutionsRow] = await pool.query('SELECT * FROM solutions ORDER BY sort_order ASC, created_at DESC')
  const solutions = solutionsRow as any[]

  if (solutions.length === 0) return []

  const solutionIds = solutions.map(s => s.id)
  
  const [featureCardsRow] = await pool.query('SELECT * FROM solution_feature_cards WHERE solution_id IN (?)', [solutionIds])
  const [stepsRow] = await pool.query('SELECT * FROM solution_implementation_steps WHERE solution_id IN (?)', [solutionIds])
  const [extraCardsRow] = await pool.query('SELECT * FROM solution_extra_cards WHERE solution_id IN (?)', [solutionIds])

  const featureCards = featureCardsRow as any[]
  const steps = stepsRow as any[]
  const extraCards = extraCardsRow as any[]

  return solutions.map(sol => ({
    id: sol.id,
    title: sol.title,
    subtitle: sol.subtitle || '',
    description: sol.description || '',
    category: sol.category || '',
    image: sol.image || '',
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
    featureCards: featureCards.filter(fc => fc.solution_id === sol.id).map(fc => ({
      id: fc.id,
      icon: fc.icon || '',
      image: fc.image || '',
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
    extraCards: extraCards.filter(ec => ec.solution_id === sol.id).map(ec => ({
      id: ec.id,
      heading: ec.heading || '',
      description: ec.description || '',
      image: ec.image || '',
      imageAlt: ec.image_alt || ''
    }))
  }))
}

export const createSolution = async (data: SolutionFormData): Promise<SolutionService> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const id = `s${Date.now()}`
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const slug = toSlug(data.slug || data.title)

    await connection.query(
      `INSERT INTO solutions (id, title, subtitle, description, category, image, image_alt, logo, logo_alt, slug, sort_order, status, meta_title, meta_description, meta_keywords, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title || '',
        data.subtitle || '',
        data.description || '',
        data.category || '',
        data.image || '',
        data.imageAlt || '',
        data.logo || '',
        data.logoAlt || '',
        slug,
        data.order || 0,
        data.status || 'active',
        data.metaTitle || '',
        data.metaDescription || '',
        data.metaKeywords || '',
        createdAt
      ]
    )

    if (data.featureCards?.length) {
      for (const fc of data.featureCards) {
        const fcId = `fc${Date.now()}${Math.floor(Math.random() * 1000)}`
        await connection.query(
          `INSERT INTO solution_feature_cards (id, solution_id, icon, image, image_alt, title, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [fcId, id, fc.icon || '', fc.image || '', fc.imageAlt || '', fc.title || '', fc.description || '']
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
        await connection.query(
          `INSERT INTO solution_extra_cards (id, solution_id, heading, description, image, image_alt) VALUES (?, ?, ?, ?, ?, ?)`,
          [ecId, id, ec.heading || '', ec.description || '', ec.image || '', ec.imageAlt || '']
        )
      }
    }

    await connection.commit()
    
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

export const updateSolution = async (id: string, data: SolutionFormData): Promise<SolutionService | undefined> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const slug = toSlug(data.slug || data.title)

    await connection.query(
      `UPDATE solutions SET title = ?, subtitle = ?, description = ?, category = ?, image = ?, image_alt = ?, logo = ?, logo_alt = ?, slug = ?, sort_order = ?, status = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE id = ?`,
      [
        data.title || '',
        data.subtitle || '',
        data.description || '',
        data.category || '',
        data.image || '',
        data.imageAlt || '',
        data.logo || '',
        data.logoAlt || '',
        slug,
        data.order || 0,
        data.status || 'active',
        data.metaTitle || '',
        data.metaDescription || '',
        data.metaKeywords || '',
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
          `INSERT INTO solution_feature_cards (id, solution_id, icon, image, image_alt, title, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [fcId, id, fc.icon || '', fc.image || '', fc.imageAlt || '', fc.title || '', fc.description || '']
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
        await connection.query(
          `INSERT INTO solution_extra_cards (id, solution_id, heading, description, image, image_alt) VALUES (?, ?, ?, ?, ?, ?)`,
          [ecId, id, ec.heading || '', ec.description || '', ec.image || '', ec.imageAlt || '']
        )
      }
    }

    await connection.commit()
    
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
}

export const findSolution = async (id: string): Promise<SolutionService | undefined> => {
  const solutions = await readSolutions()
  return solutions.find((solution) => solution.id === id)
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

export const createCategory = async (data: SolutionCategoryFormData): Promise<SolutionCategory> => {
  const id = `sc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.name)
  
  await pool.query(
    'INSERT INTO solution_categories (id, name, slug, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name, slug, data.status, createdAt]
  )

  return { ...data, id, slug, createdAt }
}

export const updateCategory = async (id: string, data: SolutionCategoryFormData): Promise<SolutionCategory | undefined> => {
  const slug = toSlug(data.slug || data.name)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
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

export const deleteCategory = async (id: string): Promise<void> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    // get previous name
    const [rows] = await connection.query('SELECT name FROM solution_categories WHERE id = ?', [id])
    const oldName = (rows as any[])[0]?.name

    await connection.query('DELETE FROM solution_categories WHERE id = ?', [id])

    if (oldName) {
      await connection.query(
        'UPDATE solutions SET category = ? WHERE category = ?',
        ['', oldName]
      )
    }

    await connection.commit()
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


